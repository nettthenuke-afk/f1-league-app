import json
import requests

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timezone, timedelta

from database import Base, engine, SessionLocal
from models import User, Team, Driver, Pick, Result, DraftState
from sync_f1_data import sync_all_f1_data
from models import (
    User,
    Pick,
    Result,
    Season,
    SeasonStanding
)

# ✅ GLOBAL CACHE
race_cache = []


# ✅ Create tables
Base.metadata.create_all(bind=engine)


def ensure_draft_state_columns():
    with engine.begin() as connection:
        columns = connection.execute(
            text("PRAGMA table_info(draft_state)")
        ).fetchall()

        column_names = {
            column[1]
            for column in columns
        }

        if "processed_race_id" not in column_names:
            connection.execute(
                text(
                    "ALTER TABLE draft_state "
                    "ADD COLUMN processed_race_id INTEGER"
                )
            )


# ✅ Add missing column to existing database
ensure_draft_state_columns()


app = FastAPI()

# ✅ Draft system
draft_state = {
    "race_id": 1,
    "pick_order": [],
    "current_index": 0,
    "tiers_locked": False,
    "picks_locked": False
}

# ✅ Populate cache and process completed race at startup
@app.on_event("startup")
def startup_sync():
    global race_cache

    db = SessionLocal()

    try:
        result = sync_all_f1_data()
        race_cache = result.get("race_result", [])

        processing_result = ensure_latest_race_processed(db)

        print("Startup sync complete:", processing_result)

    except Exception as error:
        db.rollback()
        print("Startup sync failed:", error)

    finally:
        db.close()


# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://f1-league-app-beryl.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Auth
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------- PICK LOCK HELPER ----------


def picks_are_locked():

    global race_cache

    if not race_cache:
        return False

    now = datetime.now(timezone.utc)

    future_races = []

    for race in race_cache:
        try:
            race_time = datetime.fromisoformat(
                race["date_start"].replace("Z", "+00:00")
            )

            if race_time > now:
                future_races.append((race_time, race))

        except Exception:
            continue

    if not future_races:
        return True

    future_races.sort(key=lambda x: x[0])

    race_time = future_races[0][0]

    # Lock picks 24 hours before race start
    qualifying_time = race_time - timedelta(days=1)

    return now >= qualifying_time

#-----Create Current Season----
def get_or_create_current_season(db):
    current_year = datetime.now().year

    season = (
        db.query(Season)
        .filter(Season.year == current_year)
        .first()
    )

    if season:
        return season

    # Disable previous seasons
    db.query(Season).update(
        {Season.active: False}
    )

    season = Season(
        year=current_year,
        active=True
    )

    db.add(season)
    db.commit()
    db.refresh(season)

    users = (
        db.query(User)
        .filter(User.role != "admin")
        .all()
    )

    for user in users:
        db.add(
            SeasonStanding(
                season_id=season.id,
                user_id=user.id,
                starting_points=0
            )
        )

    db.commit()

    return season

#---Race Specific Picks---
def get_current_race_id():

    global race_cache

    now = datetime.now(timezone.utc)

    future_races = []

    for index, race in enumerate(race_cache, start=1):

        try:
            race_time = datetime.fromisoformat(
                race["date_start"].replace("Z", "+00:00")
            )

            if race_time > now:
                future_races.append((race_time, index))

        except:
            continue

    if not future_races:
        return None

    future_races.sort(key=lambda x: x[0])

    return future_races[0][1]

def get_race_id_from_name(race_name):

    race_name = race_name.lower()

    for index, race in enumerate(race_cache, start=1):

        meeting = race["meeting_name"].lower()

        if race_name in meeting or meeting in race_name:
            return index

    return None

# ---------- AUTOMATIC RESULT HELPERS ----------
def fetch_latest_feature_race():
    url = "https://api.jolpi.ca/ergast/f1/current/last/results/"

    response = requests.get(url, timeout=20)
    response.raise_for_status()

    data = response.json()

    races = (
        data.get("MRData", {})
        .get("RaceTable", {})
        .get("Races", [])
    )

    return races[0] if races else None


def fetch_latest_sprint_race():
    url = "https://api.jolpi.ca/ergast/f1/current/last/sprint/"

    response = requests.get(url, timeout=20)
    response.raise_for_status()

    data = response.json()

    races = (
        data.get("MRData", {})
        .get("RaceTable", {})
        .get("Races", [])
    )

    return races[0] if races else None


def load_feature_results_for_race(db: Session, race: dict):
    race_name = race.get("raceName", "")
    race_id = get_race_id_from_name(race_name)

    if not race_id:
        raise RuntimeError(f"Could not map race: {race_name}")

    race_results = race.get("Results", [])

    if not race_results:
        raise RuntimeError(
            f"No feature results available for {race_name}"
        )

    db.query(Result).filter(
        Result.race_id == race_id,
        Result.race_type == "feature"
    ).delete(synchronize_session=False)

    loaded = 0

    for result_data in race_results:
        driver_api_id = (
            result_data.get("Driver", {}).get("driverId")
        )

        driver = (
            db.query(Driver)
            .filter(Driver.driver_api_id == driver_api_id)
            .first()
        )

        if not driver:
            print("Skipping unmatched driver:", driver_api_id)
            continue

        db.add(
            Result(
                race_id=race_id,
                driver_id=driver.id,
                finishing_position=int(result_data["position"]),
                points=int(float(result_data.get("points", 0))),
                race_type="feature"
            )
        )

        loaded += 1

    return {
        "race": race_name,
        "race_id": race_id,
        "loaded": loaded
    }


def load_sprint_results_for_race(db: Session, race: dict):
    race_name = race.get("raceName", "")
    race_id = get_race_id_from_name(race_name)

    if not race_id:
        raise RuntimeError(f"Could not map sprint race: {race_name}")

    sprint_results = race.get("SprintResults", [])

    if not sprint_results:
        return {
            "race": race_name,
            "race_id": race_id,
            "loaded": 0
        }

    db.query(Result).filter(
        Result.race_id == race_id,
        Result.race_type == "sprint"
    ).delete(synchronize_session=False)

    loaded = 0

    for result_data in sprint_results:
        driver_api_id = (
            result_data.get("Driver", {}).get("driverId")
        )

        driver = (
            db.query(Driver)
            .filter(Driver.driver_api_id == driver_api_id)
            .first()
        )

        if not driver:
            print("Skipping unmatched sprint driver:", driver_api_id)
            continue

        db.add(
            Result(
                race_id=race_id,
                driver_id=driver.id,
                finishing_position=int(result_data["position"]),
                points=int(float(result_data.get("points", 0))),
                race_type="sprint"
            )
        )

        loaded += 1

    return {
        "race": race_name,
        "race_id": race_id,
        "loaded": loaded
    }


def calculate_pick_order_for_race(db: Session, race_id: int):
    users = (
        db.query(User)
        .filter(User.role != "admin")
        .all()
    )

    user_scores = []

    for user in users:
        pick = (
            db.query(Pick)
            .filter(
                Pick.user_id == user.id,
                Pick.tier == 1,
                Pick.race_id == race_id
            )
            .first()
        )

        score = 0
        finish_position = 999

        if pick:
            result = (
                db.query(Result)
                .filter(
                    Result.driver_id == pick.driver_id,
                    Result.race_type == "feature",
                    Result.race_id == race_id
                )
                .first()
            )

            if result:
                score = result.points or 0
                finish_position = result.finishing_position or 999

        user_scores.append({
            "user_id": user.id,
            "score": score,
            "finish_position": finish_position
        })

    sorted_users = sorted(
        user_scores,
        key=lambda item: (
            item["score"],
            -item["finish_position"]
        )
    )

    return [item["user_id"] for item in sorted_users]


def calculate_pick_order_from_previous_race(db: Session):
    latest_race_row = (
        db.query(Result.race_id)
        .filter(Result.race_type == "feature")
        .order_by(Result.race_id.desc())
        .first()
    )

    if not latest_race_row:
        raise HTTPException(
            status_code=400,
            detail="No race results available"
        )

    return calculate_pick_order_for_race(
        db,
        latest_race_row[0]
    )


def ensure_latest_race_processed(db: Session):
    """
    Load the latest completed race and create the next draft order once.

    If an existing draft order predates this automation, adopt it without
    resetting the current draft.
    """

    try:
        latest_race = fetch_latest_feature_race()

        if not latest_race:
            return {"status": "no_feature_results"}

        race_name = latest_race.get("raceName", "")
        race_id = get_race_id_from_name(race_name)

        if not race_id:
            return {
                "status": "race_not_mapped",
                "race": race_name
            }

        state = db.query(DraftState).first()

        if not state:
            state = DraftState(
                current_index=0,
                pick_order_json="[]",
                processed_race_id=None
            )
            db.add(state)
            db.flush()

        if state.processed_race_id == race_id:
            return {
                "status": "already_processed",
                "race": race_name,
                "race_id": race_id
            }

        existing_order = json.loads(
            state.pick_order_json or "[]"
        )

        # Protect the currently active draft when this feature is first deployed.
        if state.processed_race_id is None and existing_order:
            state.processed_race_id = race_id
            db.commit()

            return {
                "status": "adopted_existing_order",
                "race": race_name,
                "race_id": race_id,
                "pick_order": existing_order
            }

        feature_result = load_feature_results_for_race(
            db,
            latest_race
        )

        sprint_loaded = 0

        latest_sprint = fetch_latest_sprint_race()

        if latest_sprint:
            sprint_name = latest_sprint.get("raceName", "")
            sprint_race_id = get_race_id_from_name(sprint_name)

            # Only attach sprint results when they belong to the same weekend.
            if sprint_race_id == race_id:
                sprint_result = load_sprint_results_for_race(
                    db,
                    latest_sprint
                )
                sprint_loaded = sprint_result["loaded"]

        pick_order = calculate_pick_order_for_race(
            db,
            race_id
        )

        state.pick_order_json = json.dumps(pick_order)
        state.current_index = 0
        state.processed_race_id = race_id

        db.commit()

        return {
            "status": "processed",
            "race": race_name,
            "race_id": race_id,
            "feature_results_loaded": feature_result["loaded"],
            "sprint_results_loaded": sprint_loaded,
            "pick_order": pick_order
        }

    except Exception as error:
        db.rollback()
        print("Automatic post-race processing failed:", error)

        return {
            "status": "error",
            "detail": str(error)
        }


# ---------- MODELS ----------
class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "user"


class LoginRequest(BaseModel):
    username: str
    password: str


# ---------- BASIC ----------
@app.get("/")
def root():
    return {"message": "F1 League API is running"}

# ---------- USERS ----------
@app.get("/users")
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [{"id": u.id, "username": u.username, "role": u.role} for u in users]


@app.post("/users")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == user.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username exists")

    new_user = User(
        username=user.username,
        password_hash=pwd_context.hash(user.password),
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"id": new_user.id, "username": new_user.username, "role": new_user.role}

# ------LOGIN-----
@app.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
    User.username.ilike(data.username)
).first()

    if not user or not pwd_context.verify(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid login")

    return {
        "user": {
            "id": user.id,
            "username": user.username,
            "role": user.role
        }
    }


# ✅ MANUAL SYNC (no spam)
@app.post("/sync-f1-data")
def sync_f1_data_now(db: Session = Depends(get_db)):
    global race_cache

    result = sync_all_f1_data()
    race_cache = result.get("race_result", [])

    return {
        "message": "Sync complete",
        "race_count": len(race_cache)
    }

#---Austrian GP Manual Entry---
@app.post("/load-austria-results")
def load_austria_results(db: Session = Depends(get_db)):

    import requests

    url = "https://api.jolpi.ca/ergast/f1/current/last/results/"

    response = requests.get(url)
    data = response.json()

    races = (
        data.get("MRData", {})
        .get("RaceTable", {})
        .get("Races", [])
    )

    if not races:
        raise HTTPException(
            status_code=400,
            detail="No race results returned"
        )

    race = races[0]

    race_id = get_race_id_from_name(
        "Austrian Grand Prix"
    )

    # Clear existing Austria results if rerun
    db.query(Result).filter(
        Result.race_id == race_id,
        Result.race_type == "feature"
    ).delete()

    for r in race.get("Results", []):

        api_driver_id = r["Driver"]["driverId"]

        driver = (
            db.query(Driver)
            .filter(Driver.driver_api_id == api_driver_id)
            .first()
        )

        if not driver:
            continue

        db.add(
            Result(
                race_id=race_id,
                driver_id=driver.id,
                finishing_position=int(r["position"]),
                points=int(float(r["points"])),
                race_type="feature"
            )
        )

    db.commit()

    return {
        "message": "Austria results loaded",
        "result_count": len(race.get("Results", []))
    }

@app.post("/fix-austria-result-race-id")
def fix_austria_result_race_id(
    db: Session = Depends(get_db)
):

    results = (
        db.query(Result)
        .filter(Result.race_id == 1)
        .all()
    )

    austria_race_id = get_race_id_from_name(
        "Austrian Grand Prix"
    )

    for result in results:
        result.race_id = austria_race_id

    db.commit()

    return {
        "updated": len(results)
    }

@app.post("/fix-austria-pick-race-id")
def fix_austria_pick_race_id(
    db: Session = Depends(get_db)
):

    picks = (
        db.query(Pick)
        .filter(Pick.race_id == 1)
        .all()
    )

    austria_race_id = get_race_id_from_name(
        "Austrian Grand Prix"
    )

    for pick in picks:
        pick.race_id = austria_race_id

    db.commit()

    return {
        "updated": len(picks)
    }

# ---------- DRAFT ----------
@app.post("/set-pick-order")
def set_pick_order(
    order: list[int],
    db: Session = Depends(get_db)
):
    state = db.query(DraftState).first()

    if not state:
        state = DraftState()
        db.add(state)

    state.pick_order_json = json.dumps(order)
    state.current_index = 0

    db.commit()

    draft_state["tiers_locked"] = True

    return {
        "message": "Pick order set",
        "pick_order": order
    }


@app.get("/draft-status")
def get_draft_status(
    db: Session = Depends(get_db)
):
    automatic_update = ensure_latest_race_processed(db)

    state = db.query(DraftState).first()

    if not state:
        return {
            "current_user_id": None,
            "pick_index": 0,
            "pick_order": [],
            "draft_complete": False,
            "automatic_update": automatic_update
        }

    try:
        pick_order = json.loads(
            state.pick_order_json or "[]"
        )
    except json.JSONDecodeError:
        pick_order = []

    if not pick_order:
        return {
            "current_user_id": None,
            "pick_index": 0,
            "pick_order": [],
            "draft_complete": False,
            "processed_race_id": state.processed_race_id,
            "automatic_update": automatic_update
        }

    draft_complete = (
        state.current_index >= len(pick_order)
    )

    current_user_id = (
        None
        if draft_complete
        else pick_order[state.current_index]
    )

    return {
        "current_user_id": current_user_id,
        "pick_index": state.current_index,
        "pick_order": pick_order,
        "draft_complete": draft_complete,
        "processed_race_id": state.processed_race_id,
        "automatic_update": automatic_update
    }


# Draft order rule:
# 1. Lowest Tier 1 feature-race points drafts first.
# 2. If tied, worst finishing position drafts first.
# 3. The most recently completed feature race is used.
@app.post("/generate-pick-order")
def generate_pick_order(
    db: Session = Depends(get_db)
):
    latest_race_row = (
        db.query(Result.race_id)
        .filter(Result.race_type == "feature")
        .order_by(Result.race_id.desc())
        .first()
    )

    if not latest_race_row:
        raise HTTPException(
            status_code=400,
            detail="No race results available"
        )

    latest_race_id = latest_race_row[0]

    pick_order = calculate_pick_order_for_race(
        db,
        latest_race_id
    )

    state = db.query(DraftState).first()

    if not state:
        state = DraftState()
        db.add(state)

    state.pick_order_json = json.dumps(pick_order)
    state.current_index = 0
    state.processed_race_id = latest_race_id

    db.commit()

    return {
        "race_id": latest_race_id,
        "pick_order": pick_order
    }


# ---------- PICKS ----------
@app.post("/submit-picks")
def submit_picks(data: dict, db: Session = Depends(get_db)):

    if picks_are_locked():
        raise HTTPException(
            status_code=400,
            detail="Picks are locked for this race weekend"
        )

    state = db.query(DraftState).first()

    if not state:
        raise HTTPException(
            status_code=400,
            detail="Draft state not initialized"
        )

    pick_order = json.loads(state.pick_order_json)

    if not pick_order:
        raise HTTPException(
            status_code=400,
            detail="Pick order not set"
        )

    if state.current_index >= len(pick_order):
        raise HTTPException(
            status_code=400,
            detail="Draft is already complete"
        )

    current_user = pick_order[state.current_index]

    if data["user_id"] != current_user:
        raise HTTPException(
            status_code=403,
            detail="Not your turn"
        )

    picks = data["picks"]

    required_tiers = ["tier1", "tier2"]

    for tier in required_tiers:
        if not picks.get(tier):
            raise HTTPException(
                status_code=400,
                detail=f"Missing required pick: {tier}"
            )

    current_race_id = get_current_race_id()

    db.query(Pick).filter(
        Pick.user_id == data["user_id"],
        Pick.race_id == current_race_id
    ).delete()

    db.add(
        Pick(
            user_id=data["user_id"],
            driver_id=picks["tier1"],
            race_id=current_race_id,
            tier=1
        )
    )

    db.add(
        Pick(
            user_id=data["user_id"],
            driver_id=picks["tier2"],
            race_id=current_race_id,
            tier=2
        )
    )

    db.commit()

    state.current_index = min(
        state.current_index + 1,
        len(pick_order)
    )
    db.commit()

    return {"message": "Picks saved"}
# ---------- PICK OPTIONS ----------
@app.get("/pick-options")
def get_pick_options(db: Session = Depends(get_db)):

    drivers = db.query(Driver).filter(
        Driver.is_active == True
    ).all()

    response = {
        "tier1": [],
        "tier2": [],
        "tier3": []
    }

    current_race_id = get_current_race_id()

    for d in drivers:

        entry = {
            "id": d.id,
            "name": d.name,
            "team": d.team.name if d.team else "",
            "taken_by": None
        }

        pick = db.query(Pick).filter(
            Pick.driver_id == d.id,
            Pick.race_id == current_race_id
        ).first()

        if pick:
            u = db.query(User).filter(
                User.id == pick.user_id
            ).first()

            if u:
                entry["taken_by"] = u.username

        if d.team.tier == 1:
            response["tier1"].append(entry)

        elif d.team.tier == 2:
            response["tier2"].append(entry)

        else:
            response["tier3"].append(entry)

    return response

# ---------- CURRENT RACE ----------
@app.get("/current-race")
def get_current_race():
    try:
        global race_cache

        if not race_cache:
            return {
                "race_name": "No race data",
                "race_time": None,
                "status": "Run Sync"
            }

        now = datetime.now(timezone.utc)

        future_races = []

        for race in race_cache:
            try:
                race_time = datetime.fromisoformat(
                    race["date_start"].replace("Z", "+00:00")
                )
                if race_time > now:
                    future_races.append((race_time, race))
            except:
                continue

        if not future_races:
            return {
                "race_name": "No upcoming race",
                "race_time": None,
                "status": "Off Season"
            }

        future_races.sort(key=lambda x: x[0])
        upcoming = future_races[0][1]

        return {
            "race_name": upcoming["meeting_name"],
            "race_time": upcoming["date_start"],
            "status": "Picks Locked" if picks_are_locked() else "Picks Open"
        }

    except Exception as e:
        print("CURRENT RACE ERROR:", e)
        return {
            "race_name": "Error loading race",
            "race_time": None,
            "status": "Error"
        }

#-------Set Team Tier-------
@app.post("/set-team-tier")
def set_team_tier(data: dict, db: Session = Depends(get_db)):

    # ✅ LOCK CHECK (properly indented)
    if draft_state.get("tiers_locked"):
        raise HTTPException(
            status_code=400,
            detail="Tiers are locked during draft"
        )

    team_id = data.get("team_id")
    tier = data.get("tier")

    if tier not in [1, 2, 3]:
        raise HTTPException(status_code=400, detail="Invalid tier")

    team = db.query(Team).filter(Team.id == team_id).first()

    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    team.tier = tier
    db.commit()

    return {
        "message": f"{team.name} set to Tier {tier}"
    }

@app.get("/teams")
def get_teams(db: Session = Depends(get_db)):
    teams = db.query(Team).all()

    return [
        {
            "team_id": t.id,
            "name": t.name,
            "tier": t.tier
        }
        for t in teams
    ]

#----Reset Picks----
@app.post("/reset-picks")
def reset_picks(db: Session = Depends(get_db)):
    db.query(Pick).delete()
    db.commit()

    draft_state["pick_order"] = []
    draft_state["current_index"] = 0

    # ✅ UNLOCK tiers
    draft_state["tiers_locked"] = False

    return {"message": "Picks cleared"}

#---Dedub---
@app.get("/debug-drivers")
def debug_drivers(db: Session = Depends(get_db)):
    drivers = db.query(Driver).all()

    return [
        {
            "id": d.id,
            "name": d.name,
            "driver_api_id": d.driver_api_id
        }
        for d in drivers[:10]
    ]

#---Austria Picks---
@app.post("/load-austria-picks")
def load_austria_picks(db: Session = Depends(get_db)):

    race_id = 1  # Austria

    db.query(Pick).filter(Pick.race_id == race_id).delete()

    picks = [
        # Travis
        (1, "Antonelli", 1),
        (1, "Gasly", 2),

        # Rocky
        (2, "Piastri", 1),
        (2, "Sainz", 2),

        # Jake
        (3, "Norris", 1),
        (3, "Lindblad", 2),

        # Tyler
        (4, "Leclerc", 1),
        (4, "Lawson", 2),

        # Sam
        (5, "Hamilton", 1),
        (5, "Albon", 2),

        # Mike
        (6, "Russell", 1),
        (6, "Colapinto", 2),
    ]

    created = 0

    for user_id, driver_name, tier in picks:

        driver = (
            db.query(Driver)
            .filter(Driver.name.ilike(f"%{driver_name}%"))
            .first()
        )

        if not driver:
            continue

        db.add(
            Pick(
                user_id=user_id,
                driver_id=driver.id,
                race_id=race_id,
                tier=tier
            )
        )

        created += 1

    db.commit()

    return {
        "message": "Austria picks loaded",
        "pick_count": created
    }

#---Debug Race ID---
@app.get("/debug-race-id")
def debug_race_id():
    return {
        "current_race_id": get_current_race_id()
    }

#---Debug Picks---
@app.get("/debug-picks")
def debug_picks(db: Session = Depends(get_db)):

    picks = db.query(Pick).all()

    return [
        {
            "user_id": p.user_id,
            "driver_id": p.driver_id,
            "race_id": p.race_id,
            "tier": p.tier
        }
        for p in picks
    ]

#---Standings Endpoint---
@app.get("/standings")
def get_standings(db: Session = Depends(get_db)):

    active_season = get_or_create_current_season(db)

    users = (
        db.query(User)
        .filter(User.role != "admin")
        .all()
    )

    standings = []

    for user in users:

        total_points = 0

        season_row = (
            db.query(SeasonStanding)
            .filter(
                SeasonStanding.season_id == active_season.id,
                SeasonStanding.user_id == user.id
            )
            .first()
        )

        if season_row:
            total_points = season_row.starting_points

        picks = (
            db.query(Pick)
            .filter(Pick.user_id == user.id)
            .all()
        )

        for pick in picks:

            results = (
                db.query(Result)
                .filter(
                    Result.race_id == pick.race_id,
                    Result.driver_id == pick.driver_id
                )
                .all()
            )

            for result in results:
                total_points += result.points or 0
        standings.append({
            "user_id": user.id,
            "username": user.username,
            "points": total_points
        })

    standings.sort(
        key=lambda x: x["points"],
        reverse=True
    )

    return standings

#---Debug Results---
@app.get("/debug-results")
def debug_results(db: Session = Depends(get_db)):

    results = db.query(Result).all()

    return [
        {
            "race_id": r.race_id,
            "driver_id": r.driver_id,
            "points": r.points,
            "position": r.finishing_position
        }
        for r in results[:50]
    ]

#---Debug Picks---
@app.get("/debug-picks")
def debug_picks(db: Session = Depends(get_db)):

    picks = db.query(Pick).all()

    return [
        {
            "user_id": p.user_id,
            "driver_id": p.driver_id,
            "race_id": p.race_id,
            "tier": p.tier
        }
        for p in picks
    ]

#----Debug Race Cache----
@app.get("/debug-race-cache")
def debug_race_cache():
    return race_cache[:3]

#----Clear Race Picks----
@app.post("/clear-race-picks/{race_id}")
def clear_race_picks(
    race_id: int,
    db: Session = Depends(get_db)
):

    count = (
        db.query(Pick)
        .filter(Pick.race_id == race_id)
        .delete()
    )

    db.commit()

    return {
        "deleted": count,
        "race_id": race_id
    }

#----Initialize Draft State-----
@app.post("/initialize-draft-state")
def initialize_draft_state(
    db: Session = Depends(get_db)
):

    state = db.query(DraftState).first()

    if state:
        return {
            "message": "Draft state already exists"
        }

    state = DraftState(
        current_index=0,
        pick_order_json="[]"
    )

    db.add(state)

    db.commit()

    return {
        "message": "Draft state created"
    }

#----Hall of Champions----
@app.get("/hall-of-champions")
def hall_of_champions(db: Session = Depends(get_db)):

    seasons = (
        db.query(Season)
        .order_by(Season.year)
        .all()
    )

    results = []

    for season in seasons:

        champion = None

        if season.champion_user_id:
            user = (
                db.query(User)
                .filter(User.id == season.champion_user_id)
                .first()
            )

            if user:
                champion = user.username

        results.append({
            "year": season.year,
            "champion": champion
        })

    return results

#----Lifetime Standings----
@app.get("/lifetime-standings")
def lifetime_standings(db: Session = Depends(get_db)):

    users = (
        db.query(User)
        .filter(User.role != "admin")
        .all()
    )

    standings = []

    for user in users:

        total_points = 0

        season_rows = (
            db.query(SeasonStanding)
            .filter(SeasonStanding.user_id == user.id)
            .all()
        )

        for row in season_rows:
            total_points += row.starting_points

        picks = (
            db.query(Pick)
            .filter(Pick.user_id == user.id)
            .all()
        )

        for pick in picks:

            results = (
                db.query(Result)
                .filter(
                    Result.race_id == pick.race_id,
                    Result.driver_id == pick.driver_id
                )
                .all()
            )

            for result in results:
                total_points += result.points or 0
        standings.append({
            "username": user.username,
            "points": total_points
        })

    standings.sort(
        key=lambda x: x["points"],
        reverse=True
    )

    return standings

#----Load Latest Race Results----
@app.post("/load-latest-race-results")
def load_latest_race_results(
    db: Session = Depends(get_db)
):
    race = fetch_latest_feature_race()

    if not race:
        raise HTTPException(
            status_code=400,
            detail="No race results returned"
        )

    result = load_feature_results_for_race(db, race)
    db.commit()

    return result


#-----Load Latest Sprint Results-----
@app.post("/load-latest-sprint-results")
def load_latest_sprint_results(
    db: Session = Depends(get_db)
):
    race = fetch_latest_sprint_race()

    if not race:
        return {
            "message": "No sprint results available"
        }

    result = load_sprint_results_for_race(db, race)
    db.commit()

    return result


#-----Weekly Wins-----
@app.get("/weekly-wins")
def get_weekly_wins(db: Session = Depends(get_db)):

    users = (
        db.query(User)
        .filter(User.role != "admin")
        .all()
    )

    race_ids = (
        db.query(Result.race_id)
        .distinct()
        .all()
    )

    race_ids = [r[0] for r in race_ids]

    win_totals = {
        user.id: 0
        for user in users
    }

    for race_id in race_ids:

        race_scores = []

        for user in users:

            total_points = 0

            picks = (
                db.query(Pick)
                .filter(
                    Pick.user_id == user.id,
                    Pick.race_id == race_id
                )
                .all()
            )

            for pick in picks:

                results = (
                    db.query(Result)
                    .filter(
                        Result.race_id == race_id,
                        Result.driver_id == pick.driver_id
                    )
                    .all()
                )

                for result in results:
                    total_points += result.points or 0

            race_scores.append({
                "user_id": user.id,
                "points": total_points
            })

        if not race_scores:
            continue

        winning_score = max(
            score["points"]
            for score in race_scores
        )

        winners = [
            score["user_id"]
            for score in race_scores
            if score["points"] == winning_score
        ]

        for winner in winners:
            win_totals[winner] += 1

    standings = []

    for user in users:
        standings.append({
            "username": user.username,
            "wins": win_totals[user.id]
        })

    standings.sort(
        key=lambda x: x["wins"],
        reverse=True
    )

    return standings

#-----Weekly Last Places-----
@app.get("/weekly-last-places")
def get_weekly_last_places(db: Session = Depends(get_db)):

    users = (
        db.query(User)
        .filter(User.role != "admin")
        .all()
    )

    race_ids = (
        db.query(Result.race_id)
        .distinct()
        .all()
    )

    race_ids = [r[0] for r in race_ids]

    last_place_totals = {
        user.id: 0
        for user in users
    }

    for race_id in race_ids:

        race_scores = []

        for user in users:

            total_points = 0

            picks = (
                db.query(Pick)
                .filter(
                    Pick.user_id == user.id,
                    Pick.race_id == race_id
                )
                .all()
            )

            for pick in picks:

                results = (
                    db.query(Result)
                    .filter(
                        Result.race_id == race_id,
                        Result.driver_id == pick.driver_id
                    )
                    .all()
                )

                for result in results:
                    total_points += result.points or 0

            race_scores.append({
                "user_id": user.id,
                "points": total_points
            })

        if not race_scores:
            continue

        lowest_score = min(
            score["points"]
            for score in race_scores
        )

        losers = [
            score["user_id"]
            for score in race_scores
            if score["points"] == lowest_score
        ]

        for loser in losers:
            last_place_totals[loser] += 1

    standings = []

    for user in users:
        standings.append({
            "username": user.username,
            "last_places": last_place_totals[user.id]
        })

    standings.sort(
        key=lambda x: (-x["last_places"], x["username"])
    )

    return standings

# ----- Most Zero Point Weeks -----

@app.get("/zero-point-weeks")
def get_zero_point_weeks(db: Session = Depends(get_db)):

    users = (
        db.query(User)
        .filter(User.role != "admin")
        .all()
    )

    race_ids = (
        db.query(Result.race_id)
        .distinct()
        .all()
    )

    race_ids = [r[0] for r in race_ids]

    zero_point_totals = {
        user.id: 0
        for user in users
    }

    for race_id in race_ids:

        for user in users:

            total_points = 0

            picks = (
                db.query(Pick)
                .filter(
                    Pick.user_id == user.id,
                    Pick.race_id == race_id
                )
                .all()
            )

            for pick in picks:

                results = (
                    db.query(Result)
                    .filter(
                        Result.race_id == race_id,
                        Result.driver_id == pick.driver_id
                    )
                    .all()
                )

                for result in results:
                    total_points += result.points or 0

            if total_points == 0:
                zero_point_totals[user.id] += 1

    standings = []

    for user in users:
        standings.append({
            "username": user.username,
            "zero_point_weeks": zero_point_totals[user.id]
        })

    standings.sort(
        key=lambda x: (-x["zero_point_weeks"], x["username"])
    )

    return standings

# ---- Driver Pick History ----
@app.get("/driver-history")
def driver_history(db: Session = Depends(get_db)):

    picks = db.query(Pick).all()

    drivers = db.query(Driver).all()

    driver_names = {
        driver.id: driver.name
        for driver in drivers
    }

    driver_stats = {}

    live_race_ids = set()

    for pick in picks:

        driver_name = driver_names.get(pick.driver_id)

        if not driver_name:
            continue

        live_race_ids.add(pick.race_id)

        if driver_name not in driver_stats:
            driver_stats[driver_name] = {
                "picks": 0,
                "race_ids": set()
            }

        # Total number of times the driver was selected
        driver_stats[driver_name]["picks"] += 1

        # Number of distinct race weekends where the driver
        # was selected by at least one owner
        driver_stats[driver_name]["race_ids"].add(
            pick.race_id
        )

    rows = []

    for driver_name, stats in driver_stats.items():
        rows.append({
            "driver": driver_name,
            "picks": stats["picks"],
            "pickedRaces": len(stats["race_ids"])
        })

    rows.sort(
        key=lambda row: (
            -row["picks"],
            row["driver"]
        )
    )

    return {
        "rows": rows,
        "liveRaceCount": len(live_race_ids)
    }

# ---- Owner History ----
@app.get("/owner-history")
def owner_history(db: Session = Depends(get_db)):
    """
    Return live owner/driver aggregates from Picks and Results.

    Response structure intentionally matches
    HISTORICAL_OWNER_DRIVER_STATS in ownerHistory.js.
    """

    users = (
        db.query(User)
        .filter(User.role != "admin")
        .all()
    )

    drivers = db.query(Driver).all()

    user_names = {
        user.id: user.username
        for user in users
    }

    driver_names = {
        driver.id: driver.name
        for driver in drivers
    }

    # Add feature and sprint points together for each race/driver.
    result_points = {}

    results = db.query(Result).all()

    for result in results:
        key = (result.race_id, result.driver_id)

        result_points[key] = (
            result_points.get(key, 0)
            + (result.points or 0)
        )

    owners = {}

    for user in users:
        owners[user.username] = {
            "all": {},
            "tier1": {},
            "tier2": {}
        }

    picks = db.query(Pick).all()

    for pick in picks:
        owner = user_names.get(pick.user_id)
        driver = driver_names.get(pick.driver_id)

        if not owner or not driver:
            continue

        tier_key = "tier2" if pick.tier == 2 else "tier1"

        points = result_points.get(
            (pick.race_id, pick.driver_id),
            0
        )

        if owner not in owners:
            owners[owner] = {
                "all": {},
                "tier1": {},
                "tier2": {}
            }

        if driver not in owners[owner]["all"]:
            owners[owner]["all"][driver] = {
                "picks": 0,
                "points": 0
            }

        if driver not in owners[owner][tier_key]:
            owners[owner][tier_key][driver] = {
                "picks": 0,
                "points": 0
            }

        owners[owner]["all"][driver]["picks"] += 1
        owners[owner]["all"][driver]["points"] += points

        owners[owner][tier_key][driver]["picks"] += 1
        owners[owner][tier_key][driver]["points"] += points

    return {
        "owners": owners
    }
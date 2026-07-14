import requests
from sqlalchemy.orm import Session

import json
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError

from database import SessionLocal
from models import Team, Driver


JOLPICA_BASE = "https://api.jolpi.ca/ergast/f1"

CURRENT_CONSTRUCTORS_URL = f"{JOLPICA_BASE}/current/constructors/"
CURRENT_CONSTRUCTOR_STANDINGS_URL = f"{JOLPICA_BASE}/current/constructorstandings/"
LATEST_RESULTS_URL = f"{JOLPICA_BASE}/current/last/results/"


def fetch_json(url: str) -> dict:
    req = Request(
        url,
        headers={
            "User-Agent": "f1-league-app/1.0"
        }
    )

    with urlopen(req, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def get_default_tiers_from_constructor_standings():
    """
    Creates initial/default tiers based on current constructor standings.

    This only gets used when a team has no tier yet.
    Existing/admin-set tiers are preserved.

    Rule:
    - Top 3 teams -> Tier 1
    - Bottom 3 teams -> Tier 3
    - Everyone else -> Tier 2
    """
    try:
        data = fetch_json(CURRENT_CONSTRUCTOR_STANDINGS_URL)

        standings_lists = (
            data.get("MRData", {})
            .get("StandingsTable", {})
            .get("StandingsLists", [])
        )

        if not standings_lists:
            return {}

        standings = standings_lists[0].get("ConstructorStandings", [])
        total = len(standings)

        default_tiers = {}

        for index, item in enumerate(standings):
            constructor = item.get("Constructor", {})
            constructor_id = constructor.get("constructorId")

            if not constructor_id:
                continue

            position = index + 1

            if position <= 3:
                default_tiers[constructor_id] = 1
            elif position > total - 3:
                default_tiers[constructor_id] = 3
            else:
                default_tiers[constructor_id] = 2

        return default_tiers

    except Exception as e:
        print("Could not load constructor standings for default tiers:", e)
        return {}


def sync_teams():
    """
    Sync current F1 teams from API.

    Important:
    - New teams get an initial default tier
    - Existing teams keep their existing tier
    - Admin changes are NOT overwritten by future syncs
    """
    try:
        data = fetch_json(CURRENT_CONSTRUCTORS_URL)
    except HTTPError as e:
        raise RuntimeError(f"HTTP error pulling teams: {e.code} {e.reason}")
    except URLError as e:
        raise RuntimeError(f"Network error pulling teams: {e.reason}")
    except Exception as e:
        raise RuntimeError(f"Unexpected error pulling teams: {e}")

    constructors = (
        data.get("MRData", {})
        .get("ConstructorTable", {})
        .get("Constructors", [])
    )

    default_tiers = get_default_tiers_from_constructor_standings()

    db = SessionLocal()

    try:
        seen_constructor_ids = set()

        for constructor in constructors:
            constructor_id = constructor.get("constructorId")
            team_name = constructor.get("name")

            if not constructor_id or not team_name:
                continue

            seen_constructor_ids.add(constructor_id)

            team = (
                db.query(Team)
                .filter(Team.constructor_api_id == constructor_id)
                .first()
            )

            if not team:
                team = db.query(Team).filter(Team.name == team_name).first()

            if team:
                team.name = team_name
                team.constructor_api_id = constructor_id
                team.is_active = True

                # Preserve existing/admin-selected tier
                if team.tier is None:
                    team.tier = default_tiers.get(constructor_id, 2)
            else:
                db.add(
                    Team(
                        name=team_name,
                        constructor_api_id=constructor_id,
                        is_active=True,
                        tier=default_tiers.get(constructor_id, 2)
                    )
                )

        # Mark teams not found in current API feed inactive
        existing_teams = db.query(Team).all()

        for team in existing_teams:
            if team.constructor_api_id and team.constructor_api_id not in seen_constructor_ids:
                team.is_active = False

        db.commit()

        return {
            "status": "ok",
            "teams_synced": len(constructors)
        }

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def sync_drivers():
    """
    Sync current active race drivers from latest race results.

    This avoids pulling reserve/test drivers from /current/drivers.
    It links each driver to their current team using Constructor data from results.
    """
    try:
        data = fetch_json(LATEST_RESULTS_URL)
    except HTTPError as e:
        raise RuntimeError(f"HTTP error pulling latest results: {e.code} {e.reason}")
    except URLError as e:
        raise RuntimeError(f"Network error pulling latest results: {e.reason}")
    except Exception as e:
        raise RuntimeError(f"Unexpected error pulling latest results: {e}")

    races = (
        data.get("MRData", {})
        .get("RaceTable", {})
        .get("Races", [])
    )

    db = SessionLocal()

    try:
        seen_driver_ids = set()

        for race in races:
            results = race.get("Results", [])

            for result in results:
                driver_data = result.get("Driver", {})
                constructor_data = result.get("Constructor", {})

                driver_id = driver_data.get("driverId")
                given_name = driver_data.get("givenName", "")
                family_name = driver_data.get("familyName", "")
                driver_name = f"{given_name} {family_name}".strip()

                constructor_id = constructor_data.get("constructorId")
                team_name = constructor_data.get("name")

                if not driver_id or not driver_name:
                    continue

                seen_driver_ids.add(driver_id)

                team = None

                if constructor_id:
                    team = (
                        db.query(Team)
                        .filter(Team.constructor_api_id == constructor_id)
                        .first()
                    )

                # Defensive fallback if team somehow was not synced yet
                if not team and team_name:
                    team = db.query(Team).filter(Team.name == team_name).first()

                if not team and team_name:
                    team = Team(
                        name=team_name,
                        constructor_api_id=constructor_id,
                        is_active=True,
                        tier=2
                    )
                    db.add(team)
                    db.flush()

                driver = (
                    db.query(Driver)
                    .filter(Driver.driver_api_id == driver_id)
                    .first()
                )

                if driver:
                    driver.name = driver_name
                    driver.team_id = team.id if team else None
                    driver.is_active = True
                else:
                    db.add(
                        Driver(
                            name=driver_name,
                            driver_api_id=driver_id,
                            team_id=team.id if team else None,
                            is_active=True
                        )
                    )

        # Mark anyone not in latest race results inactive
        existing_drivers = db.query(Driver).all()

        for driver in existing_drivers:
            if driver.driver_api_id and driver.driver_api_id not in seen_driver_ids:
                driver.is_active = False

        db.commit()

        return {
            "status": "ok",
            "drivers_synced": len(seen_driver_ids)
        }

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

def sync_all_f1_data():

    teams = sync_teams()
    drivers = sync_drivers()
    races = sync_race_schedule()   # ✅ ADD THIS

    return {
        "status": "ok",
        "team_result": teams,
        "driver_result": drivers,
        "race_result": races   # ✅ this will now contain real schedule
    }

def sync_race_schedule():

    url = f"{JOLPICA_BASE}/current/races/"

    data = fetch_json(url)

    races = (
        data.get("MRData", {})
        .get("RaceTable", {})
        .get("Races", [])
    )

    race_list = []

    for race in races:

        race_name = race.get("raceName", "Unknown GP")

        race_date = race.get("date")
        race_time = race.get("time", "00:00:00Z")

        race_list.append({
            "meeting_name": race_name,
            "date_start": f"{race_date}T{race_time}"
        })

    return race_list

if __name__ == "__main__":
    result = sync_all_f1_data()
    print("Manual run:", result)
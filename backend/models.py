from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base


# ---------- USERS ----------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="user")

    picks = relationship("Pick", back_populates="user")


# ---------- TEAMS ----------
class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

    # ✅ ADD THIS (required for API sync)
    constructor_api_id = Column(String, unique=True)

    tier = Column(Integer)  # 1, 2, or 3
    is_active = Column(Boolean, default=True)

    drivers = relationship("Driver", back_populates="team")

# ---------- DRIVERS ----------
class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

    # ✅ ADD THIS (required for API mapping)
    driver_api_id = Column(String, unique=True)

    team_id = Column(Integer, ForeignKey("teams.id"))
    is_active = Column(Boolean, default=True)

    team = relationship("Team", back_populates="drivers")

# ---------- PICKS ----------
class Pick(Base):
    __tablename__ = "picks"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))
    driver_id = Column(Integer, ForeignKey("drivers.id"))

    race_id = Column(Integer)  # ✅ NEW

    tier = Column(Integer)

    user = relationship("User", back_populates="picks")

# ---------- RESULTS ----------
class Result(Base):
    __tablename__ = "results"

    id = Column(Integer, primary_key=True, index=True)

    race_id = Column(Integer)  # numeric ID for race
    driver_id = Column(Integer, ForeignKey("drivers.id"))

    points = Column(Integer)
    finishing_position = Column(Integer)

    race_type = Column(String)  # "feature" or "sprint"

#-----Race-----
class Race(Base):
    __tablename__ = "races"

    id = Column(Integer, primary_key=True, index=True)

    season_id = Column(
       Integer,
       ForeignKey("seasons.id")
    )

    round_number = Column(Integer)
    race_name = Column(String)

    race_date = Column(String)

# ----- Draft State -----
class DraftState(Base):
    __tablename__ = "draft_state"

    id = Column(Integer, primary_key=True, index=True)
    current_index = Column(Integer, default=0)
    pick_order_json = Column(String, default="[]")
    processed_race_id = Column(Integer, nullable=True)

#-----Season Base-----
class Season(Base):
    __tablename__ = "seasons"

    id = Column(Integer, primary_key=True)

    year = Column(Integer, unique=True)

    active = Column(Boolean, default=False)

    champion_user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

#-----Season Standing-----
class SeasonStanding(Base):
    __tablename__ = "season_standings"

    id = Column(Integer, primary_key=True)

    season_id = Column(Integer, ForeignKey("seasons.id"))
    user_id = Column(Integer, ForeignKey("users.id"))

    starting_points = Column(Integer, default=0)
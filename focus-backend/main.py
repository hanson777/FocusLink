from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from uuid import uuid4
from datetime import datetime, timezone
from dotenv import load_dotenv
from fastapi import Depends
from sqlalchemy.orm import Session
from database import get_db
import psycopg2.extras

load_dotenv()

app = FastAPI()

# Allow requests from anywhere (extensions, dev frontend, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # relax for dev; tighten later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    token: str


class UserStatusPayload(BaseModel):
    status: str


# 🔧 Fake user database for now
USERS = {
    "student@example.com": "123456",
    "anniezhang2004@163.com": "zzc040717",
}

# simple in-memory user-status tracker for the timer
CURRENT_STATUS = "Idle"


@app.post("/api/login", response_model=LoginResponse)
def login(req: LoginRequest):
    """
    Simple login API:

    Request: { "email": "...", "password": "..." }
    Success: 200, { "token": "token-for-<email>" }
    Failure: 401, { "detail": "Invalid credentials" }
    """
    expected = USERS.get(req.email)
    if expected is None or expected != req.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # In a real app you’d return a JWT; here we just fake it
    token = f"token-for-{req.email}"
    return {"token": token}

# @app.post("/api/register", response_model=LoginResponse)
# def register(req: RegisterRequest):
#     """
#     Simple registration API:

#     Request: { "email": "...", "password": "..." }
#     - Fails if email already exists
#     - Saves user to users.json
#     - Returns a token so the client can auto-login
#     """
#     if req.email in USERS:
#         raise HTTPException(status_code=400, detail="Email already registered")

#     # ⚠️ For real apps you should hash the password.
#     # For hackathon/demo, we store it in plain text.
#     USERS[req.email] = req.password
#     save_users(USERS)

#     token = f"token-for-{req.email}"
#     return {"token": token}


@app.get("/api/user-status")
def get_user_status():
    return {"status": CURRENT_STATUS}

@app.put("/api/user-status")
def update_user_status(payload: UserStatusPayload):
    global CURRENT_STATUS
    CURRENT_STATUS = payload.status
    return {"status": CURRENT_STATUS}

DAILY_GOALS = []


class DailyGoalPayload(BaseModel):
    minutes_goal: int
    session_goal: int


@app.get("/daily-goals/")
def get_daily_goals():
    return DAILY_GOALS


@app.post("/daily-goals/")
def create_daily_goal(payload: DailyGoalPayload):
    now = datetime.now(timezone.utc).isoformat()

    goal = {
        "uid": str(uuid4()),
        "user_uid": "demo-user",
        "minutes_goal": payload.minutes_goal,
        "session_goal": payload.session_goal,
        "created_at": now,
        "updated_at": now,
    }

    DAILY_GOALS.append(goal)
    return goal


@app.put("/daily-goals/{uid}")
def update_daily_goal(uid: str, payload: DailyGoalPayload):
    now = datetime.now(timezone.utc).isoformat()

    for goal in DAILY_GOALS:
        if goal["uid"] == uid:
            goal["minutes_goal"] = payload.minutes_goal
            goal["session_goal"] = payload.session_goal
            goal["updated_at"] = now
            return goal

    raise HTTPException(status_code=404, detail="Goal not found")

STUDY_SESSIONS = []


class StudySessionCreate(BaseModel):
    start_time: str
    end_time: str
    studying_duration: int


class StudySessionUpdate(BaseModel):
    end_time: str
    studying_duration: int


@app.get("/study-sessions/")
def get_study_sessions():
    return STUDY_SESSIONS


@app.post("/study-sessions/", status_code=201)
def create_study_session(payload: StudySessionCreate):
    session = {
        "uid": str(uuid4()),
        "user_uid": "demo-user",  # TODO: replace w/ auth user later
        "start_time": payload.start_time,
        "end_time": payload.end_time,
        "studying_duration": payload.studying_duration,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "updated_at": datetime.utcnow().isoformat() + "Z",
    }
    STUDY_SESSIONS.append(session)
    return session


@app.get("/study-sessions/{session_id}")
def get_session(session_id: str):
    for s in STUDY_SESSIONS:
        if s["uid"] == session_id:
            return s
    raise HTTPException(status_code=404, detail="Session not found")


@app.put("/study-sessions/{session_id}")
def update_session(session_id: str, payload: StudySessionUpdate):
    for s in STUDY_SESSIONS:
        if s["uid"] == session_id:
            s["end_time"] = payload.end_time
            s["studying_duration"] = payload.studying_duration
            s["updated_at"] = datetime.utcnow().isoformat() + "Z"
            return s
    raise HTTPException(status_code=404, detail="Session not found")

@app.post("/daily-goals/add")
def add_daily_minutes(payload: dict):
    amount = payload.get("minutes", 0)
    sessions = payload.get("sessions", 0)

    # assuming only one goal for now
    if len(DAILY_GOALS) == 0:
        raise HTTPException(400, "No daily goals found")

    goal = DAILY_GOALS[0]
    goal["minutes_goal"] += amount
    goal["session_goal"] += sessions
    goal["updated_at"] = datetime.utcnow().isoformat() + "Z"
    
    return goal

# ============================
# FRIENDS ENDPOINTS (SQLAlchemy)
# ============================

from fastapi import Depends
from sqlalchemy.orm import Session
from database import get_db, Friend
from pydantic import BaseModel
from datetime import datetime, timezone

CURRENT_USER_UID = "demo-user"


class FriendPayload(BaseModel):
    friend_uid: str
    friend_username: str


@app.get("/friends")
def get_friends(db: Session = Depends(get_db)):
    """Return all friends for the current user."""
    rows = (
        db.query(Friend)
        .filter(Friend.user_uid == CURRENT_USER_UID)
        .order_by(Friend.created_at.desc())
        .all()
    )
    return rows


@app.post("/friends")
def add_friend(payload: FriendPayload, db: Session = Depends(get_db)):
    """Add a new friend to the DB."""

    new_friend = Friend(
        user_uid=CURRENT_USER_UID,
        friend_uid=payload.friend_uid,
        friend_username=payload.friend_username,
        created_at=datetime.now(timezone.utc),
    )

    db.add(new_friend)
    db.commit()
    db.refresh(new_friend)

    return new_friend


@app.delete("/friends/{friend_uid}")
def remove_friend(friend_uid: str, db: Session = Depends(get_db)):
    """Remove a friend based on friend_uid."""

    row = (
        db.query(Friend)
        .filter(
            Friend.user_uid == CURRENT_USER_UID,
            Friend.friend_uid == friend_uid,
        )
        .first()
    )

    if not row:
        raise HTTPException(404, "Friend not found")

    db.delete(row)
    db.commit()

    return {"detail": "Friend removed"}
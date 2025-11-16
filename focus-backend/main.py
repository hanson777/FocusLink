from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from uuid import uuid4
from datetime import datetime, timezone

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

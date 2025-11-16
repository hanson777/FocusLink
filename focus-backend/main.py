from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from uuid import uuid4
from datetime import datetime, timezone

app = FastAPI()

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
import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class TaskCreateModel(BaseModel):
    minutes_goal: int
    session_goal: int


class TaskModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    uid: uuid.UUID
    user_uid: uuid.UUID
    minutes_goal: int
    session_goal: int
    created_at: datetime
    updated_at: datetime


class TaskUpdateModel(BaseModel):
    minutes_goal: int
    session_goal: int

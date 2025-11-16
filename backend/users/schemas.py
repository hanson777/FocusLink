from pydantic import BaseModel
import uuid


class UserSearchModel(BaseModel):
    uid: uuid.UUID
    username: str
    first_name: str
    last_name: str


class UserProfileStatisticsModel(BaseModel):
    uid: uuid.UUID
    username: str
    first_name: str
    last_name: str
    total_study_sessions: int
    total_study_minutes: int
    average_session_minutes: int
    longest_streak: int







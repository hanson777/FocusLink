import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class StudySessionCreateModel(BaseModel):
    start_time: datetime
    end_time: datetime
    studying_duration: int


class StudySessionModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    uid: uuid.UUID
    user_uid: uuid.UUID
    start_time: datetime
    end_time: datetime
    studying_duration: int
    created_at: datetime
    updated_at: datetime


class StudySessionUpdateModel(BaseModel):
    end_time: datetime
    studying_duration: int

from datetime import datetime

from pydantic import BaseModel, ConfigDict
import uuid


class UserStatusCreateModel(BaseModel):
    status: str


class UserStatusModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    uid: uuid.UUID
    status: str
    user_uid: uuid.UUID
    created_at: datetime
    updated_at: datetime


class UserStatusUpdateModel(BaseModel):
    status: str

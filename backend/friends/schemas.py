import uuid
from pydantic import BaseModel, ConfigDict
from datetime import datetime


class FriendCreateModel(BaseModel):
    friend_uid: uuid.UUID


class FriendModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    uid: uuid.UUID
    user_uid: uuid.UUID
    friend_uid: uuid.UUID
    created_at: datetime


class FriendWithUsernameModel(BaseModel):
    uid: uuid.UUID
    friend_uid: uuid.UUID
    friend_username: str
    created_at: datetime

from pydantic import BaseModel
from typing import Optional


# -------- USERS --------

class UserCreate(BaseModel):
    email: str
    username: str
    password: str


class UserResponse(BaseModel):
    uid: str
    email: str
    username: str

    class Config:
        orm_mode = True


# -------- DAILY GOALS --------

class DailyGoalBase(BaseModel):
    minutes_goal: int
    session_goal: int


class DailyGoalCreate(DailyGoalBase):
    pass


class DailyGoalUpdate(DailyGoalBase):
    pass


class DailyGoalResponse(DailyGoalBase):
    uid: str
    user_uid: str

    class Config:
        orm_mode = True


# -------- FRIENDS --------

class FriendCreate(BaseModel):
    friend_uid: str
    friend_username: str


class FriendResponse(BaseModel):
    uid: str
    user_uid: str
    friend_uid: str
    friend_username: str

    class Config:
        orm_mode = True


# -------- STUDY SESSIONS --------

class StudySessionCreate(BaseModel):
    start_time: str
    end_time: str
    studying_duration: int


class StudySessionUpdate(BaseModel):
    end_time: str
    studying_duration: int


class StudySessionResponse(BaseModel):
    uid: str
    user_uid: str
    start_time: str
    end_time: Optional[str]
    studying_duration: int

    class Config:
        orm_mode = True
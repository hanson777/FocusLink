from pydantic import BaseModel
from sqlmodel import Field
import uuid
from datetime import datetime

class UserCreateModel(BaseModel):
    username: str = Field(max_length=20)
    email: str = Field(max_length=50)
    password: str = Field(min_length=8)
    first_name: str = Field(max_length=20)
    last_name: str = Field(max_length=20)

class UserModel(BaseModel):
    uid: uuid.UUID
    username: str
    email: str
    first_name: str
    last_name: str
    password_hash: str = Field(exclude=True)
    created_at: datetime
    updated_at: datetime



class UserLoginModel(BaseModel):
    username: str
    password: str




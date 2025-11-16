from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio.session import AsyncSession
from datetime import timedelta
from pydantic import BaseModel
import uuid

from backend.db.main import get_session
from .schemas import UserCreateModel, UserModel, UserLoginModel
from .service import create_user, get_user, user_exists, email_exists
from .utils import authenticate_user, create_access_token, get_password_hash, Token

auth_router = APIRouter()

ACCESS_TOKEN_EXPIRE_MINUTES = 120

class UserInfo(BaseModel):
    uid: uuid.UUID
    username: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserInfo

@auth_router.post("/register", response_model=UserModel, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreateModel, session: AsyncSession = Depends(get_session)):
    if await user_exists(user_data.username, session):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    

    if await email_exists(user_data.email, session):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    user = await create_user(user_data, session)
    return UserModel.model_validate(user)

@auth_router.post("/login", response_model=LoginResponse)
async def login(
    user_data: UserLoginModel,
    session: AsyncSession = Depends(get_session)
):
    user = await authenticate_user(user_data.username, user_data.password, session)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "uid": user.uid,
            "username": user.username
        }
    }

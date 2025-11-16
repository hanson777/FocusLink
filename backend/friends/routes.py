from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import List
import uuid

from backend.db.main import get_session
from backend.auth.utils import get_current_user
from backend.db.models import User
from .service import FriendService
from .schemas import FriendCreateModel, FriendWithUsernameModel

friends_router = APIRouter()
friend_service = FriendService()


@friends_router.get("/", response_model=List[FriendWithUsernameModel])
async def get_my_friends(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    print(f"[friends] get_my_friends called for user: {current_user.username}")
    friends = await friend_service.get_my_friends(current_user.uid, session)
    
    return [
        FriendWithUsernameModel(
            uid=f.uid,
            friend_uid=f.friend_uid,
            friend_username=f.friend.username,
            created_at=f.created_at
        )
        for f in friends
    ]


@friends_router.post("/", status_code=201)
async def add_friend(
    friend_data: FriendCreateModel,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
     await friend_service.add_friend(current_user.uid, friend_data.friend_uid, session)
     return {"message": "Friend added successfully"}


@friends_router.delete("/{friend_uid}")
async def remove_friend(
    friend_uid: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    return await friend_service.remove_friend(current_user.uid, friend_uid, session)

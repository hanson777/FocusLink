from fastapi import HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import selectinload
from backend.db.models import Friend
import uuid


class FriendService:
    async def get_my_friends(self, user_uid: uuid.UUID, session: AsyncSession):
        statement = select(Friend).where(
            Friend.user_uid == user_uid
        ).options(selectinload(Friend.friend))
        
        result = await session.exec(statement)
        return result.all()

    async def add_friend(self, user_uid: uuid.UUID, friend_uid: uuid.UUID, session: AsyncSession):
        existing = await session.exec(
            select(Friend).where(
                Friend.user_uid == user_uid,
                Friend.friend_uid == friend_uid
            )
        )
        if existing.first():
            raise HTTPException(status_code=400, detail="Already friends")
        
        if user_uid == friend_uid:
            raise HTTPException(status_code=400, detail="Cannot add yourself as friend")
        
        friend = Friend(user_uid=user_uid, friend_uid=friend_uid)
        session.add(friend)
        await session.commit()
        await session.refresh(friend)
        return friend

    async def remove_friend(self, user_uid: uuid.UUID, friend_uid: uuid.UUID, session: AsyncSession):
        statement = select(Friend).where(
            Friend.user_uid == user_uid,
            Friend.friend_uid == friend_uid
        )
        result = await session.exec(statement)
        friend = result.first()
        
        if not friend:
            raise HTTPException(status_code=404, detail="Friend not found")
        
        await session.delete(friend)
        await session.commit()
        return {"message": "Friend removed successfully"}

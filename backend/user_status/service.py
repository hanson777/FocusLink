import uuid
from fastapi import HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from backend.db.models import UserStatus
from .schemas import UserStatusCreateModel, UserStatusUpdateModel


class UserStatusService:


    async def create_user_status(self, user_status: UserStatusCreateModel, user_uid: uuid.UUID, session: AsyncSession):
        user_status_dict = user_status.model_dump()
        user_status_obj = UserStatus(**user_status_dict)
        user_status_obj.user_uid = user_uid
        session.add(user_status_obj)
        await session.commit()
        await session.refresh(user_status_obj)
        return user_status_obj

    async def get_user_status(self, user_uid: uuid.UUID, session: AsyncSession):
        statement = select(UserStatus).where(UserStatus.user_uid == user_uid)
        result = await session.exec(statement)
        user_status = result.first()
        return user_status

    async def update_user_status(self, user_status: UserStatusUpdateModel, user_uid: uuid.UUID, session: AsyncSession):
        user_status_obj = await self.get_user_status(user_uid, session)
        
        if not user_status_obj:
            raise HTTPException(status_code=404, detail="User status not found")
        
        user_status_dict = user_status.model_dump()
        for key, value in user_status_dict.items():
            setattr(user_status_obj, key, value)
        
        await session.commit()
        await session.refresh(user_status_obj)
        return user_status_obj

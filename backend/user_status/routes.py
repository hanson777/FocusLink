from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
import uuid

from backend.db.main import get_session
from backend.auth.utils import get_current_user
from backend.db.models import User
from .service import UserStatusService
from .schemas import UserStatusCreateModel, UserStatusUpdateModel, UserStatusModel

user_status_router = APIRouter()
user_status_service = UserStatusService()


@user_status_router.get("/me", response_model=UserStatusModel)
async def get_my_status(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    status = await user_status_service.get_user_status(current_user.uid, session)
    
    if not status:
        raise HTTPException(status_code=404, detail="Status not found")
    
    return status


@user_status_router.get("/{user_uid}", response_model=UserStatusModel)
async def get_user_status(
    user_uid: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    status = await user_status_service.get_user_status(user_uid, session)
    
    if not status:
        raise HTTPException(status_code=404, detail="Status not found")
    
    return status


@user_status_router.post("/", response_model=UserStatusModel, status_code=201)
async def create_status(
    status_data: UserStatusCreateModel,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    return await user_status_service.create_user_status(status_data, current_user.uid, session)


@user_status_router.put("/", response_model=UserStatusModel)
async def update_status(
    status_data: UserStatusUpdateModel,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    return await user_status_service.update_user_status(status_data, current_user.uid, session)

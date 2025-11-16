from fastapi import APIRouter, Depends
from .service import UserService
from .schemas import UserSearchModel, UserProfileStatisticsModel
from sqlmodel.ext.asyncio.session import AsyncSession
from backend.db.main import get_session
from backend.auth.utils import get_current_user
from backend.db.models import User
users_router = APIRouter()
user_service = UserService()


@users_router.get("/search", response_model=list[UserSearchModel])
async def search_users(query: str, session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    return await user_service.search_user(query, session)


@users_router.get("/{user_uid}", response_model=UserProfileStatisticsModel)
async def get_user(user_uid: str, session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    return await user_service.get_user_by_uid(user_uid, session)




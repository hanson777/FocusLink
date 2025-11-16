from fastapi import APIRouter, Depends
from .schemas import BlockedWebsiteModel, BlockedWebsiteUpdateModel, BlockedWebsiteCreateModel
from .service import BlockedWebsiteService
from sqlmodel.ext.asyncio.session import AsyncSession
from backend.db.main import get_session
from backend.auth.utils import get_current_user
from backend.db.models import User
from typing import List

blocked_website_router = APIRouter()
blocked_website_service = BlockedWebsiteService()

@blocked_website_router.get("/", response_model=List[BlockedWebsiteModel])
async def get_blocked_websites(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    return await blocked_website_service.get_all_blocked_websites(session)


@blocked_website_router.get("/{uid}", response_model=BlockedWebsiteModel)
async def get_blocked_website(
    uid: str,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    return await blocked_website_service.get_blocked_website(uid, session)


@blocked_website_router.post("/", response_model=BlockedWebsiteModel, status_code=201)
async def create_blocked_website(
    blocked_website: BlockedWebsiteCreateModel,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    return await blocked_website_service.create_blocked_website(blocked_website, str(current_user.uid), session)


@blocked_website_router.delete("/{uid}", status_code=204)
async def delete_blocked_website(
    uid: str,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    return await blocked_website_service.delete_blocked_website(uid, session)


@blocked_website_router.put("/{uid}", response_model=BlockedWebsiteModel)
async def update_blocked_website(
    uid: str,
    blocked_website: BlockedWebsiteUpdateModel,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    return await blocked_website_service.update_blocked_website(blocked_website, session)



from fastapi import APIRouter, Depends, Query
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import List
import uuid

from backend.db.main import get_session
from backend.auth.utils import get_current_user
from backend.db.models import User
from .service import StudySessionService
from .schemas import StudySessionCreateModel, StudySessionUpdateModel, StudySessionModel

studysession_router = APIRouter()
study_session_service = StudySessionService()


@studysession_router.post("/", response_model=StudySessionModel, status_code=201)
async def create_session(
    session_data: StudySessionCreateModel,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    return await study_session_service.create_study_session(session_data, current_user.uid, db)


@studysession_router.get("/", response_model=List[StudySessionModel])
async def get_my_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    return await study_session_service.get_my_sessions(current_user.uid, 7, db)


@studysession_router.get("/{session_id}", response_model=StudySessionModel)
async def get_session(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    return await study_session_service.get_session_by_id(session_id, db)


@studysession_router.put("/{session_id}", response_model=StudySessionModel)
async def update_session(
    session_id: uuid.UUID,
    session_data: StudySessionUpdateModel,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    return await study_session_service.update_study_session(session_id, session_data, current_user.uid, db)


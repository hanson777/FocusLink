import uuid

from fastapi import APIRouter, Depends
from .schemas import TaskCreateModel, TaskUpdateModel, TaskModel
from .service import DailyGoalService
from sqlmodel.ext.asyncio.session import AsyncSession
from backend.auth.utils import get_current_user
from backend.db.main import get_session
from backend.db.models import User


daily_goals_router = APIRouter()
daily_goals_service = DailyGoalService()

@daily_goals_router.get("/", response_model=list[TaskModel])
async def get_daily_goals(session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    return await daily_goals_service.get_daily_goal(current_user.uid, session)

@daily_goals_router.post("/", response_model=TaskModel, status_code=201)
async def create_daily_goal(
    daily_goal: TaskCreateModel,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    return await daily_goals_service.create_daily_goal(current_user.uid, daily_goal, session)


@daily_goals_router.put("/{uid}", response_model=TaskModel)
async def update_daily_goal(uid: uuid.UUID, task_data: TaskUpdateModel, session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    return await daily_goals_service.update_daily_goal(uid, task_data, current_user.uid, session)


@daily_goals_router.delete("/{uid}", status_code=204)
async def delete_daily_goal(uid: uuid.UUID, session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    return await daily_goals_service.delete_daily_goal(uid, current_user.uid, session)




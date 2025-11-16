import uuid

from fastapi import HTTPException
from sqlmodel import  select
from sqlmodel.ext.asyncio.session import AsyncSession
from backend.db.models import Task
from .schemas import TaskCreateModel, TaskUpdateModel

class DailyGoalService:
    async def get_daily_goal(self, user_uid: uuid.UUID, session: AsyncSession):
        statement = select(Task).where(Task.user_uid == user_uid)
        result = await session.exec(statement)
        return result.all()


    async def create_daily_goal(self, user_uid: uuid.UUID, task_data: TaskCreateModel, session: AsyncSession):
        task_data_dict = task_data.model_dump()
        task_obj = Task(**task_data_dict)
        task_obj.user_uid = user_uid
        session.add(task_obj)
        await session.commit()
        await session.refresh(task_obj)
        return task_obj

    async def update_daily_goal(self, task_id: uuid.UUID, task_data: TaskUpdateModel, user_uid: uuid.UUID, session: AsyncSession):
        statement = select(Task).where(Task.uid == task_id, Task.user_uid == user_uid)
        result = await session.exec(statement)
        task_obj = result.first()

        if not task_obj:
            raise HTTPException(status_code=404, detail="Task not found")

        for key, value in task_data.model_dump().items():
            setattr(task_obj, key, value)

        await session.commit()
        await session.refresh(task_obj)
        return task_obj

    async def delete_daily_goal(self, task_id: uuid.UUID, user_uid: uuid.UUID, session: AsyncSession):
        statement = select(Task).where(Task.uid == task_id, Task.user_uid == user_uid)
        result = await session.exec(statement)
        task_to_delete = result.first()

        if not task_to_delete:
            raise HTTPException(status_code=404, detail="Task not found")

        await session.delete(task_to_delete)
        await session.commit()
        return {"message": "Task deleted successfully"}



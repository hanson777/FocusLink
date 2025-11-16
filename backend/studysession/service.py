from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from backend.db.models import StudySession
from .schemas import StudySessionCreateModel, StudySessionUpdateModel
from datetime import datetime, timedelta
import uuid
from fastapi import HTTPException


class StudySessionService:
    
    async def create_study_session(self, session_data: StudySessionCreateModel, user_uid: uuid.UUID, db: AsyncSession):
        session_dict = session_data.model_dump()
        
        # Strip timezone info to match database TIMESTAMP WITHOUT TIME ZONE
        if session_dict.get('start_time') and session_dict['start_time'].tzinfo:
            session_dict['start_time'] = session_dict['start_time'].replace(tzinfo=None)
        if session_dict.get('end_time') and session_dict['end_time'].tzinfo:
            session_dict['end_time'] = session_dict['end_time'].replace(tzinfo=None)
        
        study_session = StudySession(**session_dict)
        study_session.user_uid = user_uid
        db.add(study_session)
        await db.commit()
        await db.refresh(study_session)
        return study_session
    
    async def get_my_sessions(self, user_uid: uuid.UUID, days: int, db: AsyncSession):
        start_date = datetime.now() - timedelta(days=days)
        statement = select(StudySession).where(
            StudySession.user_uid == user_uid,
            StudySession.created_at >= start_date
        ).order_by(StudySession.created_at.desc())
        
        result = await db.exec(statement)
        return result.all()
    
    async def get_session_by_id(self, session_id: uuid.UUID, db: AsyncSession):
        statement = select(StudySession).where(StudySession.uid == session_id)
        result = await db.exec(statement)
        study_session = result.first()
        
        if not study_session:
            raise HTTPException(status_code=404, detail="session not found")
        
        return study_session

    async def get_all_sessions_by_id(self, session_id: uuid.UUID, db: AsyncSession):
        statement = select(StudySession).where(StudySession.uid == session_id)
        result = await db.exec(statement)
        study_session = result.all()
    
    async def update_study_session(self, session_id: uuid.UUID, session_data: StudySessionUpdateModel, user_uid: uuid.UUID, db: AsyncSession):
        study_session = await self.get_session_by_id(session_id, db)
        
        if study_session.user_uid != user_uid:
            raise HTTPException(status_code=403, detail="not authorized to update this session")
        
        session_dict = session_data.model_dump()
        
        # Strip timezone info to match database TIMESTAMP WITHOUT TIME ZONE
        if session_dict.get('end_time') and session_dict['end_time'].tzinfo:
            session_dict['end_time'] = session_dict['end_time'].replace(tzinfo=None)
        
        for key, value in session_dict.items():
            setattr(study_session, key, value)
        
        await db.commit()
        await db.refresh(study_session)
        return study_session

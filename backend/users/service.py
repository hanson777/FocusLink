import uuid

from sqlmodel import select, func
from sqlmodel.ext.asyncio.session import AsyncSession
from backend.db.models import User, StudySession
from .schemas import UserProfileStatisticsModel


class UserService:
    async def get_user_by_uid(self, uid: uuid.UUID, session: AsyncSession):
        statement = select(User).where(User.uid == uid)
        result = await session.exec(statement)
        stats_obj = await self.calculate_user_stats(uid, session)
        user_stats = UserProfileStatisticsModel(
            uid=uid,
            username = result.first().username,
            first_name=result.first().first_name,
            last_name=result.first().last_name,
            total_study_sessions=stats_obj["total_sessions"],
            total_study_minutes=stats_obj["total_minutes"],
            average_session_minutes=stats_obj["average_minutes"],
            longest_streak=stats_obj["longest_streak"]
        )
        return user_stats

    async def search_user(self, query: str, session: AsyncSession):
        statement = select(User).where(User.username.ilike(f"%{query}%"))
        result = await session.exec(statement)
        users = result.all()
        return users

    async def calculate_user_stats(self, uid: uuid.UUID, session: AsyncSession):
        statement = select(func.count(StudySession.uid), func.sum(StudySession.studying_duration)).where(StudySession.user_uid == uid)
        result = await session.exec(statement)
        row = result.first()
        total_sessions = row[0] if row[0] else 0
        total_minutes = row[1] if row[1] else 0
        if total_sessions > 0:
            avg_minutes = total_minutes / total_sessions
        else:
            avg_minutes = 0
        
        longest_streak = await self.calculate_streak(uid, session)
        
        return {
            "total_sessions": total_sessions,
            "total_minutes": total_minutes,
            "average_minutes": avg_minutes,
            "longest_streak": longest_streak
        }

    async def calculate_streak(self, uid: uuid.UUID, session: AsyncSession):
        statement = select(StudySession).where(StudySession.user_uid == uid).order_by(StudySession.created_at)
        result = await session.exec(statement)
        dates = []
        for d in result.all():
            date_only = d.created_at.date()
            dates.append(date_only)

        if len(dates) == 0:
            return 0

        longest = 1
        current = 1
        for i in range(1, len(dates)):
            if (dates[i] - dates[i - 1]).days == 1:
                current += 1
                if current > longest:
                    longest = current
            elif dates[i] != dates[i - 1]:
                current = 1

        return longest

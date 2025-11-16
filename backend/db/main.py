from sqlmodel import create_engine, text, SQLModel
from sqlalchemy.ext.asyncio import AsyncSession
from src.config import Settings


engine = create_engine(Settings.DATABASE_URL, echo=True)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
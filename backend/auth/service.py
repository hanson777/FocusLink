from sqlmodel import select
from backend.db.models import User
from sqlmodel.ext.asyncio.session import AsyncSession
from .schemas import UserCreateModel
from .utils import get_password_hash


async def create_user(user: UserCreateModel, session: AsyncSession):
    user_data_dict = user.model_dump()
    password = user_data_dict.pop("password")
    user = User(**user_data_dict)
    user.password_hash = get_password_hash(password)
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user

async def get_user(username: str, session: AsyncSession):
    statement = select(User).where(User.username == username)
    result = await session.exec(statement)
    user = result.first()
    return user

async def get_user_by_email(email: str, session: AsyncSession):
    statement = select(User).where(User.email == email)
    result = await session.exec(statement)
    user = result.first()
    return user

async def user_exists(username: str, session: AsyncSession):
    user = await get_user(username, session)
    return user is not None

async def email_exists(email: str, session: AsyncSession):
    user = await get_user_by_email(email, session)
    return user is not None
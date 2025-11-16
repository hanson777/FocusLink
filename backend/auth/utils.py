from typing import Annotated
import logging

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
import jwt
from pydantic import BaseModel
from sqlalchemy.ext.asyncio.session import AsyncSession

from backend.config import Settings
from backend.db.main import get_session

logger = logging.getLogger("auth")
print("[auth.utils] Module loaded")

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None

password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

def verify_password(plain_password: str, hashed_password: str):
    return password_context.verify(plain_password, hashed_password)

def get_password_hash(password: str):
    return password_context.hash(password)

async def authenticate_user(username: str, password: str, session: AsyncSession):
    from .service import get_user
    print(f"[auth] authenticate_user called for username={username}")
    logger.info("authenticate_user called for username=%s", username)
    user = await get_user(username, session)
    if not user:
        print(f"[auth] user not found for username={username}")
        logger.warning("authenticate_user: user not found for username=%s", username)
        return False
    if not verify_password(password, user.password_hash):
        print(f"[auth] invalid password for username={username}")
        logger.warning("authenticate_user: invalid password for username=%s", username)
        return False
    print(f"[auth] successful login for username={username}")
    logger.info("authenticate_user: successful login for username=%s", username)
    return user

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, Settings.JWT_SECRET_KEY, algorithm=Settings.JWT_ALGORITHM)
    return encoded_jwt


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: AsyncSession = Depends(get_session)
):
    print(f"[auth] get_current_user ENTERED - token={token[:20]}..." if token else "[auth] get_current_user ENTERED - token=None")
    from .service import get_user
    print(f"[auth] get_current_user called")
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        print(f"[auth] decoding token...")
        payload = jwt.decode(token, Settings.JWT_SECRET_KEY, algorithms=[Settings.JWT_ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            print(f"[auth] token missing 'sub' claim")
            raise credentials_exception
        token_data = TokenData(username=username)
        print(f"[auth] token decoded, username={username}")
    except jwt.PyJWTError as e:
        print(f"[auth] token decode failed: {e}")
        raise credentials_exception
    user = await get_user(username, session)
    if user is None:
        print(f"[auth] user not found for username={username}")
        raise credentials_exception
    print(f"[auth] authenticated user: {username}")
    return user


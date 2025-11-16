from contextlib import asynccontextmanager
from backend.db.main import init_db
from fastapi import FastAPI
from backend.auth.routes import auth_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting app")
    await init_db()
    yield
    print("Stopping app")

app = FastAPI(lifespan=lifespan)

app.include_router(auth_router, prefix="/auth", tags=["auth"])





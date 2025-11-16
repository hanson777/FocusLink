from contextlib import asynccontextmanager
from backend.db.main import init_db
from fastapi import FastAPI
from backend.auth.routes import auth_router
from backend.blockedwebsite.routes import blocked_website_router
from backend.friends.routes import friends_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting app")
    await init_db()
    yield
    print("Stopping app")

app = FastAPI(lifespan=lifespan)

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(blocked_website_router, prefix="/blocked-website", tags=["blocked-website"])
app.include_router(friends_router, prefix="/friends", tags=["friends"])




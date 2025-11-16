from contextlib import asynccontextmanager
from backend.db.main import init_db
from fastapi import FastAPI
from backend.auth.routes import auth_router
from backend.blockedwebsite.routes import blocked_website_router
from backend.friends.routes import friends_router
from backend.user_status.routes import user_status_router
from backend.studysession.routes import studysession_router
from fastapi.middleware.cors import CORSMiddleware
from backend.users.routes import users_router
from backend.dailygoals.routes import daily_goals_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting app")
    await init_db()
    yield
    print("Stopping app")

app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://student-focus-app-1.onrender.com"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(blocked_website_router, prefix="/blocked-website", tags=["blocked-website"])
app.include_router(friends_router, prefix="/friends", tags=["friends"])
app.include_router(user_status_router, prefix="/user-status", tags=["user-status"])
app.include_router(studysession_router, prefix="/study-sessions", tags=["study-sessions"])

app.include_router(users_router, prefix="/users", tags=["users"])

app.include_router(daily_goals_router, prefix="/daily-goals", tags=["daily-goals"])



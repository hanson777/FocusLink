from contextlib import asynccontextmanager
from backend.db.main import init_db
from fastapi import FastAPI


@asynccontextmanager
async def lifespan():
    print("Starting app")
    await init_db()
    yield
    print("Stopping app")

app = FastAPI()





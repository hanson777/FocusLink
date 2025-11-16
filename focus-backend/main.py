from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Allow requests from anywhere (extensions, dev frontend, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # relax for dev; tighten later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    token: str


# 🔧 Fake user database for now
USERS = {
    "student@example.com": "123456",
    "anniezhang2004@163.com": "zzc040717",
}


@app.post("/api/login", response_model=LoginResponse)
def login(req: LoginRequest):
    """
    Simple login API:

    Request: { "email": "...", "password": "..." }
    Success: 200, { "token": "token-for-<email>" }
    Failure: 401, { "detail": "Invalid credentials" }
    """
    expected = USERS.get(req.email)
    if expected is None or expected != req.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # In a real app you’d return a JWT; here we just fake it
    token = f"token-for-{req.email}"
    return {"token": token}


@app.post("/api/register", response_model=LoginResponse)
def register(req: RegisterRequest):
    """
    Simple registration API:

    Request: { "email": "...", "password": "..." }
    - Fails if email already exists
    - Saves user to users.json
    - Returns a token so the client can auto-login
    """
    if req.email in USERS:
        raise HTTPException(status_code=400, detail="Email already registered")

    # ⚠️ For real apps you should hash the password.
    # For hackathon/demo, we store it in plain text.
    USERS[req.email] = req.password
    save_users(USERS)

    token = f"token-for-{req.email}"
    return {"token": token}

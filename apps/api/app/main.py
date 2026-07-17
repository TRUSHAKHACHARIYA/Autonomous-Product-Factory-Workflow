from contextlib import asynccontextmanager
import sentry_sdk
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from app.config import settings
from app.rate_limit import limiter
from app.routers import runs, orgs, auth, billing, teams
from app.graph.pipeline import init_graph

sentry_sdk.init(
    dsn=settings.SENTRY_DSN or None,
    traces_sample_rate=0.1,
    environment=settings.ENVIRONMENT,
)


async def _rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": f"Rate limit exceeded: {exc.detail}"},
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_graph()
    yield


app = FastAPI(title="Autonomous Product Factory", version="0.1.0", lifespan=lifespan)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type", "X-Organization-Id"],
)

app.include_router(auth.router)
app.include_router(orgs.router)
app.include_router(runs.router)
app.include_router(billing.router)
app.include_router(teams.org_router)
app.include_router(teams.invitations_router)


@app.get("/health")
async def health():
    return {"status": "ok"}

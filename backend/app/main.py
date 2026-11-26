from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.api.routes.auth import router as auth_router
from app.api.routes.entries import router as entries_router
from app.api.routes.preferences import router as preferences_router
from app.api.routes.analytics import router as analytics_router
from app.api.routes.insights import router as insights_router
from app.api.routes.data_controls import router as data_controls_router

app = FastAPI(title="SoulScript API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(entries_router)
app.include_router(preferences_router)
app.include_router(analytics_router)
app.include_router(insights_router)
app.include_router(data_controls_router)


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    # Pydantic's default errors can include submitted input; never echo passwords.
    safe_errors = [{"loc": error.get("loc", []), "msg": error.get("msg", "Invalid value"), "type": error.get("type", "value_error")} for error in exc.errors()]
    too_long_content = request.url.path.startswith("/api/entries") and any(error.get("loc", ())[-1:] == ("content",) and error.get("type") == "string_too_long" for error in exc.errors())
    return JSONResponse(status_code=413 if too_long_content else 422, content={"detail": "Entry content is too long" if too_long_content else "Request validation failed", "errors": safe_errors})


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "healthy"}


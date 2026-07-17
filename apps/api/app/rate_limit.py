from slowapi import Limiter
from slowapi.util import get_remote_address
from app.config import settings


def _key_func(request):
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return get_remote_address(request)


limiter = Limiter(key_func=_key_func, storage_uri=settings.REDIS_URL)

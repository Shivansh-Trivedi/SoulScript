from collections import defaultdict, deque
from threading import Lock
from time import monotonic

from fastapi import HTTPException, Request

_attempts: dict[tuple[str, str], deque[float]] = defaultdict(deque)
_lock = Lock()


def limit_auth_attempts(request: Request, action: str, *, maximum: int, window_seconds: int) -> None:
    client_key = request.client.host if request.client else "unknown"
    key = (action, client_key)
    now = monotonic()
    with _lock:
        attempts = _attempts[key]
        while attempts and now - attempts[0] >= window_seconds:
            attempts.popleft()
        if len(attempts) >= maximum:
            retry_after = max(1, int(window_seconds - (now - attempts[0])))
            raise HTTPException(status_code=429, detail="Too many attempts. Please wait and try again.", headers={"Retry-After": str(retry_after)})
        attempts.append(now)

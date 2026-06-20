import os
from celery import Celery

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "hackathon_tasks",
    broker=REDIS_URL,
    backend=REDIS_URL
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    # Route different tasks to dedicated queues if needed
    task_routes={
        "ai.tasks.*": {"queue": "ai_queue"},
    }
)

# Load tasks modules from the ai package (runs asynchronously)
celery_app.autodiscover_tasks(["ai"])

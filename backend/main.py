from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import os

from .database import engine, Base
from .routers import auth, events, register, submit, review, results, bias, analytics
from .websocket import ws_manager

# Create PostgreSQL tables on startup if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Dell Hackathon 2026 AI-Enabled Management API",
    description="Unified API Gateway facilitating Registration, Assignment, Scoring, Bias Alerts, and Leaderboards",
    version="1.0.0"
)

# CORS configuration for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict this to frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router)
app.include_router(events.router)
app.include_router(register.router)
app.include_router(submit.router)
app.include_router(review.router)
app.include_router(results.router)
app.include_router(bias.router)
app.include_router(analytics.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Dell Hackathon 2026 Management System Gateway",
        "docs_url": "/docs"
    }

# WebSocket endpoint for real-time notifications and alerts (e.g. Bias Panel)
@app.websocket("/ws/{event_id}")
async def websocket_endpoint(websocket: WebSocket, event_id: str):
    await ws_manager.connect(websocket, event_id)
    try:
        while True:
            # Maintain connection alive, process client payloads if any
            data = await websocket.receive_text()
            # Echo or process
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, event_id)
    except Exception:
        ws_manager.disconnect(websocket, event_id)

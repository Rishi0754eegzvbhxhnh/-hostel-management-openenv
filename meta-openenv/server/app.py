"""
server/app.py — FastAPI Server for HostelEnv
============================================
Official OpenEnv spec: environments run as FastAPI HTTP servers.
Exposes /reset, /step, /state endpoints.
Optionally: WebSocket support and /web UI (via ENABLE_WEB_INTERFACE=true).
"""
import os
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional

import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import HostelAction, HostelObservation, HostelState, StepResult
from server.hostel_environment import HostelEnvironment

app = FastAPI(
    title="HostelEnv — Meta OpenEnv",
    description="A 6-task agentic RL environment for hostel management. Built for the Meta OpenEnv hackathon.",
    version="0.1.0",
)

# One environment instance per server (stateful session)
env = HostelEnvironment(seed=42)


# ── Root & favicon (prevents browser-triggered 404 shutdowns) ─────────────────

@app.get("/")
async def root():
    return {
        "name": "hostel-openenv",
        "version": "0.1.0",
        "status": "running",
        "tasks": HostelEnvironment.SUPPORTED_TASKS,
        "endpoints": ["/reset", "/step", "/state", "/tasks", "/health", "/docs"],
    }

@app.get("/favicon.ico")
async def favicon():
    return JSONResponse(content={}, status_code=204)


class ResetRequest(BaseModel):
    task_name: Optional[str] = "room-allocation"


# ── Endpoints ──────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "env": "hostel-openenv", "version": "0.1.0"}


@app.post("/reset", response_model=HostelObservation)
async def reset(request: Optional[ResetRequest] = None):
    """Initialize a new episode. Defaults to room-allocation if body is empty."""
    try:
        task = request.task_name if request else "room-allocation"
        obs = env.reset(task)
        return obs
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/step", response_model=StepResult)
async def step(action: HostelAction):
    """Execute agent action and return the StepResult."""
    result = env.step(action)
    return result


@app.get("/state", response_model=HostelState)
async def state():
    """Return current episode state for debugging."""
    return env.state()


@app.get("/tasks")
async def list_tasks():
    """List all supported tasks."""
    return {"tasks": HostelEnvironment.SUPPORTED_TASKS}


# ── Dev entrypoint ─────────────────────────────────────────────────────────────
def main():
    """Main entry point for starting the environment server."""
    port = int(os.getenv("PORT", 7860))
    uvicorn.run("server.app:app", host="0.0.0.0", port=port, reload=False)


if __name__ == "__main__":
    main()

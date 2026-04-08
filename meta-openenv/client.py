"""
client.py — EnvClient for HostelEnv
=====================================
Official OpenEnv spec: client.py wraps HTTP calls to the server.
Agents use this to interact with the environment — locally or on HF Spaces.
"""
import requests
from typing import Optional
from models import HostelAction, HostelObservation, HostelState, StepResult


class HostelEnvClient:
    """
    Synchronous HTTP client for HostelEnv.
    Connects to a running HostelEnv FastAPI server (local or HF Space).

    Usage:
        with HostelEnvClient(base_url="http://localhost:8000").sync() as env:
            obs = env.reset(task_name="room-allocation")
            result = env.step(HostelAction(action="B201"))
            print(result.reward)
    """

    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url.rstrip("/")
        self._session = requests.Session()

    def sync(self):
        """Returns self for use as a context manager (sync usage pattern)."""
        return self

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self._session.close()

    def reset(self, task_name: str) -> HostelObservation:
        """Initialize a new episode and return the first observation."""
        resp = self._session.post(
            f"{self.base_url}/reset",
            json={"task_name": task_name},
            timeout=10,
        )
        resp.raise_for_status()
        return HostelObservation(**resp.json())

    def step(self, action: HostelAction) -> StepResult:
        """Send an action and receive the step result."""
        resp = self._session.post(
            f"{self.base_url}/step",
            json=action.model_dump(),
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        # Reconstruct nested observation
        data["observation"] = HostelObservation(**data["observation"])
        return StepResult(**data)

    def state(self) -> HostelState:
        """Retrieve current episode metadata."""
        resp = self._session.get(f"{self.base_url}/state", timeout=10)
        resp.raise_for_status()
        return HostelState(**resp.json())

    def list_tasks(self):
        """List all supported task names."""
        resp = self._session.get(f"{self.base_url}/tasks", timeout=10)
        resp.raise_for_status()
        return resp.json()["tasks"]

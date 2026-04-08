"""
server/hostel_environment.py
============================
The server-side Environment class following the official OpenEnv structure.
Analogous to: envs/echo_env/server/echo_environment.py in the official repo.
"""
import json
import random
import uuid
from typing import Any, Dict, Optional, Tuple, Union

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import tasks
from models import HostelAction, HostelObservation, HostelState, StepResult


class HostelEnvironment:
    """
    Server-side environment logic.

    Official OpenEnv structure:
    - reset()  → HostelObservation
    - step()   → StepResult
    - state()  → HostelState
    """

    SUPPORTED_TASKS = [
        "room-allocation",
        "complaint-resolution",
        "fee-meal-scheduling",
        "parking-guidance",
        "iot-maintenance",
        "parent-query",
    ]

    def __init__(self, seed: Optional[int] = None):
        if seed is not None:
            random.seed(seed)
        self._episode_id: str = str(uuid.uuid4())
        self._step_count: int = 0
        self._current_task: Optional[str] = None
        self._internal_state: Dict[str, Any] = {}
        self._current_obs_data: Optional[Dict[str, Any]] = None
        self._done: bool = False

    # ── OpenEnv spec: reset ───────────────────────────────────────────────────
    def reset(self, task_name: str) -> HostelObservation:
        if task_name not in self.SUPPORTED_TASKS:
            raise ValueError(f"Unknown task '{task_name}'. Supported: {self.SUPPORTED_TASKS}")

        self._episode_id = str(uuid.uuid4())
        self._step_count = 0
        self._done = False
        self._current_task = task_name

        obs_data = tasks.generate_observation(task_name)
        self._current_obs_data = obs_data
        self._internal_state = obs_data.get("internal_state", {})

        return HostelObservation(
            task_instruction=obs_data["task_instruction"],
            observation=obs_data["observation"],
            task_name=task_name,
        )

    # ── OpenEnv spec: step ────────────────────────────────────────────────────
    def step(self, action: HostelAction) -> StepResult:
        if self._done:
            return StepResult(
                observation=HostelObservation(
                    task_instruction="Episode complete.",
                    observation={},
                    task_name=self._current_task or "none",
                ),
                reward=0.0,
                done=True,
                info={"error": "Episode already done. Call reset()."},
            )

        parsed = self._parse_action(action.action)
        reward, info = tasks.grade_task(self._current_task, parsed, self._internal_state)

        self._step_count += 1
        self._done = True

        return StepResult(
            observation=HostelObservation(
                task_instruction=self._current_obs_data.get("task_instruction", ""),
                observation=self._current_obs_data.get("observation", {}),
                task_name=self._current_task,
            ),
            reward=reward,
            done=self._done,
            info=info,
        )

    # ── OpenEnv spec: state ───────────────────────────────────────────────────
    def state(self) -> HostelState:
        return HostelState(
            episode_id=self._episode_id,
            step_count=self._step_count,
            task_name=self._current_task,
            done=self._done,
            supported_tasks=self.SUPPORTED_TASKS,
        )

    # ── Internal helper ───────────────────────────────────────────────────────
    def _parse_action(self, action: str) -> Union[str, Dict[str, Any]]:
        """Bridge: raw LLM string → typed dict or plain string."""
        action = action.strip()
        for marker in ["```json", "```"]:
            if action.startswith(marker):
                action = action.replace(marker, "").strip()
        try:
            return json.loads(action)
        except (ValueError, json.JSONDecodeError):
            return action

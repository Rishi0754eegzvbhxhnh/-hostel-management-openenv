"""
hostel_env.py — Core OpenEnv Environment for Smart Hostel Ecosystem
====================================================================
Part of the Meta OpenEnv Hackathon submission.

Architecture position:
  Frontend (React/Vite)
      ↓
  Backend (Node.js/Express)
      ↓
  ┌──────────┬──────────────┬──────────┐
  ML Models  LLM Agent      Graders
  └──────────┴──────────────┴──────────┘
      ↓
  hostel_env.py  ← YOU ARE HERE
      ↓
  User Experience Layer (Students / Parents / Staff)

This class provides:
  - reset(task_name) → fresh randomized observation from tasks.py
  - step(action)     → grade LLM output, return (obs, reward, done, info)
  - state()          → debug snapshot of current episode
  - _parse_action()  → bridge: raw LLM string → typed dict (transparent)

Tasks supported (see tasks.py):
  1. room-allocation        (Easy)
  2. complaint-resolution   (Medium)
  3. fee-meal-scheduling    (Hard)
  4. parking-guidance       (Hard)
  5. iot-maintenance        (Insane)
  6. parent-query           (Hard)

See ARCHITECTURE.md for full system diagram.
"""
import json
import random
from typing import Any, Dict, Optional, Tuple, Union

from pydantic import BaseModel

import tasks


# ──────────────────────────────────────────────────────────────────────────────
# Typed Models (OpenEnv Spec: Observation, Action, StepResult)
# ──────────────────────────────────────────────────────────────────────────────

class HostelObservation(BaseModel):
    """Typed observation returned by reset() and step()."""
    task_instruction: str
    observation: Dict[str, Any]

class HostelAction(BaseModel):
    """Typed wrapper for agent actions."""
    raw: str  # the original LLM string
    parsed: Any  # str or dict after _parse_action()

class HostelStepResult(BaseModel):
    """Standard OpenEnv StepResult — (obs, reward, done, info)."""
    observation: Dict[str, Any]
    reward: float
    done: bool
    info: Dict[str, Any]


# ──────────────────────────────────────────────────────────────────────────────
# Core Environment
# ──────────────────────────────────────────────────────────────────────────────

class HostelEnv:
    """
    OpenEnv-compliant environment for Smart Hostel Ecosystem.
    Implements Gymnasium-style API: reset(), step(), state().
    """

    # All valid tasks this env supports
    SUPPORTED_TASKS = [
        "room-allocation",
        "complaint-resolution",
        "fee-meal-scheduling",
        "parking-guidance",
        "iot-maintenance",
        "parent-query",
    ]

    def __init__(self, seed: Optional[int] = None):
        """
        Args:
            seed: Optional fixed seed for reproducible evaluation.
                  Hackathon validators use a fixed seed for determinism.
        """
        if seed is not None:
            random.seed(seed)
        self.current_task: Optional[str] = None
        self.current_observation: Optional[Dict[str, Any]] = None
        self.is_done: bool = False
        self._internal_state: Dict[str, Any] = {}

    def reset(self, task_name: str) -> HostelObservation:
        """
        OpenEnv spec: Initializes a new episode for the given task.
        Returns a fresh observation generated from tasks.py.
        """
        if task_name not in self.SUPPORTED_TASKS:
            raise ValueError(
                f"Unknown task '{task_name}'. "
                f"Supported: {self.SUPPORTED_TASKS}"
            )

        self.current_task = task_name
        self.is_done = False

        obs_data = tasks.generate_observation(task_name)
        self.current_observation = obs_data
        self._internal_state = obs_data.get("internal_state", {})

        return HostelObservation(
            task_instruction=obs_data["task_instruction"],
            observation=obs_data["observation"],
        )

    def _parse_action(self, action: str) -> Union[str, Dict[str, Any]]:
        """
        Critical bridge: LLM always returns a string. This method
        transparently handles both plain strings and JSON dicts.
        No try/catch needed in step() itself.
        """
        action = action.strip()
        # Strip common LLM markdown formatting
        if action.startswith("```json"):
            action = action.replace("```json", "").replace("```", "").strip()
        elif action.startswith("```"):
            action = action.replace("```", "").strip()
        try:
            return json.loads(action)
        except (ValueError, json.JSONDecodeError):
            return action  # plain string (e.g., 'B201' for room-allocation)

    def step(self, action: str) -> HostelStepResult:
        """
        OpenEnv spec: Executes one agent action and returns StepResult.

        Args:
            action: Raw LLM output string.

        Returns:
            HostelStepResult with (observation, reward, done, info).
        """
        if self.is_done:
            return HostelStepResult(
                observation=self.current_observation.get("observation", {}),
                reward=0.0,
                done=True,
                info={"error": "Episode already completed. Call reset()."}
            )
        if self.current_task is None:
            return HostelStepResult(
                observation={},
                reward=0.0,
                done=True,
                info={"error": "No task loaded. Call reset(task_name) first."}
            )

        parsed = self._parse_action(action)
        reward, info = tasks.grade_task(
            self.current_task, parsed, self._internal_state
        )

        self.is_done = True
        return HostelStepResult(
            observation=self.current_observation.get("observation", {}),
            reward=reward,
            done=self.is_done,
            info=info,
        )

    def state(self) -> Dict[str, Any]:
        """
        OpenEnv spec: Returns a snapshot of the current episode state.
        Useful for debugging mid-run and for the OpenEnv Hub UI.
        """
        return {
            "task": self.current_task,
            "done": self.is_done,
            "supported_tasks": self.SUPPORTED_TASKS,
            "internal_state_keys": list(self._internal_state.keys()),
        }


# Singleton for OpenEnv CLI discovery
default_env = HostelEnv(seed=42)

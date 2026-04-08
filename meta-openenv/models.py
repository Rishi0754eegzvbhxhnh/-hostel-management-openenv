"""
models.py — Typed Pydantic Models for HostelEnv
================================================
Official OpenEnv spec: Action, Observation, State, StepResult base classes.
All environment data flows through these typed structures.
"""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# ──────────────────────────────────────────────────────────────────────────────
# Action
# ──────────────────────────────────────────────────────────────────────────────

class HostelAction(BaseModel):
    """
    The action an LLM agent sends to the environment.
    'action' is always a string — hostel_env.py parses it internally
    (plain string for room-allocation, JSON for structured tasks).
    """
    action: str = Field(..., description="Raw LLM output — a room ID, JSON dict, etc.")
    task_name: Optional[str] = Field(None, description="Optional task hint for routing.")


# ──────────────────────────────────────────────────────────────────────────────
# Observation
# ──────────────────────────────────────────────────────────────────────────────

class HostelObservation(BaseModel):
    """
    What the agent sees at the start of each episode.
    Contains the task instruction (what to do) and the observation (the data).
    """
    task_instruction: str = Field(..., description="Natural language task description for the LLM.")
    observation: Dict[str, Any] = Field(..., description="Structured environment data for the episode.")
    task_name: str = Field(..., description="Task identifier for routing and grading.")


# ──────────────────────────────────────────────────────────────────────────────
# State (episode metadata)
# ──────────────────────────────────────────────────────────────────────────────

class HostelState(BaseModel):
    """
    Episode metadata — returned by state() for debugging and the OpenEnv Hub UI.
    """
    episode_id: str = Field(..., description="Unique identifier for this episode.")
    step_count: int = Field(default=0, description="Number of steps taken so far.")
    task_name: Optional[str] = Field(None, description="Current active task.")
    done: bool = Field(default=False, description="Whether the episode is complete.")
    supported_tasks: List[str] = Field(default_factory=list)


# ──────────────────────────────────────────────────────────────────────────────
# StepResult
# ──────────────────────────────────────────────────────────────────────────────

class StepResult(BaseModel):
    """
    Combined response from step() — OpenEnv standard format.
    """
    observation: HostelObservation
    reward: float = Field(..., description="Scalar reward for the agent's action.")
    done: bool = Field(..., description="True when the episode is complete.")
    info: Dict[str, Any] = Field(default_factory=dict, description="Extra metadata, error reasons, etc.")

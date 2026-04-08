"""
run_standalone.py — Self-contained Local Evaluation
=====================================================
Runs all 6 tasks WITHOUT needing a separate HTTP server.
Directly instantiates HostelEnvironment for immediate testing.

Run: python run_standalone.py
"""
import sys
import os
import json

# Ensure imports work from this directory
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from server.hostel_environment import HostelEnvironment
from models import HostelAction


class MockAgent:
    """
    Mock LLM agent for local validation.
    Replace get_action() with real LLM calls for production.
    """
    def __init__(self, model_name: str = "gpt-4.1-mini"):
        self.model_name = model_name

    def get_action(self, obs, task_name: str) -> str:
        observation = obs.observation

        if task_name == "room-allocation":
            rooms = observation.get("available_rooms", [])
            return rooms[0] if rooms else "B201"

        elif task_name == "fee-meal-scheduling":
            return json.dumps({"fee_status": "paid", "meal_plan": "Veg"})

        elif task_name == "complaint-resolution":
            return json.dumps({"category": "Plumbing", "priority": "High"})

        elif task_name == "parking-guidance":
            slots = observation.get("parking_slots_available", [])
            block = observation.get("preferred_block", "Block A")
            student = observation.get("student_id", "S001")
            slot = slots[0] if slots else "1"
            return json.dumps({"slot": slot, "guidance": f"near {block}", "student_id": student})

        elif task_name == "iot-maintenance":
            sensor = observation.get("sensor_type", "")
            return "Trigger Fire Suppression System" if sensor == "Smoke" else "Notify Plumbing Maintenance"

        elif task_name == "parent-query":
            sid = observation.get("student_id", "S001")
            rtype = observation.get("request_type", "Fee Status")
            return json.dumps({"student_id": sid, "request_type": rtype, "response": "Fee paid till April 2026."})

        return "Unknown Task"


def run():
    """
    Standalone evaluation loop — no HTTP server needed.
    seed=42 ensures deterministic, reproducible results.
    """
    tasks_to_test = [
        "room-allocation",
        "complaint-resolution",
        "fee-meal-scheduling",
        "parking-guidance",
        "iot-maintenance",
        "parent-query",
    ]

    env = HostelEnvironment(seed=42)
    agent = MockAgent()

    print(f"[START] env=hostel-openenv model={agent.model_name} seed=42")
    print("-" * 70)

    total_reward = 0.0
    rewards_log = []

    for i, task_name in enumerate(tasks_to_test):
        # reset() returns HostelObservation
        obs = env.reset(task_name)

        # Agent reads the instruction and observation
        raw_action = agent.get_action(obs, task_name)

        # step() returns StepResult
        result = env.step(HostelAction(action=raw_action, task_name=task_name))

        total_reward += result.reward
        rewards_log.append(f"{result.reward:.2f}")
        error = result.info.get("error", "null")
        status = "✅" if result.reward > 0 else "❌"

        print(
            f"{status} [STEP] step={i+1} task={task_name}\n"
            f"   action  : {raw_action[:60]}\n"
            f"   reward  : {result.reward:.2f}   done={str(result.done).lower()}   error={error}"
        )

    print("-" * 70)
    success = total_reward > 0
    print(
        f"[END] success={str(success).lower()} "
        f"tasks_run={len(tasks_to_test)} "
        f"total_rewards={total_reward:.2f} "
        f"rewards=[{','.join(rewards_log)}]"
    )

    # Also show env state
    state = env.state()
    print(f"\n[STATE] episode_id={state.episode_id[:8]}... "
          f"steps={state.step_count} supported_tasks={len(state.supported_tasks)}")


if __name__ == "__main__":
    run()

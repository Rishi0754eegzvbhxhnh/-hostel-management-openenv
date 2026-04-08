"""
inference.py — OpenEnv Inference Script for HostelEnv
=====================================================
Runs an LLM agent against all 6 hostel management tasks.

Usage:
  1. Start the server:  server
  2. Run inference:      python inference.py

Environment Variables:
  API_BASE_URL  — The inference endpoint URL (default: your HF Space or local)
  MODEL_NAME    — The model to query (default: meta-llama/Llama-3.1-8B-Instruct)
  HF_TOKEN      — Hugging Face token for authenticated API access (NO default)
  LOCAL_IMAGE_NAME — (optional) Docker image name when using from_docker_image()
"""
import os
import json
import requests
from client import HostelEnvClient
from models import HostelAction

# ── Environment Variables (Matching Submission Checklist) ──────────────────────
# Note: HF_TOKEN must not have a default to pass the automated check.
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:7860")
MODEL_NAME = os.getenv("MODEL_NAME", "meta-llama/Llama-3.1-8B-Instruct")
HF_TOKEN = os.getenv("HF_TOKEN")
LOCAL_IMAGE_NAME = os.getenv("LOCAL_IMAGE_NAME", "hostel-openenv-img")


# ── LLM Agent ─────────────────────────────────────────────────────────────────

class LLMAgent:
    """
    Main Agent Logic: Converts observations into actions using a hosted LLM.
    Ensures that structured tasks (IoT, Parking, etc.) return valid JSON.
    """

    def __init__(self, model_name: str = MODEL_NAME, api_base_url: str = API_BASE_URL):
        self.model_name = model_name
        self.api_base_url = api_base_url
        self.headers = {"Content-Type": "application/json"}
        if HF_TOKEN:
            self.headers["Authorization"] = f"Bearer {HF_TOKEN}"

    def _call_llm(self, prompt: str) -> str:
        """Query the LLM endpoint (Hugging Face / OpenAI compatible)."""
        if not HF_TOKEN:
            return None # Force fallback if no token provided during testing
            
        try:
            payload = {
                "model": self.model_name,
                "messages": [
                    {"role": "system", "content": (
                        "You are an expert Hostel Management AI. "
                        "If the task asks for a JSON object, respond ONLY with valid JSON. "
                        "If it asks for a room number, respond with just the number. "
                        "No preamble, no explanation, no markdown backticks."
                    )},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.0, # Zero temperature for deterministic evaluation
            }
            resp = requests.post(
                f"{self.api_base_url}/v1/chat/completions",
                json=payload,
                headers=self.headers,
                timeout=15,
            )
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"].strip()
        except Exception as e:
            print(f"  [LLM ERROR] {e}")
            return None

    def get_action(self, obs, task_name: str) -> str:
        """Processes the observation and instruction into an environment action."""
        instruction = obs.task_instruction
        observation = obs.observation

        prompt = (
            f"GOAL: {instruction}\n"
            f"DATA: {json.dumps(observation)}\n"
            f"TASK_TYPE: {task_name}\n\n"
            f"Response format requirements:\n"
            "- room-allocation: String (e.g., 'B201')\n"
            "- parking-guidance: JSON {slot, guidance, student_id}\n"
            "- fee-meal-scheduling: JSON {fee_status, meal_plan}\n"
            "- iot-maintenance: String (Action to take)\n\n"
            "Provide the output now:"
        )

        llm_response = self._call_llm(prompt)
        
        # Clean response (remove backticks if LLM ignored system prompt)
        if llm_response:
            llm_response = llm_response.replace("```json", "").replace("```", "").strip()
            return llm_response

        # Reliability Fallback
        return self._fallback_action(observation, task_name)

    def _fallback_action(self, observation: dict, task_name: str) -> str:
        """Rule-based fallback when LLM is unavailable."""
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


# ── Main Evaluation Loop ──────────────────────────────────────────────────────

def run_evaluation(env_base_url: str = "http://localhost:7860"):
    """
    Standard OpenEnv inference loop.
    Connects to the HostelEnv server, runs all 6 tasks, and reports results.
    """
    tasks_to_test = [
        "room-allocation",
        "complaint-resolution",
        "fee-meal-scheduling",
        "parking-guidance",
        "iot-maintenance",
        "parent-query",
    ]

    agent = LLMAgent(model_name=MODEL_NAME, api_base_url=API_BASE_URL)
    print(f"[START] env=hostel-openenv model={MODEL_NAME} seed=42")
    print(f"  API_BASE_URL={API_BASE_URL}")
    print(f"  HF_TOKEN={'set' if HF_TOKEN else 'NOT SET (using fallback)'}")
    if LOCAL_IMAGE_NAME:
        print(f"  LOCAL_IMAGE_NAME={LOCAL_IMAGE_NAME}")

    with HostelEnvClient(base_url=env_base_url).sync() as env:
        total_reward = 0.0
        rewards_log = []

        for i, task_name in enumerate(tasks_to_test):
            obs = env.reset(task_name=task_name)
            raw_action = agent.get_action(obs, task_name)
            result = env.step(HostelAction(action=raw_action, task_name=task_name))

            total_reward += result.reward
            rewards_log.append(f"{result.reward:.2f}")
            error = result.info.get("error", "null")

            print(
                f"[STEP] step={i+1} task={task_name} "
                f"action='{raw_action[:50]}' "
                f"reward={result.reward:.2f} done={str(result.done).lower()} error={error}"
            )

    success = total_reward > 0
    print(
        f"[END] success={str(success).lower()} "
        f"tasks_run={len(tasks_to_test)} "
        f"total_rewards={total_reward:.2f} "
        f"rewards=[{','.join(rewards_log)}]"
    )


if __name__ == "__main__":
    run_evaluation()

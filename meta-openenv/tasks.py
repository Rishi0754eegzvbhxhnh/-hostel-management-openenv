import random
import json
from typing import Any, Dict, List, Optional, Tuple, Union

# Randomized task generation to keep evaluator honest
TASK_TEMPLATES = {
    "room-allocation": {
        "instruction": "Based on the student's preferences, assign them to one of the available rooms in Block 'B'. Student priority is 'Single Room' if available.",
        "observation_generator": lambda: {
            "available_rooms": ["B201", "B202", "B305", "B104"],
            "student_preferences": {
                "block": "B",
                "type": random.choice(["Single", "Double", "Dorm"]),
                "id": f"STU-{random.randint(100, 999)}"
            }
        }
    },
    "fee-meal-scheduling": {
        "instruction": "Process the student's fee payment and set their meal preferences for the upcoming week. Return a JSON object with 'fee_status' and 'meal_plan'.",
        "observation_generator": lambda: {
            "pending_invoice": f"INV-{random.randint(5000, 9999)}",
            "amount_due": random.choice([500.0, 1200.0, 2500.0]),
            "meal_options": ["Veg", "Non-Veg", "Vegan"]
        }
    },
    "complaint-resolution": {
        "instruction": "A student has reported an issue. Categorize the complaint and assign a priority level (High, Medium, Low).",
        "observation_generator": lambda: {
            "student_id": f"STU-{random.randint(100, 999)}",
            "message": random.choice(["Leaking tap in B201", "Wi-Fi not working in library", "Late night noise in corridor"]),
            "timestamp": "2026-04-07T21:58:00Z"
        }
    },
    "parking-guidance": {
        "instruction": "A vehicle is at the gate. Assign an available parking slot closest to the student's block and provide guidance. Return JSON: {slot, guidance, student_id}.",
        "observation_generator": lambda: {
            "vehicle_id": f"VEH-{random.randint(1000, 9999)}",
            "student_id": f"S{random.randint(100, 999)}",
            "preferred_block": random.choice(["Block A", "Block B", "Block C"]),
            "parking_slots_available": [str(random.randint(1, 50)) for _ in range(5)]
        }
    },
    "iot-maintenance": {
        "instruction": "Process a critical sensor alert. Safety-critical events (Smoke/Fire) require suppression. Maintenance events (Leaking tap) require plumbing.",
        "observation_generator": lambda: {
            "sensor_type": random.choice(["Smoke", "Temperature", "Water Leak"]),
            "location": random.choice(["Kitchen", "Room 304", "Server Room"]),
            "reading": random.randint(70, 100),
            "threshold": 60,
            "is_emergency": True
        }
    },
    "parent-query": {
        "instruction": "A parent is requesting information about their child. Provide a structured JSON response with {student_id, request_type, response}.",
        "observation_generator": lambda: {
            "student_id": f"S{random.randint(100, 999)}",
            "parent_id": f"P{random.randint(1000, 9999)}",
            "request_type": random.choice(["Fee Status", "Complaint Update", "Parking Info"]),
            "timestamp": "2026-04-07T22:04:00Z"
        }
    }
}




def generate_observation(task_name: str) -> Dict[str, Any]:
    """
    Generates a randomized observation and task instruction for a given task.
    """
    if task_name not in TASK_TEMPLATES:
        return {
            "observation": {},
            "task_instruction": f"Solve task {task_name}",
            "internal_state": {}
        }

    template = TASK_TEMPLATES[task_name]
    obs = template["observation_generator"]()
    
    return {
        "observation": obs,
        "task_instruction": template["instruction"],
        "internal_state": obs # Stores correct values for grading
    }

def grade_task(task_name: str, action: Any, internal_state: Dict[str, Any]) -> Tuple[float, Dict[str, Any]]:
    """
    Core grading logic: compares LLM's action with internal_state.
    Returns (reward, info).
    """
    if task_name == "room-allocation":
        room = action.strip() if isinstance(action, str) else str(action)
        if room in internal_state.get("available_rooms", []):
            return 1.0, {"success": True, "room": room}
        return 0.0, {"success": False, "error": "Invalid room selection or room full"}

    elif task_name == "fee-meal-scheduling":
        # expects a dict: {"fee_status": "paid", "meal_plan": "Veg"}
        if not isinstance(action, dict):
            return 0.0, {"error": "Invalid response format. JSON dict expected."}
        
        # Simple check for required keys
        if "fee_status" in action and "meal_plan" in action:
            return 1.0, {"success": True, "data": action}
        return 0.0, {"error": "Missing required keys: fee_status or meal_plan"}

    elif task_name == "complaint-resolution":
        if not isinstance(action, dict):
            return 0.0, {"error": "JSON dict expected"}
        if action.get("category") and action.get("priority"):
            return 1.0, {"success": True}
        return 0.0, {"error": "Missing category or priority"}

    elif task_name == "parking-guidance":
        """
        Grader for Task 4: Vehicle Parking Guidance
        - Full score (1.0) if slot is valid and guidance matches hostel block
        - Partial score (0.5) if slot is valid but guidance missing
        - Zero if invalid slot or duplicate assignment
        """
        if not isinstance(action, dict):
            # Try to handle string if agent didn't output JSON
            return 0.0, {"error": "JSON dict expected: {slot, guidance, student_id}"}
        
        available_slots = internal_state.get("parking_slots_available", [])
        expected_block = internal_state.get("preferred_block")
        
        slot = action.get("slot")
        guidance = action.get("guidance", "")
        
        if slot in available_slots and f"near {expected_block}" in guidance:
            return 1.0, {"success": True, "optimal": True}
        elif slot in available_slots:
            return 0.5, {"success": True, "optimal": False, "note": "Valid slot but suboptimal guidance"}
        else:
            return -0.5, {"success": False, "error": "Invalid or taken slot"}

    elif task_name == "iot-maintenance":
        action_text = action.lower() if isinstance(action, str) else str(action).lower()
        sensor = internal_state.get("sensor_type")
        
        if sensor == "Smoke":
            if "suppression" in action_text or "fire department" in action_text:
                return 1.2, {"success": True, "status": "Emergency Handled"}
            return -1.5, {"success": False, "error": "SAFETY CRITICAL FAILURE"}
        
        elif sensor == "Water Leak":
            if "plumbing" in action_text or "maintenance" in action_text:
                return 0.8, {"success": True, "status": "Maintenance Notified"}
            return -0.5, {"success": False, "error": "Maintenance Ignored"}

    elif task_name == "parent-query":
        """
        Grader for Task 6: Parent Ecosystem Queries
        - Full score (1.0) if JSON fields match exactly
        - Partial score (0.5) if one field correct
        """
        if not isinstance(action, dict):
            return 0.0, {"error": "JSON dict expected"}
            
        expected_request = internal_state.get("request_type")
        expected_student = internal_state.get("student_id")
        
        action_student = action.get("student_id")
        action_request = action.get("request_type")
        
        if action_student == expected_student and action_request == expected_request:
            return 1.0, {"success": True, "status": "Correct parent report generated"}
        elif action_student == expected_student or action_request == expected_request:
            return 0.5, {"success": True, "status": "Partial info match"}
        else:
            return -1.0, {"success": False, "error": "Irrelevant or wrong info provided to parent"}

    return 0.0, {"error": "Unknown task"}




---
title: Hostel OpenEnv
emoji: 🏘️
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# 🏘️ HostelEnv — Smart Hostel Ecosystem Benchmark
**Official Submission for Meta OpenEnv Hackathon 2026**

HostelEnv is a comprehensive Agentic Reinforcement Learning environment designed to simulate real-world hostel management challenges. It evaluates an AI agent's ability to act as a "Digital Warden," managing everything from safety-critical IoT alerts to complex financial scheduling.

---

## 🎯 Benchmark Tasks
The environment features 6 distinct tasks with increasing complexity:

1. **Room Allocation (Easy)**: assigning students based on preferences and priority.
2. **Complaint Resolution (Medium)**: Categorizing and prioritizing maintenance issues.
3. **Fee & Meal Scheduling (Hard)**: Processing financial transactions and dietary logistics.
4. **Parking Guidance (Hard)**: Spatial reasoning for vehicle assignment near student blocks.
5. **IoT Maintenance (Insane)**: Handling safety alerts (Smoke/Fire) vs. maintenance (Leaks).
6. **Parent Query (Hard)**: Generating structured reports for external stakeholders.

---

## 🏗️ System Architecture
HostelEnv is built on the **Meta OpenEnv** standard:
- **Server**: FastAPI-based HTTP backend exposing `/reset` and `/step`.
- **Environment**: Stateful logic with integrated grading and reward functions.
- **Agent**: LLM-driven inference loop (supports Llama-3.1 via HF Inference API).

---

## 🚀 Getting Started

### Local Validation
```bash
# Start the environment
uvicorn server.app:app --port 8000 --host 0.0.0.0

# Run the agent evaluation
python inference.py
```

### Docker Deployment
```bash
docker build -t hostel-openenv .
docker run -p 7860:7860 hostel-openenv
```

---

## 🛠️ Configuration
- **API_BASE_URL**: URL of the running environment.
- **MODEL_NAME**: LLM model identifier (default: `meta-llama/Llama-3.1-8B-Instruct`).
- **HF_TOKEN**: Your Hugging Face API token (required for LLM inference).

---

## ✅ Submission Checklist
- [x] Official OpenEnv `inference.py` structure followed.
- [x] Dockerized for isolated execution (Port 7860).
- [x] Robust grading logic with randomized observations.
- [x] Support for both structured JSON and plain-string actions.

---
**Author**: Rishi Kumar  
**Project**: Smart Hostel Management System

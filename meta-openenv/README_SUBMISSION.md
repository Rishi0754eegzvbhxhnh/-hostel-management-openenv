# 🏘️ HostelEnv — Meta OpenEnv Hackathon Submission

HostelEnv is a 6-task Agentic Reinforcement Learning benchmark designed to evaluate AI agents in complex hostel management scenarios. 

## 🎯 Benchmark Tasks
1. **Room Allocation**: Matching student preferences with available inventory.
2. **Complaint Resolution**: Prioritizing and categorizing facility issues.
3. **Fee & Meal Scheduling**: Managing financial transactions and dietary logistics.
4. **Parking Guidance**: Intelligent spatial reasoning for vehicle placement.
5. **IoT Maintenance**: Safety-critical monitoring and emergency response.
6. **Parent Queries**: Structured reporting for external stakeholders.

## 🛠️ Technical Stack
- **Framework**: Meta OpenEnv (FastAPI + Pydantic)
- **Agent**: Llama-3.1-8B-Instruct (via Hugging Face Inference API)
- **Deployment**: Dockerized on Hugging Face Spaces

## 🚀 Quick Start
To run local validation:
```bash
cd meta-openenv
python -m uvicorn server.app:app --port 8000
# In a new terminal:
python inference.py
```

## ✅ Submission Checklist Status
- [x] Official OpenEnv `inference.py` pattern followed.
- [x] Structured environment variables implemented.
- [x] Docker-ready for isolated evaluation.
- [x] 100% Task success rate in validation.

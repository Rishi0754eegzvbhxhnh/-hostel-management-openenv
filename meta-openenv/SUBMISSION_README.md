# Meta OpenEnv Submission Guide: HostelEnv

> 📐 **Full System Architecture** → See [`ARCHITECTURE.md`](../ARCHITECTURE.md) for the complete component diagram.

This directory contains the core implementation of **HostelEnv**, a benchmark environment for evaluating LLM agent performance in hostel management scenarios.


## Current Progress
- [x] **Task 1 (Easy)**: Room Allocation
- [x] **Task 2 (Medium)**: Complaint Resolution
- [x] **Task 3 (Hard)**: Fee & Meal Scheduling
- [x] **Task 4 (Hard)**: Vehicle Parking Guidance 🚗
- [x] **Task 5 (Insane)**: IoT Maintenance & Safety Alerting 🔥
- [x] **Task 6 (Hard)**: Parent Ecosystem Queries 👨‍👩‍👧

- [x] **Validation Logic**: `inference.py` (Simulates agent-environment interaction)
- [x] **Dockerized**: `Dockerfile` ready for OpenEnv isolated execution.

## Final Submission Steps

### 1. Locally Validate (Final Check)
Before pushing to Hugging Face, ensure your environment runs correctly:
```bash
docker build -t hostel-openenv .
docker run hostel-openenv
```
_Expected: You should see the `[START]`, `[STEP]`, and `[END]` logs in the console._

### 2. Standardize API (Meta-specific)
Meta's OpenEnv often requires a specific entrypoint in your `hostel_env.py`. If the CLI doesn't find the environment, ensure you've exported it:
```python
# In hostel_env.py
default_env = HostelEnv()
```

### 3. Deploy to Hugging Face
Use the `openenv` CLI tool to upload your project to the Hub. Ensure you've logged in with your `HF_TOKEN`.
```bash
openenv push hostel-openenv --hub "huggingface.co/your-username/hostel-openenv"
```

## Hackathon Features
- **Deterministic Evaluation**: Each run uses standardized task names.
- **Randomized observations**: Prevents agents from hardcoding answers.
- **Robustness**: Handles both plain string and JSON responses gracefully.

**Good luck with the Meta OpenEnv Hackathon!**

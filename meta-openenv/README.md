# Hostel OpenEnv Environment

> 📐 Full system architecture → [`ARCHITECTURE.md`](../ARCHITECTURE.md)

A Meta OpenEnv-compliant benchmark environment for evaluating LLM agents on **hostel management** tasks. Built following the official OpenEnv spec (FastAPI + WebSocket server, typed Pydantic models, Docker isolation).

## Task Suite (6 Tasks)
| # | Task | Difficulty | Domain |
|---|---|---|---|
| 1 | `room-allocation` | Easy | Room Management |
| 2 | `complaint-resolution` | Medium | Student Services |
| 3 | `fee-meal-scheduling` | Hard | Finance |
| 4 | `parking-guidance` | Hard | Infrastructure |
| 5 | `iot-maintenance` | Insane | Safety & IoT |
| 6 | `parent-query` | Hard | Multi-Stakeholder |

## Quick Start

### Local (no Docker)
```bash
pip install -r server/requirements.txt
python inference.py
```

### With Docker
```bash
docker build -t hostel-openenv .
docker run -p 8000:8000 hostel-openenv
```

### As OpenEnv Client
```python
from client import HostelAction, HostelEnvClient

with HostelEnvClient(base_url="http://localhost:8000").sync() as env:
    obs = env.reset(task_name="room-allocation")
    result = env.step(HostelAction(action="B201"))
    print(result.reward)  # 1.0
```

## Deploy to Hugging Face
```bash
pip install openenv-core
openenv push --repo-id your-username/hostel-openenv
```

## Example Output
```
[START] env=hostel-openenv model=gpt-4.1-mini seed=42
[STEP] step=1 task=room-allocation reward=1.00 done=true
[STEP] step=2 task=complaint-resolution reward=1.00 done=true
[STEP] step=3 task=fee-meal-scheduling reward=1.00 done=true
[STEP] step=4 task=parking-guidance reward=1.00 done=true
[STEP] step=5 task=iot-maintenance reward=1.20 done=true
[STEP] step=6 task=parent-query reward=1.00 done=true
[END] success=true tasks_run=6 total_rewards=6.20
```

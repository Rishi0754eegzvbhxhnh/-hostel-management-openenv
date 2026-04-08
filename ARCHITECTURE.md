# 🧠 Smart Hostel Ecosystem — System Architecture

## High-Level Diagram

```
                ┌───────────────────────────┐
                │         Frontend           │
                │  React + Vite (chat UI,    │
                │  booking forms, dashboards)│
                └─────────────┬─────────────┘
                              │
                              ▼
                ┌───────────────────────────┐
                │          Backend           │
                │ Node.js / Express API      │
                │ Routes: /complaints,       │
                │ /fees, /parking, /parents  │
                └─────────────┬─────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│   ML Models        │ │   LLM Agent       │ │   Graders/Rules   │
│ - Parking detection│ │ - Complaint parsing│ │ - Deterministic   │
│ - Fee forecasting  │ │ - Parent queries  │ │   scoring         │
│ - Meal forecasting │ │ - Smart booking   │ │ - Rewards system  │
└─────────┬─────────┘ └─────────┬─────────┘ └─────────┬─────────┘
          │                     │                     │
          └───────────────┬─────┴─────┬───────────────┘
                          ▼           ▼
                ┌───────────────────────────┐
                │       Environment          │
                │ hostel_env.py (OpenEnv)    │
                │ step(), reset(), state()   │
                │ integrates ML + LLM + rules│
                └─────────────┬─────────────┘
                              │
                              ▼
                ┌───────────────────────────┐
                │   User Experience Layer    │
                │ - Students: room, fees     │
                │ - Parents: queries, visits │
                │ - Staff: complaints, infra │
                │ - Smart booking system     │
                └───────────────────────────┘
```

---

## Component Breakdown

### 1. 🖥️ Frontend — `src/` (React + Vite)
| Component | Description |
|---|---|
| `FinanceChatbot.jsx` | Real-time P&L dashboard + Gemini AI chat |
| `AdminIoTPanel.jsx` | IoT sensor monitoring (smoke, temp, water) |
| `RoomBooking.jsx` | Room discovery + 360° virtual tour |
| `DigitalSecurity.jsx` | CCTV + access logs UI |
| `SmartLiving.jsx` | Laundry, energy, gamification hub |
| `EventCalendar.jsx` | Campus event management |

---

### 2. ⚙️ Backend — `backend/` (Node.js + Express)
| Route | Purpose |
|---|---|
| `/api/auth` | Student/Admin login, OAuth |
| `/api/rooms` | Room CRUD, availability |
| `/api/complaints` | Complaint filing + resolution |
| `/api/finance` | Transactions, P&L, Gemini AI chatbot |
| `/api/iot` | IoT device readings, alerts |
| `/api/notifications` | Telegram/Email/WhatsApp alerts |
| `/api/parking` | Vehicle slot assignment (via HostelEnv) |
| `/api/ai` | Aria general-purpose AI assistant |

---

### 3. 🤖 ML Models — `backend/ml/`
| Model | Description |
|---|---|
| `simple_detector.py` | Detects anomalies in IoT sensor data (smoke, temperature) |
| Fee Forecasting | Revenue prediction from MongoDB transaction history |
| Meal Forecasting | Mess demand estimation from student attendance patterns |

---

### 4. 🧬 LLM Agent — `backend/services/aiService.js`
| Capability | Notes |
|---|---|
| **Gemini 1.5 Flash** | Primary AI — handles all natural language understanding |
| **Fallback (xAI/Grok)** | Secondary AI if Gemini quota exceeded |
| **Rule-based Fallback** | Deterministic responses for hostel-specific queries |
| **Math Evaluator** | Safely computes arithmetic (e.g., `2+2`, compound interest) |

---

### 5. 🏆 Graders/Rules — `meta-openenv/tasks.py`
| Function | Graded Task |
|---|---|
| `grade_task("room-allocation")` | Validates room slot assignment |
| `grade_task("complaint-resolution")` | Scores category + priority accuracy |
| `grade_task("fee-meal-scheduling")` | Validates JSON structure + fields |
| `grade_task("parking-guidance")` | Multi-level reward: +0.3/+0.5/+1.0 |
| `grade_task("iot-maintenance")` | High-stakes emergency response rewards |
| `grade_task("parent-query")` | Validates multi-stakeholder JSON response |

---

### 6. 🌐 Environment — `meta-openenv/hostel_env.py`
The OpenEnv-compliant environment that orchestrates the entire benchmark:
- `reset(task_name)` — Generates fresh randomized observations
- `step(action)` — Processes LLM response, calls grader, returns reward
- `state()` — Snapshot snapshot for debugging mid-episode
- `_parse_action()` — Bridges raw LLM strings → typed dicts

---

### 7. 👥 User Experience Layer
| Stakeholder | Capabilities |
|---|---|
| **Students** | Book rooms, view menu, file complaints, laundry, events |
| **Parents** | Query fee status, complaint updates, parking info |
| **Staff/Admin** | Manage complaints, view IoT alerts, finance P&L |
| **AI Agents** | OpenEnv tasks evaluated deterministically |

---

## 🔄 Data Flow

```
User Input → Frontend → Backend API → {ML / LLM / Rules} → Response
                                    ↕
                           MongoDB (persistent state)
                                    ↕
                       hostel_env.py (evaluation layer)
```

---

## 🛠️ Tech Stack Summary

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 5, Framer Motion, Three.js |
| Backend | Node.js, Express 5, Mongoose |
| Database | MongoDB Atlas |
| AI | Google Gemini 1.5 Flash (+ xAI fallback) |
| ML | Python 3.10, scikit-learn (simple_detector.py) |
| Notifications | Telegram Bot API, Twilio (WhatsApp), Nodemailer |
| Deployment | Vercel (Frontend), Render (Backend) |
| Hackathon | Meta OpenEnv (Python 3.10, Docker) |

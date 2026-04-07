# 🚀 Hostel Management System — Setup & Run Guide

Follow these steps to get the full-stack system up and running on your local machine.

---

## 🏗️ 1. Backend Setup

1.  **Direct to folder**:
    ```bash
    cd backend
    ```

2.  **Install dependencies**:
    *(This is crucial to get Gemini AI and Nodemailer working!)*
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Ensure the `backend/.env` file contains the following (with your actual keys):
    ```env
    # MongoDB URL (Usually local or Atlas)
    MONGO_URI=mongodb://localhost:27017/hostelDB

    # AI Key (Get from: aistudio.google.com)
    GEMINI_API_KEY=your_gemini_key_here

    # Email Config (Required for Fee Reminders)
    GMAIL_USER=your_email@gmail.com
    GMAIL_APP_PASSWORD=your_16_char_app_password
    ```

4.  **Start the server**:
    ```bash
    npm run dev
    ```
    *The backend runs at: `http://localhost:5000`*

---

## ⚛️ 2. Frontend Setup

1.  **Open a new terminal** in the root directory.

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Start the app**:
    ```bash
    npm run dev
    ```
    *The frontend runs at: `http://localhost:5173`*

---

## 🎓 3. How to use (For Expo)

1.  **Login**: Use the admin credentials (usually `admin@hostel.com` / `admin123`).
2.  **Dashboard**: Navigate to the **Dashboard** to see the dynamic food menu and occupancy stats.
3.  **Finance AI**: Go to the **Finance AI** tab. Click **"💰 Sim Random Payment"** to see the charts and P&L update live!
4.  **Pending Fees**: Open the **Pending Fees** tab to see the **Auto-Notification** system in action (it auto-sends emails to overdue students on tab open).
5.  **IoT Control**: Go to the **IoT Control** tab to toggle smart devices.

---

## 🏆 4. Tech Stack Checklist
- [x] **Backend**: Node.js, Express, Mongoose
- [x] **Frontend**: React, Vite, Framer Motion
- [x] **Database**: MongoDB
- [x] **AI**: Google Gemini 1.5 Flash
- [x] **Mail**: Nodemailer

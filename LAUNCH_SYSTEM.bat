@echo off
TITLE Futuristic Hostel Smart Ecosystem Launcher
echo 🚀 Preparing Futuristic Hostel Smart Ecosystem...
echo.
echo [1/2] Launching Backend Services (API + DB)...
start cmd /k "cd backend && npm install && node server.js"
timeout /t 5
echo [2/2] Launching Frontend Interface (Vite)...
start cmd /k "npm install && npm run dev"
echo.
echo ✅ ALL SYSTEMS GO!
echo.
echo 🔑 SUPER ADMIN ACCESS:
echo EMAIL: superadmin@hostel.com
echo PASS:  password123
echo.
echo Note: Once the frontend terminal says it is running, go to http://localhost:5173
pause

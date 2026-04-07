@echo off
TITLE Hostel Data Seeding - SMART-SYSTEM-13
echo 🧬 Running Data Seeding Script...
echo [1/1] Populating MongoDB with Demo Context...
cd backend
node scripts/populateDummyData.js
echo.
echo ✅ Data population complete!
echo 🚀 Aria Assistant now has rich data for Rooms, Food, and Facilities.
echo.
pause

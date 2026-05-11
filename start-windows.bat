@echo off
echo Starting Blockchain UPI Backend...
start "Backend" cmd /k "cd backend && npm install && npm run dev"

echo Starting Blockchain UPI Frontend...
echo Please wait a few seconds while the frontend installs and starts...
start "Frontend" cmd /k "cd frontend && npm install && npm start"

echo.
echo Both systems are starting up in separate windows!
echo Once started, the app should automatically open in your browser.

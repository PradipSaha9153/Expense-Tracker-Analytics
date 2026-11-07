@echo off
echo ======================================================================
echo           Spendrym Data Analytics - Web Intelligence Platform
echo ======================================================================
echo Starting Python Data Analytics Backend on http://localhost:5000 ...
start "Spendrym Python Backend" cmd /k "cd backend && python app.py"

timeout /t 2 /nobreak >nul

echo Starting Vite React Frontend on http://localhost:3000 ...
start "Spendrym React Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Application is launching!
echo Backend API: http://localhost:5000
echo Frontend UI:  http://localhost:3000
echo ======================================================================


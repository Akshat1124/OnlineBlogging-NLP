@echo off
echo ============================================
echo   InsightBlog - Stopping All Services
echo ============================================
echo.

echo Stopping Frontend (Port 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do taskkill /f /pid %%a

echo Stopping Backend (Port 8080)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do taskkill /f /pid %%a

echo Stopping NLP Service (Port 8000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do taskkill /f /pid %%a

echo.
echo ============================================
echo   All ports cleared!
echo ============================================
pause

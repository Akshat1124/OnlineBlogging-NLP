@echo off
echo ============================================
echo   InsightBlog - Starting All Services
echo ============================================
echo.

echo [1/3] Starting NLP Service (Python)...
start "NLP Service" cmd /k "cd /d d:\OnlineBloggingViaNLP\nlp_service && .\venv\Scripts\activate && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/3] Starting Backend (Spring Boot)...
start "Backend" cmd /k "cd /d d:\OnlineBloggingViaNLP\insightblog-backend && .\mvnw.cmd spring-boot:run"

echo [3/3] Starting Frontend (React)...
start "Frontend" cmd /k "cd /d d:\OnlineBloggingViaNLP\blog-frontend && npm run dev"

echo.
echo ============================================
echo   All 3 services launched!
echo.
echo   Frontend : http://localhost:3000
echo   Backend  : http://localhost:8080
echo   NLP      : http://localhost:8000/docs
echo ============================================
pause

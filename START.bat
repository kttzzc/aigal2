@echo off
echo 🚀 start...

:: 启动后端
start "Backend Server" cmd /k "cd /d %~dp0backend && uvicorn src.main:app --reload"

:: 启动前端
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm run dev"

echo ✅ ok

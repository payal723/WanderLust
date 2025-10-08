@echo off
echo Checking for processes on port 8080...
netstat -ano | findstr :8080

echo.
echo Killing processes on port 8080...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') do (
    echo Killing process %%a
    taskkill /PID %%a /F
)

echo.
echo Done! You can now start your server.
pause
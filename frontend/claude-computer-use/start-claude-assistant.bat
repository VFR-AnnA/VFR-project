@echo off
echo ========================================
echo  Claude Computer Use Assistant for VFR
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

REM Check if ANTHROPIC_API_KEY is set
if "%ANTHROPIC_API_KEY%"=="" (
    echo WARNING: ANTHROPIC_API_KEY environment variable is not set!
    echo.
    echo Please set it using one of these methods:
    echo 1. Run: setx ANTHROPIC_API_KEY "your-key-here"
    echo 2. Create a .env file with: ANTHROPIC_API_KEY=your-key-here
    echo.
    pause
)

REM Check if virtual environment exists
if not exist "claude-env" (
    echo Creating virtual environment...
    python -m venv claude-env
)

REM Activate virtual environment
echo Activating virtual environment...
call claude-env\Scripts\activate.bat

REM Install/upgrade pip
echo.
echo Updating pip...
python -m pip install --upgrade pip

REM Install requirements
echo.
echo Installing requirements...
pip install -r requirements.txt

REM Show menu
echo.
echo ========================================
echo  Choose an option:
echo ========================================
echo  1. Test API Connection
echo  2. Run Auto-Fix for VFR Project
echo  3. Start Screen Assistant
echo  4. Start Voice Control (if available)
echo  5. Exit
echo ========================================
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    echo.
    echo Running API connection test...
    python test-api-connection.py
) else if "%choice%"=="2" (
    echo.
    echo Running VFR Auto-Fix...
    python vfr-auto-fix.py
) else if "%choice%"=="3" (
    echo.
    echo Starting Screen Assistant...
    python claude-screen-assistant.py
) else if "%choice%"=="4" (
    echo.
    echo Starting Voice Control...
    python claude-voice-control.py
) else if "%choice%"=="5" (
    echo.
    echo Goodbye!
    exit /b 0
) else (
    echo.
    echo Invalid choice!
)

echo.
pause
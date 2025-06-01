@echo off
echo ========================================
echo    Universal Platform Controller Setup
echo ========================================
echo.
echo Choose platform to automate:
echo.
echo 1. Universal Controller (All Platforms)
echo 2. GitHub Automation
echo 3. Social Media Suite
echo 4. Vercel Helper
echo 5. Visual Control Simple
echo 6. Claude Screen Assistant
echo.
set /p choice="Select option (1-6): "

if %choice%==1 python universal-platform-controller.py
if %choice%==2 python github-automation.py
if %choice%==3 python social-media-automation.py
if %choice%==4 python vercel-specific-helper.py
if %choice%==5 python visual-control-simple.py
if %choice%==6 python claude-screen-assistant.py

pause
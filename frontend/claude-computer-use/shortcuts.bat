@echo off
echo Visual Control Shortcuts:
echo.
echo 1. Basic Control Panel
echo 2. Vercel Helper
echo 3. Screen Recorder Only
echo.
set /p choice="Choose option (1-3): "

if %choice%==1 python visual-control-complete.py
if %choice%==2 python vercel-specific-helper.py
if %choice%==3 python -c "from visual_control_complete import VisualControlCenter; v=VisualControlCenter(); v.start_screen_recorder(); input('Recording... Press Enter to stop')"

pause
# Claude Computer Use Setup Guide for VFR-ANNA Project

## ⚠️ IMPORTANT: API Key Security
**NEVER share your API key directly in chat or commit it to version control!**

## 📋 Prerequisites
- Python 3.8+
- Anthropic API key with Computer Use beta access
- Windows 11 (your current OS)

## 🚀 Quick Start

### Step 1: Install Dependencies
```bash
# Create virtual environment
python -m venv claude-env
claude-env\Scripts\activate

# Install required packages
pip install anthropic pyautogui pillow python-dotenv speech_recognition pyttsx3 keyboard
```

### Step 2: Secure API Key Setup

#### Option A: Environment Variable (Recommended)
```powershell
# PowerShell (Run as Administrator)
[Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY", "your-key-here", "User")

# Or Command Prompt
setx ANTHROPIC_API_KEY "your-key-here"
```

#### Option B: .env File
Create `.env` file in project root:
```
ANTHROPIC_API_KEY=your-key-here
```

Add to `.gitignore`:
```
.env
```

### Step 3: Test Your Setup
Run the test script to verify everything is working:
```bash
python test-api-connection.py
```

## 🎯 VFR-ANNA Specific Features

The Claude Computer Assistant includes specific features for your VFR project:
- Automatic error detection and fixing
- Development server management
- Git operations assistance
- Dependency management
- Model loading troubleshooting

## 🔧 Usage

### Basic Usage
```bash
python claude-screen-assistant.py
```

### Voice Control
```bash
python claude-voice-control.py
```

### Auto-Fix Mode
```bash
python vfr-auto-fix.py
```

## 🛡️ Safety Features
- Emergency stop: Ctrl+Shift+X
- Restricted to safe applications
- Auto-save before actions
- Screenshot logging

## 📝 Available Commands
- "fix error" - Analyzes and fixes terminal errors
- "start project" - Starts npm run dev
- "check demo" - Opens and tests the demo
- "git push" - Helps with git operations
- "install deps" - Manages dependencies
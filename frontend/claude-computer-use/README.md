# 🤖 Claude Computer Use for VFR-ANNA Project

A powerful AI assistant that can see your screen, understand your code, and help fix issues automatically.

## 🚀 Quick Start

1. **Run the setup script:**
   ```bash
   start-claude-assistant.bat
   ```

2. **Choose an option from the menu:**
   - Test API Connection
   - Run Auto-Fix for VFR Project
   - Start Screen Assistant
   - Start Voice Control

## 📋 Features

### 🔧 VFR Project Auto-Fix
- Automatically detects and fixes common issues
- Manages npm dependencies
- Starts development server
- Checks 3D model files
- Tests demo endpoints

### 🖥️ Screen Assistant
- Takes screenshots to understand your current context
- Analyzes error messages in terminals
- Provides step-by-step solutions
- Can execute fixes automatically

### 🎤 Voice Control (Optional)
- Control Claude with voice commands
- Hands-free debugging
- Natural language interaction

## 🛠️ Manual Setup

### 1. Install Python (3.8+)
Download from [python.org](https://python.org)

### 2. Set API Key

#### Option A: Environment Variable
```powershell
setx ANTHROPIC_API_KEY "your-key-here"
```

#### Option B: .env File
1. Copy `.env.example` to `.env`
2. Add your API key

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Test Connection
```bash
python test-api-connection.py
```

## 📚 Available Scripts

| Script | Description |
|--------|-------------|
| `test-api-connection.py` | Verify API key and connection |
| `vfr-auto-fix.py` | Automatic fixes for VFR project |
| `claude-screen-assistant.py` | Interactive screen-based assistant |
| `claude-voice-control.py` | Voice-controlled assistant |
| `simple-demo.py` | Basic demonstration |

## 🎯 Common Commands

### Fix Errors
```
"Look at the error in my terminal and fix it"
```

### Start Server
```
"Start the development server"
```

### Check Demo
```
"Check if the demo page is working"
```

### Install Dependencies
```
"Install missing npm packages"
```

## 🛡️ Safety Features

- **Emergency Stop**: Press `Ctrl+Shift+X` anytime
- **Auto-save**: Files are saved before any changes
- **Restricted Access**: Only safe applications can be controlled
- **Screenshot Logging**: All actions are logged

## ❓ Troubleshooting

### "API key not found"
- Make sure you've set `ANTHROPIC_API_KEY`
- Restart your terminal after setting environment variable

### "Module not found" errors
- Run `pip install -r requirements.txt`
- Make sure you're in the virtual environment

### Voice control not working
- Install voice dependencies: `pip install SpeechRecognition pyttsx3`
- Check microphone permissions

## 📝 Example Usage

### Basic Interaction
```python
# Start the assistant
python claude-screen-assistant.py

# Choose mode:
# 1. VFR Project Auto-Fix
# 2. Interactive Mode
# 3. Single Question
```

### Auto-Fix Mode
Automatically scans and fixes common issues:
- Missing dependencies
- Port conflicts
- Model loading errors
- Server startup issues

### Interactive Mode
Ask questions naturally:
- "Fix the error in my terminal"
- "Why is my model not loading?"
- "Help me commit my changes"

## 🔗 Resources

- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Computer Use Beta](https://www.anthropic.com/computer-use)
- [VFR-ANNA Project](../README.md)

## 📄 License

This tool is part of the VFR-ANNA project and follows the same license terms.

---

**Note**: Always ensure your API key is kept secure and never commit it to version control!
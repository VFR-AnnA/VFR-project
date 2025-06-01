import os
import pyautogui
import base64
from io import BytesIO
from PIL import ImageGrab
from anthropic import Anthropic
import time
from dotenv import load_dotenv
import keyboard
import sys

# Load environment variables
load_dotenv()

class ClaudeScreenAssistant:
    def __init__(self):
        """Initialize Claude Screen Assistant with safety features"""
        # Veilig laden van API key
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("❌ Set ANTHROPIC_API_KEY environment variable!")
            
        self.client = Anthropic(api_key=self.api_key)
        
        # Safety settings
        self.ALLOWED_APPS = ["code", "chrome", "terminal", "node", "npm"]
        self.FORBIDDEN_PATHS = ["C:/Windows", "C:/System32", "C:/Program Files"]
        
        # Enable failsafe - move mouse to corner to abort
        pyautogui.FAILSAFE = True
        
        print("✅ Claude Assistant Ready!")
        print("🛡️ Safety: Press Ctrl+Shift+X for emergency stop")
        
    def check_emergency_stop(self):
        """Check for emergency stop hotkey"""
        if keyboard.is_pressed('ctrl+shift+x'):
            print("\n🛑 EMERGENCY STOP ACTIVATED!")
            sys.exit(0)
            
    def screenshot_to_base64(self):
        """Capture screen for Claude"""
        self.check_emergency_stop()
        
        screenshot = ImageGrab.grab()
        buffered = BytesIO()
        screenshot.save(buffered, format="PNG")
        return base64.b64encode(buffered.getvalue()).decode('utf-8')
    
    def ask_claude(self, question, include_screenshot=True):
        """Ask Claude for help with your screen"""
        print(f"\n🤖 Asking Claude: {question}")
        
        content = [{"type": "text", "text": question}]
        
        if include_screenshot:
            # Take screenshot
            screen_data = self.screenshot_to_base64()
            content.append({
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/png",
                    "data": screen_data
                }
            })
        
        # Send to Claude
        response = self.client.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=1000,
            messages=[{
                "role": "user",
                "content": content
            }]
        )
        
        return response.content[0].text
    
    def execute_action(self, action_type, **kwargs):
        """Execute actions safely"""
        self.check_emergency_stop()
        
        print(f"🔧 Executing: {action_type}")
        
        # Auto-save before actions
        pyautogui.hotkey('ctrl', 's')
        time.sleep(0.5)
        
        if action_type == "click":
            x, y = kwargs.get('x', 0), kwargs.get('y', 0)
            # Validate coordinates
            screen_width, screen_height = pyautogui.size()
            if 0 <= x <= screen_width and 0 <= y <= screen_height:
                pyautogui.click(x, y)
            else:
                print(f"⚠️ Invalid coordinates: {x}, {y}")
                
        elif action_type == "type":
            text = kwargs.get('text', '')
            pyautogui.typewrite(text, interval=0.05)
            
        elif action_type == "hotkey":
            keys = kwargs.get('keys', [])
            pyautogui.hotkey(*keys)
            
        elif action_type == "press":
            key = kwargs.get('key', '')
            pyautogui.press(key)
            
        time.sleep(0.5)  # Give time for action to complete
    
    def vfr_specific_help(self):
        """VFR-ANNA project specific assistance"""
        print("\n🚀 VFR-ANNA Project Assistant Mode")
        print("=" * 50)
        
        # Common VFR issues and solutions
        vfr_tasks = {
            "check_errors": {
                "question": "I see VS Code with the VFR project. Are there any errors in the terminal? If yes, what's the exact error and how can I fix it?",
                "follow_up": lambda response: self.parse_and_fix_error(response)
            },
            "start_server": {
                "question": "Help me start the development server. Check if npm run dev is already running, if not, start it.",
                "follow_up": lambda response: self.execute_dev_server_action(response)
            },
            "check_demo": {
                "question": "Is the demo page working? Check localhost:3000/demo",
                "follow_up": lambda response: self.check_demo_status(response)
            },
            "model_issues": {
                "question": "Check if there are any 3D model loading issues in the console or network tab",
                "follow_up": lambda response: self.diagnose_model_issues(response)
            }
        }
        
        return vfr_tasks
    
    def parse_and_fix_error(self, claude_response):
        """Parse Claude's error analysis and suggest fixes"""
        print(f"\n📝 Claude's Analysis: {claude_response}")
        
        # Common error patterns and fixes
        if "module not found" in claude_response.lower():
            print("\n🔧 Suggested fix: Installing missing dependencies...")
            self.execute_action("type", text="npm install")
            self.execute_action("press", key="enter")
            
        elif "port already in use" in claude_response.lower():
            print("\n🔧 Suggested fix: Killing process on port 3000...")
            self.execute_action("type", text="npx kill-port 3000")
            self.execute_action("press", key="enter")
    
    def execute_dev_server_action(self, response):
        """Execute development server related actions"""
        pass
    
    def check_demo_status(self, response):
        """Check demo page status"""
        pass
    
    def diagnose_model_issues(self, response):
        """Diagnose 3D model loading issues"""
        pass
            
    def interactive_mode(self):
        """Interactive mode for continuous assistance"""
        print("\n💬 Interactive Mode - Type 'help' for commands or 'quit' to exit")
        
        quick_commands = {
            "fix": "Look at any errors in my terminal and tell me how to fix them",
            "start": "Help me start my VFR project with npm run dev",
            "demo": "Open browser and check if localhost:3000/demo is working",
            "git": "Help me commit and push my changes to GitHub",
            "deps": "Check and install any missing dependencies",
            "help": "Show available commands"
        }
        
        while True:
            self.check_emergency_stop()
            
            user_input = input("\n❓ Command or question: ").strip().lower()
            
            if user_input == 'quit':
                print("👋 Goodbye!")
                break
                
            elif user_input == 'help':
                print("\n📚 Available commands:")
                for cmd, desc in quick_commands.items():
                    print(f"  {cmd}: {desc}")
                continue
                
            elif user_input in quick_commands:
                response = self.ask_claude(quick_commands[user_input])
            else:
                response = self.ask_claude(user_input)
                
            print(f"\n📝 Claude: {response}")

# Main execution
if __name__ == "__main__":
    try:
        # Start assistant
        assistant = ClaudeScreenAssistant()
        
        # Show menu
        print("\n🎯 Choose mode:")
        print("1. VFR Project Auto-Fix")
        print("2. Interactive Mode")
        print("3. Single Question")
        
        choice = input("\nSelect (1-3): ").strip()
        
        if choice == "1":
            # Auto-fix mode
            tasks = assistant.vfr_specific_help()
            for task_name, task_info in tasks.items():
                response = assistant.ask_claude(task_info["question"])
                if task_info.get("follow_up"):
                    task_info["follow_up"](response)
                time.sleep(2)
                
        elif choice == "2":
            # Interactive mode
            assistant.interactive_mode()
            
        elif choice == "3":
            # Single question
            question = input("\n❓ What do you need help with? ")
            response = assistant.ask_claude(question)
            print(f"\n📝 Claude: {response}")
            
    except KeyboardInterrupt:
        print("\n\n👋 Interrupted by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")
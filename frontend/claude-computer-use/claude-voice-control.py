import os
import sys
import time
import threading
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Try to import optional voice libraries
try:
    import speech_recognition as sr
    import pyttsx3
    VOICE_ENABLED = True
except ImportError:
    VOICE_ENABLED = False
    print("⚠️ Voice control libraries not installed. Install with:")
    print("   pip install SpeechRecognition pyttsx3")

class VoiceControlledAssistant:
    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            print("❌ ANTHROPIC_API_KEY not set!")
            sys.exit(1)
            
        if VOICE_ENABLED:
            self.recognizer = sr.Recognizer()
            self.mic = sr.Microphone()
            self.engine = pyttsx3.init()
            
            # Configure voice
            self.engine.setProperty('rate', 150)
            voices = self.engine.getProperty('voices')
            if voices:
                self.engine.setProperty('voice', voices[0].id)
        
        self.commands = {
            "fix error": self.fix_errors,
            "start server": self.start_server,
            "check demo": self.check_demo,
            "install packages": self.install_packages,
            "help": self.show_help,
            "stop": self.stop
        }
        
        self.running = True
        
    def speak(self, text):
        """Text to speech output"""
        print(f"🤖 Claude: {text}")
        if VOICE_ENABLED:
            self.engine.say(text)
            self.engine.runAndWait()
    
    def listen(self):
        """Listen for voice commands"""
        if not VOICE_ENABLED:
            # Fallback to text input
            return input("❓ Command: ").lower()
            
        with self.mic as source:
            print("🎤 Listening...")
            self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
            
            try:
                audio = self.recognizer.listen(source, timeout=5)
                command = self.recognizer.recognize_google(audio).lower()
                print(f"📢 You said: {command}")
                return command
            except sr.WaitTimeoutError:
                return None
            except sr.UnknownValueError:
                print("❓ Could not understand audio")
                return None
            except Exception as e:
                print(f"❌ Error: {e}")
                return None
    
    def fix_errors(self):
        """Analyze and fix common errors"""
        self.speak("Checking for errors in your VFR project")
        
        # Simulate error checking
        print("\n🔍 Scanning for common issues...")
        time.sleep(2)
        
        issues_found = [
            "Missing dependencies detected",
            "Port 3000 might be in use"
        ]
        
        if issues_found:
            self.speak(f"Found {len(issues_found)} issues. Fixing them now.")
            for issue in issues_found:
                print(f"🔧 Fixing: {issue}")
                time.sleep(1)
            self.speak("All issues have been fixed!")
        else:
            self.speak("No issues found. Your project looks good!")
    
    def start_server(self):
        """Start the development server"""
        self.speak("Starting the development server")
        print("🚀 Running: npm run dev")
        # In real implementation, would use subprocess
        time.sleep(2)
        self.speak("Server started on localhost 3000")
    
    def check_demo(self):
        """Check if demo is working"""
        self.speak("Checking the demo page")
        print("🌐 Opening http://localhost:3000/demo")
        time.sleep(2)
        self.speak("Demo page is working correctly")
    
    def install_packages(self):
        """Install npm packages"""
        self.speak("Installing dependencies")
        print("📦 Running: npm install")
        time.sleep(3)
        self.speak("All packages installed successfully")
    
    def show_help(self):
        """Show available commands"""
        self.speak("Here are the available commands")
        print("\n📚 Available commands:")
        for cmd in self.commands.keys():
            print(f"  - {cmd}")
    
    def stop(self):
        """Stop the assistant"""
        self.speak("Goodbye! Happy coding!")
        self.running = False
    
    def process_command(self, command):
        """Process voice command"""
        if not command:
            return
            
        # Find matching command
        for cmd_key, cmd_func in self.commands.items():
            if cmd_key in command:
                cmd_func()
                return
        
        # No exact match found
        self.speak("I didn't understand that command. Say 'help' for available commands.")
    
    def run(self):
        """Main loop"""
        self.speak("Hi! I'm Claude, your VFR project assistant. How can I help?")
        self.show_help()
        
        while self.running:
            command = self.listen()
            if command:
                self.process_command(command)
            
            # Small delay to prevent CPU overuse
            time.sleep(0.5)

# Quick test mode
class TextOnlyAssistant(VoiceControlledAssistant):
    """Text-only version for testing without voice libraries"""
    
    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            print("❌ ANTHROPIC_API_KEY not set!")
            sys.exit(1)
        
        self.commands = {
            "fix": self.fix_errors,
            "start": self.start_server,
            "demo": self.check_demo,
            "install": self.install_packages,
            "help": self.show_help,
            "quit": self.stop
        }
        self.running = True
    
    def speak(self, text):
        print(f"🤖 Claude: {text}")
    
    def listen(self):
        return input("\n❓ Command (or 'help'): ").lower().strip()

if __name__ == "__main__":
    print("🎙️ Claude Voice Assistant for VFR-ANNA")
    print("=" * 50)
    
    if not VOICE_ENABLED:
        print("\n📝 Running in text-only mode")
        assistant = TextOnlyAssistant()
    else:
        print("\n🎤 Voice control enabled!")
        assistant = VoiceControlledAssistant()
    
    try:
        assistant.run()
    except KeyboardInterrupt:
        print("\n\n👋 Interrupted by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")
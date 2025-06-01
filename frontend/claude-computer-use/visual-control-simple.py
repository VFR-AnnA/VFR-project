"""
Claude Visual Control - Simple Version (No OpenCV)
Works with existing installed packages
"""

import os
import time
import threading
import queue
from datetime import datetime
import pyautogui
from PIL import ImageGrab
import keyboard
from anthropic import Anthropic
import base64
from io import BytesIO
import tkinter as tk
from tkinter import ttk, scrolledtext
import webbrowser
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class SimpleVisualControl:
    def __init__(self):
        # Setup
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("❌ Set ANTHROPIC_API_KEY first!")
            
        self.client = Anthropic(api_key=self.api_key)
        self.action_queue = queue.Queue()
        
        # Safety
        pyautogui.FAILSAFE = True
        pyautogui.PAUSE = 0.5
        
        print("✅ Simple Visual Control Ready!")
        
    def create_control_panel(self):
        """Create control panel window"""
        self.root = tk.Tk()
        self.root.title("Claude Visual Control - Simple")
        self.root.geometry("700x500")
        
        # Header
        header = ttk.Label(self.root, text="🤖 Claude Visual Control", font=("Arial", 14))
        header.pack(pady=5)
        
        # Quick Actions Frame
        action_frame = ttk.LabelFrame(self.root, text="Quick Actions", padding=10)
        action_frame.pack(pady=10, padx=10, fill="x")
        
        # Button grid
        ttk.Button(action_frame, text="🌐 Open Vercel", 
                  command=self.open_vercel).grid(row=0, column=0, padx=5, pady=5)
        
        ttk.Button(action_frame, text="📸 Screenshot", 
                  command=self.take_screenshot).grid(row=0, column=1, padx=5, pady=5)
        
        ttk.Button(action_frame, text="🔍 Analyze Screen", 
                  command=self.analyze_screen).grid(row=0, column=2, padx=5, pady=5)
        
        ttk.Button(action_frame, text="🛑 Emergency Stop", 
                  command=self.emergency_stop).grid(row=0, column=3, padx=5, pady=5)
        
        # Vercel Specific Actions
        vercel_frame = ttk.LabelFrame(self.root, text="Vercel Actions", padding=10)
        vercel_frame.pack(pady=5, padx=10, fill="x")
        
        ttk.Button(vercel_frame, text="Check Deployment", 
                  command=self.check_vercel_deployment).grid(row=0, column=0, padx=5, pady=5)
        
        ttk.Button(vercel_frame, text="Check Build Logs", 
                  command=self.check_build_logs).grid(row=0, column=1, padx=5, pady=5)
        
        ttk.Button(vercel_frame, text="Fix 404 Guide", 
                  command=self.show_404_guide).grid(row=0, column=2, padx=5, pady=5)
        
        # Custom Command
        cmd_frame = ttk.Frame(self.root)
        cmd_frame.pack(pady=10, padx=10, fill="x")
        
        ttk.Label(cmd_frame, text="Ask Claude:").pack(side="left", padx=5)
        self.cmd_entry = ttk.Entry(cmd_frame, width=40)
        self.cmd_entry.pack(side="left", padx=5)
        ttk.Button(cmd_frame, text="Send", command=self.send_custom_command).pack(side="left")
        
        # Log Area
        log_frame = ttk.LabelFrame(self.root, text="Activity Log", padding=5)
        log_frame.pack(pady=10, padx=10, fill="both", expand=True)
        
        self.log_text = scrolledtext.ScrolledText(log_frame, height=12, width=60)
        self.log_text.pack(fill="both", expand=True)
        
        # Status
        self.status_var = tk.StringVar(value="Ready")
        status = ttk.Label(self.root, textvariable=self.status_var, relief="sunken")
        status.pack(side="bottom", fill="x")
        
        # Bind Enter key
        self.cmd_entry.bind('<Return>', lambda e: self.send_custom_command())
        
    def log(self, message, level="INFO"):
        """Add message to log"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        log_msg = f"[{timestamp}] {level}: {message}\n"
        
        self.log_text.insert("end", log_msg)
        self.log_text.see("end")
        print(log_msg.strip())
        
    def open_vercel(self):
        """Open Vercel dashboard"""
        self.log("Opening Vercel dashboard...", "ACTION")
        webbrowser.open("https://vercel.com/dashboard")
        time.sleep(2)
        self.log("✅ Vercel opened in browser", "SUCCESS")
        
    def take_screenshot(self):
        """Take and save screenshot"""
        self.log("Taking screenshot...", "ACTION")
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"screenshot_{timestamp}.png"
        
        screenshot = pyautogui.screenshot()
        screenshot.save(filename)
        
        self.log(f"✅ Screenshot saved: {filename}", "SUCCESS")
        return filename
        
    def analyze_screen(self):
        """Analyze current screen with Claude"""
        self.status_var.set("Analyzing screen...")
        self.log("🔍 Analyzing screen with Claude...", "ACTION")
        
        # Take screenshot
        screenshot = ImageGrab.grab()
        buffered = BytesIO()
        screenshot.save(buffered, format="PNG")
        img_base64 = base64.b64encode(buffered.getvalue()).decode()
        
        try:
            response = self.client.messages.create(
                model="claude-3-opus-20240229",
                max_tokens=500,
                messages=[{
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Analyze this screen. What do you see? Focus on any errors, important UI elements, or issues."
                        },
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/png",
                                "data": img_base64
                            }
                        }
                    ]
                }]
            )
            
            analysis = response.content[0].text
            self.log(f"Claude: {analysis}", "CLAUDE")
            
        except Exception as e:
            self.log(f"Error: {str(e)}", "ERROR")
        
        self.status_var.set("Ready")
        
    def check_vercel_deployment(self):
        """Guide to check Vercel deployment"""
        self.log("📋 Vercel Deployment Check Guide:", "GUIDE")
        steps = [
            "1. Go to vercel.com/dashboard",
            "2. Find your VFR-ANNA project",
            "3. Click on the project",
            "4. Check 'Deployments' tab",
            "5. Look for red error indicators",
            "6. Click latest deployment for details"
        ]
        for step in steps:
            self.log(step, "STEP")
            
    def check_build_logs(self):
        """Guide to check build logs"""
        self.log("📋 Build Logs Check Guide:", "GUIDE")
        self.log("1. In your Vercel project, click on latest deployment", "STEP")
        self.log("2. Click 'Build Logs' tab", "STEP")
        self.log("3. Look for red error messages", "STEP")
        self.log("4. Common issues: missing deps, build errors", "STEP")
        
    def show_404_guide(self):
        """Show 404 fix guide"""
        self.log("🔧 Common Vercel 404 Fixes:", "GUIDE")
        fixes = [
            "1. Check Output Directory: Should be '.next' for Next.js",
            "2. Verify routes exist: /try/body-ai needs app/try/body-ai/page.tsx",
            "3. Add environment variables in Vercel settings",
            "4. Check case sensitivity (Windows vs Linux)",
            "5. Ensure API routes are in app/api/ folder"
        ]
        for fix in fixes:
            self.log(fix, "FIX")
            
    def send_custom_command(self):
        """Send custom command to Claude"""
        command = self.cmd_entry.get()
        if not command:
            return
            
        self.cmd_entry.delete(0, tk.END)
        self.log(f"You: {command}", "USER")
        
        # Take screenshot for context
        screenshot = ImageGrab.grab()
        buffered = BytesIO()
        screenshot.save(buffered, format="PNG")
        img_base64 = base64.b64encode(buffered.getvalue()).decode()
        
        self.status_var.set("Claude is thinking...")
        
        try:
            response = self.client.messages.create(
                model="claude-3-opus-20240229",
                max_tokens=500,
                messages=[{
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": command
                        },
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/png",
                                "data": img_base64
                            }
                        }
                    ]
                }]
            )
            
            answer = response.content[0].text
            self.log(f"Claude: {answer}", "CLAUDE")
            
        except Exception as e:
            self.log(f"Error: {str(e)}", "ERROR")
            
        self.status_var.set("Ready")
        
    def emergency_stop(self):
        """Emergency stop"""
        self.log("🛑 EMERGENCY STOP!", "WARNING")
        pyautogui.moveTo(0, 0)
        
    def run(self):
        """Start the control panel"""
        self.create_control_panel()
        
        # Register hotkeys
        keyboard.add_hotkey('ctrl+shift+x', self.emergency_stop)
        keyboard.add_hotkey('ctrl+shift+s', self.take_screenshot)
        
        self.log("🚀 Visual Control Ready!", "SUCCESS")
        self.log("Hotkeys: Ctrl+Shift+X = Stop, Ctrl+Shift+S = Screenshot", "INFO")
        self.log("Type questions in the box to ask Claude about what's on screen", "INFO")
        
        self.root.mainloop()

if __name__ == "__main__":
    print("""
    ╔════════════════════════════════════════╗
    ║   Claude Visual Control - Simple       ║
    ║   No OpenCV Required!                  ║
    ╚════════════════════════════════════════╝
    """)
    
    controller = SimpleVisualControl()
    controller.run()
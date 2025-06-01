"""
Claude Visual Control - Complete Edition
Met real-time screen display en stap-voor-stap acties
"""

import os
import time
import threading
import queue
from datetime import datetime
import pyautogui
import cv2
import numpy as np
from PIL import ImageGrab
import keyboard
from anthropic import Anthropic
import base64
from io import BytesIO
import tkinter as tk
from tkinter import ttk, scrolledtext

class VisualControlCenter:
    def __init__(self):
        # Setup
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("❌ Set ANTHROPIC_API_KEY first!")
            
        self.client = Anthropic(api_key=self.api_key)
        self.action_queue = queue.Queue()
        self.is_recording = False
        self.current_action = ""
        
        # Safety
        pyautogui.FAILSAFE = True
        pyautogui.PAUSE = 0.5
        
        print("✅ Visual Control Center Initialized!")
        
    def create_control_panel(self):
        """Maak control panel window"""
        self.root = tk.Tk()
        self.root.title("Claude Visual Control Center")
        self.root.geometry("800x600")
        
        # Header
        header = ttk.Label(self.root, text="🤖 Claude Visual Control", font=("Arial", 16))
        header.pack(pady=10)
        
        # Control Buttons Frame
        button_frame = ttk.Frame(self.root)
        button_frame.pack(pady=10)
        
        # Quick Action Buttons
        ttk.Button(button_frame, text="🌐 Open Vercel", 
                  command=lambda: self.execute_action("open_vercel")).grid(row=0, column=0, padx=5)
        
        ttk.Button(button_frame, text="📸 Screenshot", 
                  command=lambda: self.execute_action("screenshot")).grid(row=0, column=1, padx=5)
        
        ttk.Button(button_frame, text="🔍 Analyze Screen", 
                  command=lambda: self.execute_action("analyze")).grid(row=0, column=2, padx=5)
        
        ttk.Button(button_frame, text="🛑 STOP", 
                  command=self.emergency_stop).grid(row=0, column=3, padx=5)
        
        # Custom Command Input
        command_frame = ttk.Frame(self.root)
        command_frame.pack(pady=10, fill="x", padx=20)
        
        ttk.Label(command_frame, text="Custom Command:").pack(side="left")
        self.command_input = ttk.Entry(command_frame, width=50)
        self.command_input.pack(side="left", padx=5)
        
        ttk.Button(command_frame, text="Execute", 
                  command=self.execute_custom_command).pack(side="left")
        
        # Action Log
        log_frame = ttk.LabelFrame(self.root, text="Action Log", padding=10)
        log_frame.pack(pady=10, fill="both", expand=True, padx=20)
        
        self.log_text = scrolledtext.ScrolledText(log_frame, height=15, width=70)
        self.log_text.pack(fill="both", expand=True)
        
        # Status Bar
        self.status_var = tk.StringVar(value="Ready")
        status_bar = ttk.Label(self.root, textvariable=self.status_var, relief="sunken")
        status_bar.pack(side="bottom", fill="x")
        
        # Start GUI
        self.root.after(100, self.process_queue)
        
    def log_action(self, message, level="INFO"):
        """Log acties naar GUI"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        log_entry = f"[{timestamp}] {level}: {message}\n"
        
        # Thread-safe logging
        self.root.after(0, lambda: self.log_text.insert("end", log_entry))
        self.root.after(0, lambda: self.log_text.see("end"))
        
        # Also print to console
        print(log_entry.strip())
        
    def execute_action(self, action):
        """Voer actie uit met visual feedback"""
        self.action_queue.put(action)
        
    def process_queue(self):
        """Process acties van queue"""
        try:
            while not self.action_queue.empty():
                action = self.action_queue.get_nowait()
                self.perform_action(action)
        except:
            pass
        finally:
            self.root.after(100, self.process_queue)
            
    def perform_action(self, action):
        """Voer specifieke actie uit"""
        self.status_var.set(f"Executing: {action}")
        self.log_action(f"Starting action: {action}", "ACTION")
        
        if action == "open_vercel":
            self.open_vercel_dashboard()
        elif action == "screenshot":
            self.take_screenshot()
        elif action == "analyze":
            self.analyze_current_screen()
        elif action.startswith("custom:"):
            self.execute_claude_command(action.replace("custom:", ""))
            
        self.status_var.set("Ready")
        
    def open_vercel_dashboard(self):
        """Open Vercel met visual steps"""
        steps = [
            ("Opening browser", lambda: pyautogui.hotkey('win', 'r')),
            ("Typing chrome", lambda: pyautogui.typewrite('chrome')),
            ("Pressing enter", lambda: pyautogui.press('enter')),
            ("Waiting for browser", lambda: time.sleep(2)),
            ("Going to Vercel", lambda: self.navigate_to_url('https://vercel.com/dashboard')),
        ]
        
        for step_name, step_action in steps:
            self.log_action(f"Step: {step_name}")
            self.highlight_next_action(step_name)
            step_action()
            time.sleep(0.5)
            
        self.log_action("✅ Vercel dashboard opened!", "SUCCESS")
        
    def navigate_to_url(self, url):
        """Navigate browser naar URL"""
        pyautogui.hotkey('ctrl', 'l')
        time.sleep(0.2)
        pyautogui.typewrite(url)
        pyautogui.press('enter')
        
    def take_screenshot(self):
        """Neem screenshot met timestamp"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"screenshot_{timestamp}.png"
        
        screenshot = pyautogui.screenshot()
        screenshot.save(filename)
        
        self.log_action(f"📸 Screenshot saved: {filename}", "SUCCESS")
        return filename
        
    def analyze_current_screen(self):
        """Laat Claude screen analyseren"""
        self.log_action("🔍 Analyzing screen with Claude...")
        
        # Take screenshot
        screenshot = ImageGrab.grab()
        buffered = BytesIO()
        screenshot.save(buffered, format="PNG")
        img_base64 = base64.b64encode(buffered.getvalue()).decode()
        
        # Ask Claude
        try:
            response = self.client.messages.create(
                model="claude-3-opus-20240229",
                max_tokens=1000,
                messages=[{
                    "role": "user",
                    "content": [
                        {
                            "type": "text", 
                            "text": "Analyze this screen. What do you see? Any errors or important elements?"
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
            self.log_action(f"Claude says: {analysis}", "CLAUDE")
            
        except Exception as e:
            self.log_action(f"Error: {str(e)}", "ERROR")
            
    def highlight_next_action(self, action_name):
        """Visual highlight voor volgende actie"""
        # Flash een klein window
        flash = tk.Toplevel(self.root)
        flash.title("Next Action")
        flash.geometry("300x100+100+100")
        flash.configure(bg='yellow')
        
        label = tk.Label(flash, text=f"🎯 {action_name}", 
                        font=("Arial", 14), bg='yellow')
        label.pack(expand=True)
        
        flash.after(1000, flash.destroy)
        
    def execute_custom_command(self):
        """Voer custom command uit"""
        command = self.command_input.get()
        if command:
            self.execute_action(f"custom:{command}")
            self.command_input.delete(0, tk.END)
            
    def execute_claude_command(self, command):
        """Vraag Claude om hulp met command"""
        self.log_action(f"🤖 Asking Claude: {command}")
        
        # Screenshot current state
        screenshot = ImageGrab.grab()
        buffered = BytesIO()
        screenshot.save(buffered, format="PNG")
        img_base64 = base64.b64encode(buffered.getvalue()).decode()
        
        try:
            response = self.client.messages.create(
                model="claude-3-opus-20240229",
                max_tokens=1000,
                messages=[{
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": f"Help me with: {command}. What should I do?"
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
            
            advice = response.content[0].text
            self.log_action(f"Claude advises: {advice}", "CLAUDE")
            
        except Exception as e:
            self.log_action(f"Error: {str(e)}", "ERROR")
            
    def emergency_stop(self):
        """Emergency stop alle acties"""
        self.log_action("🛑 EMERGENCY STOP ACTIVATED!", "WARNING")
        # Clear queue
        while not self.action_queue.empty():
            self.action_queue.get()
        pyautogui.moveTo(0, 0)  # Move mouse to corner
        
    def start_screen_recorder(self):
        """Start screen recording voor meekijken"""
        def record_screen():
            fourcc = cv2.VideoWriter_fourcc(*'XVID')
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            out = cv2.VideoWriter(f'recording_{timestamp}.avi', fourcc, 10.0, (1920, 1080))
            
            self.is_recording = True
            while self.is_recording:
                img = pyautogui.screenshot()
                frame = np.array(img)
                frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                out.write(frame)
                
            out.release()
            
        # Start in separate thread
        record_thread = threading.Thread(target=record_screen)
        record_thread.daemon = True
        record_thread.start()
        
        self.log_action("🎥 Screen recording started", "INFO")
        
    def run(self):
        """Start Visual Control Center"""
        self.create_control_panel()
        
        # Keyboard shortcuts
        keyboard.add_hotkey('ctrl+shift+x', self.emergency_stop)
        keyboard.add_hotkey('ctrl+shift+s', self.take_screenshot)
        
        self.log_action("🚀 Visual Control Center Ready!", "SUCCESS")
        self.log_action("Shortcuts: Ctrl+Shift+X = Stop, Ctrl+Shift+S = Screenshot", "INFO")
        
        # Start GUI
        self.root.mainloop()

# Quick start functions
def quick_demo():
    """Quick demo voor testen"""
    controller = VisualControlCenter()
    controller.run()

if __name__ == "__main__":
    print("""
    ╔═══════════════════════════════════════════╗
    ║     Claude Visual Control Center          ║
    ║     Real-time Screen Control & Feedback   ║
    ╚═══════════════════════════════════════════╝
    """)
    
    quick_demo()
"""
Universal Visual Control voor alle platforms
Ondersteunt: GitHub, Vercel, LinkedIn, Gmail, etc.
"""

import os
import time
import json
from datetime import datetime
import pyautogui
import keyboard
# Import the base class directly from the file
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import SimpleVisualControl from the hyphenated filename
import importlib.util
spec = importlib.util.spec_from_file_location("visual_control_simple", "visual-control-simple.py")
visual_control_simple = importlib.util.module_from_spec(spec)
spec.loader.exec_module(visual_control_simple)
SimpleVisualControl = visual_control_simple.SimpleVisualControl
import tkinter as tk
from tkinter import ttk, scrolledtext
import webbrowser

class UniversalPlatformController(SimpleVisualControl):
    def __init__(self):
        super().__init__()
        self.load_platform_configs()
        
    def load_platform_configs(self):
        """Laad configuraties voor verschillende platforms"""
        self.platforms = {
            "github": {
                "name": "GitHub",
                "url": "https://github.com",
                "login_url": "https://github.com/login",
                "dashboard": "https://github.com/dashboard",
                "icon": "🐙",
                "actions": {
                    "new_repo": self.github_new_repo,
                    "check_pr": self.github_check_pr,
                    "deploy": self.github_actions_deploy,
                    "issues": self.github_check_issues
                }
            },
            "vercel": {
                "name": "Vercel",
                "url": "https://vercel.com",
                "dashboard": "https://vercel.com/dashboard",
                "icon": "▲",
                "actions": {
                    "deployments": self.vercel_deployments,
                    "domains": self.vercel_domains,
                    "env_vars": self.vercel_env_vars
                }
            },
            "linkedin": {
                "name": "LinkedIn",
                "url": "https://linkedin.com",
                "dashboard": "https://linkedin.com/feed",
                "icon": "💼",
                "actions": {
                    "post": self.linkedin_create_post,
                    "messages": self.linkedin_check_messages,
                    "network": self.linkedin_expand_network
                }
            },
            "gmail": {
                "name": "Gmail",
                "url": "https://mail.google.com",
                "icon": "📧",
                "actions": {
                    "compose": self.gmail_compose,
                    "search": self.gmail_search,
                    "organize": self.gmail_organize
                }
            },
            "aws": {
                "name": "AWS Console",
                "url": "https://console.aws.amazon.com",
                "icon": "☁️",
                "actions": {
                    "ec2": self.aws_ec2_dashboard,
                    "s3": self.aws_s3_buckets,
                    "lambda": self.aws_lambda_functions
                }
            },
            "stripe": {
                "name": "Stripe",
                "url": "https://dashboard.stripe.com",
                "icon": "💳",
                "actions": {
                    "payments": self.stripe_payments,
                    "customers": self.stripe_customers,
                    "invoices": self.stripe_invoices
                }
            }
        }
    
    def create_control_panel(self):
        """Enhanced control panel met platform tabs"""
        # Override parent create_control_panel
        self.root = tk.Tk()
        self.root.title("🌐 Universal Platform Controller")
        self.root.geometry("1000x700")
        
        # Header
        header_frame = ttk.Frame(self.root)
        header_frame.pack(fill="x", padx=10, pady=5)
        
        ttk.Label(header_frame, text="Universal Platform Controller", 
                 font=("Arial", 18, "bold")).pack(side="left")
        
        # Platform selector
        platform_frame = ttk.Frame(self.root)
        platform_frame.pack(fill="x", padx=10, pady=5)
        
        ttk.Label(platform_frame, text="Select Platform:").pack(side="left", padx=5)
        
        self.platform_var = tk.StringVar(value="github")
        platform_menu = ttk.Combobox(platform_frame, textvariable=self.platform_var,
                                    values=list(self.platforms.keys()), width=20)
        platform_menu.pack(side="left", padx=5)
        platform_menu.bind("<<ComboboxSelected>>", self.on_platform_change)
        
        ttk.Button(platform_frame, text="🌐 Open Platform",
                  command=self.open_selected_platform).pack(side="left", padx=5)
        
        # Action buttons frame
        self.action_frame = ttk.LabelFrame(self.root, text="Platform Actions", padding=10)
        self.action_frame.pack(fill="x", padx=10, pady=5)
        
        # Custom command frame
        cmd_frame = ttk.Frame(self.root)
        cmd_frame.pack(pady=10, padx=10, fill="x")
        
        ttk.Label(cmd_frame, text="Ask Claude:").pack(side="left", padx=5)
        self.cmd_entry = ttk.Entry(cmd_frame, width=50)
        self.cmd_entry.pack(side="left", padx=5)
        ttk.Button(cmd_frame, text="Send", command=self.send_custom_command).pack(side="left")
        
        # Log frame
        log_frame = ttk.LabelFrame(self.root, text="Action Log", padding=10)
        log_frame.pack(fill="both", expand=True, padx=10, pady=5)
        
        self.log_text = scrolledtext.ScrolledText(log_frame, height=20)
        self.log_text.pack(fill="both", expand=True)
        
        # Status bar
        self.status_var = tk.StringVar(value="Ready")
        status_bar = ttk.Label(self.root, textvariable=self.status_var, relief="sunken")
        status_bar.pack(side="bottom", fill="x")
        
        # Load initial platform
        self.on_platform_change()
        
        # Bind Enter key
        self.cmd_entry.bind('<Return>', lambda e: self.send_custom_command())
        
    def on_platform_change(self, event=None):
        """Update UI wanneer platform verandert"""
        platform = self.platform_var.get()
        platform_info = self.platforms[platform]
        
        # Clear action buttons
        for widget in self.action_frame.winfo_children():
            widget.destroy()
            
        # Create new action buttons
        row, col = 0, 0
        for action_name, action_func in platform_info["actions"].items():
            btn_text = f"{platform_info['icon']} {action_name.replace('_', ' ').title()}"
            ttk.Button(self.action_frame, text=btn_text,
                      command=action_func).grid(row=row, column=col, padx=5, pady=5)
            
            col += 1
            if col > 3:  # 4 buttons per row
                col = 0
                row += 1
                
    def open_selected_platform(self):
        """Open geselecteerde platform"""
        platform = self.platform_var.get()
        platform_info = self.platforms[platform]
        
        self.log(f"Opening {platform_info['name']}...", "ACTION")
        webbrowser.open(platform_info.get("dashboard", platform_info["url"]))
        
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
        
    # GitHub Actions
    def github_new_repo(self):
        """Create new GitHub repository"""
        self.log("📂 Creating new GitHub repository...", "ACTION")
        webbrowser.open("https://github.com/new")
        time.sleep(2)
        
        # Guide user
        steps = [
            "Enter repository name",
            "Add description",
            "Choose public/private",
            "Initialize with README",
            "Create repository"
        ]
        
        for step in steps:
            self.highlight_next_action(step)
            self.log(f"Step: {step}", "STEP")
            self.take_screenshot()
            time.sleep(2)
            
    def github_check_pr(self):
        """Check pull requests"""
        self.log("🔍 Checking GitHub pull requests...", "ACTION")
        webbrowser.open("https://github.com/pulls")
        time.sleep(2)
        self.analyze_screen()
        
    def github_actions_deploy(self):
        """Check GitHub Actions deployments"""
        self.log("🚀 Checking GitHub Actions...", "ACTION")
        self.send_custom_command_text("Navigate to my GitHub Actions workflows")
        
    def github_check_issues(self):
        """Check GitHub issues"""
        self.log("🐛 Checking GitHub issues...", "ACTION")
        webbrowser.open("https://github.com/issues")
        time.sleep(2)
        self.analyze_screen()
        
    # LinkedIn Actions  
    def linkedin_create_post(self):
        """Create LinkedIn post"""
        self.log("✍️ Creating LinkedIn post...", "ACTION")
        webbrowser.open("https://www.linkedin.com/feed/")
        time.sleep(3)
        self.send_custom_command_text("Click on 'Start a post' button")
        
    def linkedin_check_messages(self):
        """Check LinkedIn messages"""
        self.log("💬 Checking LinkedIn messages...", "ACTION")
        webbrowser.open("https://www.linkedin.com/messaging/")
        time.sleep(2)
        self.analyze_screen()
        
    def linkedin_expand_network(self):
        """Expand LinkedIn network"""
        self.log("🤝 Expanding LinkedIn network...", "ACTION")
        webbrowser.open("https://www.linkedin.com/mynetwork/")
        time.sleep(2)
        self.send_custom_command_text("Show me connection suggestions")
        
    # Gmail Actions
    def gmail_compose(self):
        """Compose new email"""
        self.log("📝 Composing new email...", "ACTION")
        webbrowser.open("https://mail.google.com/mail/u/0/#inbox?compose=new")
        
    def gmail_search(self):
        """Search emails"""
        self.log("🔍 Searching emails...", "ACTION")
        search_term = pyautogui.prompt("Enter search term:")
        if search_term:
            pyautogui.hotkey('/')  # Gmail search shortcut
            pyautogui.typewrite(search_term)
            pyautogui.press('enter')
            
    def gmail_organize(self):
        """Organize inbox"""
        self.log("📁 Organizing Gmail inbox...", "ACTION")
        self.send_custom_command_text("Help me organize my Gmail inbox with labels")
        
    # Vercel Actions (enhanced)
    def vercel_deployments(self):
        """Check Vercel deployments"""
        self.log("🚀 Checking Vercel deployments...", "ACTION")
        webbrowser.open("https://vercel.com/dashboard/deployments")
        time.sleep(3)
        self.analyze_screen()
        
    def vercel_domains(self):
        """Manage Vercel domains"""
        self.log("🌐 Managing Vercel domains...", "ACTION")
        webbrowser.open("https://vercel.com/dashboard/domains")
        
    def vercel_env_vars(self):
        """Manage environment variables"""
        self.log("🔐 Managing environment variables...", "ACTION")
        self.send_custom_command_text("Navigate to environment variables in current project")
        
    # AWS Actions
    def aws_ec2_dashboard(self):
        """Open EC2 dashboard"""
        self.log("🖥️ Opening AWS EC2...", "ACTION")
        webbrowser.open("https://console.aws.amazon.com/ec2/")
        
    def aws_s3_buckets(self):
        """Manage S3 buckets"""
        self.log("🪣 Opening AWS S3...", "ACTION")
        webbrowser.open("https://s3.console.aws.amazon.com/s3/")
        
    def aws_lambda_functions(self):
        """Manage Lambda functions"""
        self.log("⚡ Opening AWS Lambda...", "ACTION")
        webbrowser.open("https://console.aws.amazon.com/lambda/")
        
    # Stripe Actions
    def stripe_payments(self):
        """View Stripe payments"""
        self.log("💰 Viewing Stripe payments...", "ACTION")
        webbrowser.open("https://dashboard.stripe.com/payments")
        
    def stripe_customers(self):
        """Manage Stripe customers"""
        self.log("👥 Managing Stripe customers...", "ACTION")
        webbrowser.open("https://dashboard.stripe.com/customers")
        
    def stripe_invoices(self):
        """View Stripe invoices"""
        self.log("📄 Viewing Stripe invoices...", "ACTION")
        webbrowser.open("https://dashboard.stripe.com/invoices")
        
    def send_custom_command_text(self, text):
        """Helper to send command programmatically"""
        self.cmd_entry.delete(0, tk.END)
        self.cmd_entry.insert(0, text)
        self.send_custom_command()
        
    def run(self):
        """Start Universal Controller"""
        self.create_control_panel()
        
        # Keyboard shortcuts
        keyboard.add_hotkey('ctrl+shift+x', self.emergency_stop)
        keyboard.add_hotkey('ctrl+shift+s', self.take_screenshot)
        keyboard.add_hotkey('ctrl+shift+g', lambda: self.platform_var.set("github"))
        keyboard.add_hotkey('ctrl+shift+v', lambda: self.platform_var.set("vercel"))
        
        self.log("🌐 Universal Platform Controller Ready!", "SUCCESS")
        self.log("Shortcuts: Ctrl+Shift+[X=Stop, S=Screenshot, G=GitHub, V=Vercel]", "INFO")
        
        self.root.mainloop()

# Run the controller
if __name__ == "__main__":
    controller = UniversalPlatformController()
    controller.run()
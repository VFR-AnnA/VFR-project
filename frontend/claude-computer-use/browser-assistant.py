"""
Browser Automation Assistant for Vercel and Web Tasks
Helps with deployment checks, error debugging, and browser-based tasks
"""

import os
import time
import webbrowser
from claude_screen_assistant import ClaudeScreenAssistant

class BrowserAssistant(ClaudeScreenAssistant):
    def __init__(self):
        super().__init__()
        print("🌐 Browser Automation Assistant Ready!")
        print("=" * 50)
        
    def open_vercel_dashboard(self):
        """Open Vercel dashboard in browser"""
        print("🚀 Opening Vercel dashboard...")
        webbrowser.open('https://vercel.com/dashboard')
        time.sleep(3)  # Wait for page to load
        
    def help_with_vercel(self):
        """Specific help for Vercel deployment issues"""
        self.open_vercel_dashboard()
        
        # Take screenshot and analyze
        response = self.ask_claude(
            "I'm on my Vercel dashboard. Can you help me check "
            "why my VFR-ANNA deployment is giving 404 errors? "
            "Look for any failed deployments, error messages, or configuration issues."
        )
        
        print(f"\n📝 Analysis: {response}")
        return response
    
    def check_vercel_logs(self):
        """Check Vercel build and function logs"""
        response = self.ask_claude(
            "Please help me navigate to the deployment logs. "
            "I need to see if there are any build errors or warnings."
        )
        return response
    
    def fix_vercel_env_vars(self):
        """Help with environment variables setup"""
        response = self.ask_claude(
            "I need to add environment variables to my Vercel project. "
            "Can you guide me to the settings where I can add ANTHROPIC_API_KEY "
            "and other required environment variables?"
        )
        return response
    
    def check_vercel_routes(self):
        """Check routing configuration"""
        response = self.ask_claude(
            "Can you help me check if my Next.js routes are properly configured in Vercel? "
            "I'm getting 404 errors on some pages like /try/body-ai"
        )
        return response
    
    def vercel_deployment_menu(self):
        """Interactive menu for Vercel tasks"""
        print("\n🎯 Vercel Deployment Assistant")
        print("-" * 50)
        print("1. Check deployment status and errors")
        print("2. View build logs")
        print("3. Configure environment variables")
        print("4. Check routing configuration")
        print("5. Redeploy project")
        print("6. Custom question")
        print("7. Back to main menu")
        
        choice = input("\nSelect option (1-7): ").strip()
        
        if choice == "1":
            self.help_with_vercel()
        elif choice == "2":
            self.check_vercel_logs()
        elif choice == "3":
            self.fix_vercel_env_vars()
        elif choice == "4":
            self.check_vercel_routes()
        elif choice == "5":
            response = self.ask_claude(
                "Please help me trigger a new deployment for my project. "
                "Show me where to click to redeploy."
            )
            print(f"\n📝 Instructions: {response}")
        elif choice == "6":
            question = input("\n❓ What do you need help with? ")
            response = self.ask_claude(question)
            print(f"\n📝 Claude: {response}")
    
    def check_local_vs_vercel(self):
        """Compare local working version with Vercel deployment"""
        print("\n🔍 Comparing local vs Vercel deployment...")
        
        # Check local
        print("📍 Checking local environment...")
        local_response = self.ask_claude(
            "Look at my local development server at localhost:3000. "
            "Is it working properly? Any errors in the console?"
        )
        
        # Check Vercel
        print("\n☁️ Checking Vercel deployment...")
        vercel_url = input("Enter your Vercel URL (e.g., vfr-anna.vercel.app): ")
        webbrowser.open(f"https://{vercel_url}")
        time.sleep(3)
        
        vercel_response = self.ask_claude(
            f"Now I'm looking at the Vercel deployment at {vercel_url}. "
            "What differences do you see compared to the local version? "
            "Are there any errors in the console?"
        )
        
        print(f"\n📊 Comparison Results:")
        print(f"Local: {local_response}")
        print(f"Vercel: {vercel_response}")
    
    def common_vercel_fixes(self):
        """Show common Vercel 404 fixes"""
        print("\n🔧 Common Vercel 404 Fixes:")
        print("-" * 50)
        
        fixes = [
            {
                "issue": "Build output directory",
                "fix": "Ensure 'Output Directory' is set to '.next' in Vercel settings",
                "check": "Settings > General > Build & Development Settings"
            },
            {
                "issue": "Dynamic routes",
                "fix": "Add getStaticPaths for dynamic routes or use getServerSideProps",
                "check": "Check pages with [param].tsx naming"
            },
            {
                "issue": "Environment variables",
                "fix": "Add all required env vars in Vercel dashboard",
                "check": "Settings > Environment Variables"
            },
            {
                "issue": "API routes",
                "fix": "Ensure API routes are in pages/api or app/api directory",
                "check": "Check your API route file locations"
            },
            {
                "issue": "Case sensitivity",
                "fix": "Vercel is case-sensitive, check import paths",
                "check": "Review all import statements"
            }
        ]
        
        for i, fix in enumerate(fixes, 1):
            print(f"\n{i}. {fix['issue']}:")
            print(f"   ✅ Fix: {fix['fix']}")
            print(f"   📍 Where: {fix['check']}")
        
        print("\n" + "-" * 50)
        check = input("\nWould you like me to help check any of these? (y/n): ")
        if check.lower() == 'y':
            self.open_vercel_dashboard()
            response = self.ask_claude(
                "Please help me check the build settings and environment variables "
                "to ensure everything is configured correctly for my Next.js app."
            )
            print(f"\n📝 Claude: {response}")

def main():
    """Main function to run browser assistant"""
    assistant = BrowserAssistant()
    
    while True:
        print("\n🌐 Browser Automation Assistant")
        print("=" * 50)
        print("1. Vercel Deployment Help")
        print("2. Check Local vs Vercel")
        print("3. Common Vercel 404 Fixes")
        print("4. Open specific URL")
        print("5. Exit")
        
        choice = input("\nSelect option (1-5): ").strip()
        
        if choice == "1":
            assistant.vercel_deployment_menu()
        elif choice == "2":
            assistant.check_local_vs_vercel()
        elif choice == "3":
            assistant.common_vercel_fixes()
        elif choice == "4":
            url = input("Enter URL to open: ")
            webbrowser.open(url)
            time.sleep(2)
            question = input("What would you like help with on this page? ")
            response = assistant.ask_claude(question)
            print(f"\n📝 Claude: {response}")
        elif choice == "5":
            print("👋 Goodbye!")
            break
        else:
            print("Invalid choice, please try again.")

if __name__ == "__main__":
    main()
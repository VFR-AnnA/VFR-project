# vercel-specific-helper.py
from visual_control_complete import VisualControlCenter
import time

class VercelHelper(VisualControlCenter):
    def __init__(self):
        super().__init__()
        
    def check_deployment_status(self):
        """Check Vercel deployment status"""
        self.log_action("🔍 Checking Vercel deployment status...")
        
        # Navigate to deployments
        self.navigate_to_url("https://vercel.com/dashboard/deployments")
        time.sleep(3)
        
        # Analyze
        self.analyze_current_screen()
        
    def fix_404_errors(self):
        """Help fix 404 errors"""
        self.log_action("🔧 Looking for 404 error solutions...")
        
        steps = [
            "Take screenshot of error",
            "Check build logs",
            "Verify output directory",
            "Check routing configuration"
        ]
        
        for step in steps:
            self.log_action(f"Step: {step}")
            self.take_screenshot()
            time.sleep(2)
            
            # Ask Claude for help
            self.execute_claude_command(f"Help me with: {step}")
            
            # Wait for user confirmation
            input("\nPress Enter to continue to next step...")

# Run Vercel Helper
if __name__ == "__main__":
    helper = VercelHelper()
    helper.run()
    
    # After GUI loads, auto-check deployment
    helper.root.after(2000, helper.check_deployment_status)
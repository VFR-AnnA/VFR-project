"""
GitHub Specific Automation Helper
Voor VFR-ANNA project management
"""

from universal_platform_controller import UniversalPlatformController
import time

class GitHubAutomation(UniversalPlatformController):
    def __init__(self):
        super().__init__()
        self.repo_name = "VFR-ANNA/VFR-project"
        
    def daily_github_workflow(self):
        """Dagelijkse GitHub workflow"""
        self.log("🌅 Starting daily GitHub workflow...", "ACTION")
        
        tasks = [
            ("Check pull requests", self.check_vfr_prs),
            ("Review issues", self.check_vfr_issues),
            ("Update project board", self.update_project_board),
            ("Check Actions status", self.check_actions_status),
            ("Sync branches", self.sync_branches)
        ]
        
        for task_name, task_func in tasks:
            self.log(f"📋 Task: {task_name}", "TASK")
            task_func()
            time.sleep(2)
            
        self.log("✅ Daily workflow complete!", "SUCCESS")
        
    def check_vfr_prs(self):
        """Check VFR project PRs"""
        url = f"https://github.com/{self.repo_name}/pulls"
        self.log(f"Opening: {url}", "ACTION")
        self.navigate_to_url(url)
        time.sleep(2)
        
        # Analyze PRs
        self.send_custom_command_text(
            "Check if there are any pull requests that need review. "
            "Tell me their status and what needs attention."
        )
        
    def check_vfr_issues(self):
        """Check project issues"""
        url = f"https://github.com/{self.repo_name}/issues"
        self.log(f"Opening: {url}", "ACTION")
        self.navigate_to_url(url)
        time.sleep(2)
        
        # Categorize issues
        self.send_custom_command_text(
            "Analyze the open issues. Which ones are high priority? "
            "Any bugs that need immediate attention?"
        )
        
    def update_project_board(self):
        """Update GitHub project board"""
        url = f"https://github.com/{self.repo_name}/projects"
        self.log(f"Opening: {url}", "ACTION")
        self.navigate_to_url(url)
        time.sleep(2)
        
        self.send_custom_command_text(
            "Help me organize the project board. "
            "Move completed items to Done column."
        )
        
    def check_actions_status(self):
        """Check GitHub Actions CI/CD"""
        url = f"https://github.com/{self.repo_name}/actions"
        self.log(f"Opening: {url}", "ACTION")
        self.navigate_to_url(url)
        time.sleep(2)
        
        self.send_custom_command_text(
            "Check if all GitHub Actions are passing. "
            "If any failed, what's the error?"
        )
        
    def sync_branches(self):
        """Sync branches hulp"""
        self.log("🔄 Helping with branch sync...", "ACTION")
        
        # Guide through git commands
        commands = [
            "git checkout main",
            "git pull origin main",
            "git checkout demo/cegeka-monday",
            "git merge main",
            "git push origin demo/cegeka-monday"
        ]
        
        for cmd in commands:
            self.log(f"Execute: {cmd}", "COMMAND")
            self.highlight_next_action(f"Run: {cmd}")
            time.sleep(1)
            
    def create_issue_from_error(self, error_text):
        """Create GitHub issue from error"""
        self.log("🐛 Creating issue from error...", "ACTION")
        
        # Navigate to new issue
        url = f"https://github.com/{self.repo_name}/issues/new"
        self.navigate_to_url(url)
        time.sleep(2)
        
        # Fill form with Claude's help
        self.send_custom_command_text(
            f"Help me create an issue for this error: {error_text}. "
            "Suggest a good title and description."
        )
        
    def navigate_to_url(self, url):
        """Navigate browser naar URL"""
        import webbrowser
        webbrowser.open(url)

# Quick functions
def run_daily_workflow():
    """Run daily GitHub workflow"""
    automation = GitHubAutomation()
    automation.run()
    # Schedule daily workflow
    automation.root.after(5000, automation.daily_github_workflow)

if __name__ == "__main__":
    run_daily_workflow()
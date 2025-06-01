# 🌐 Universal Platform Controller - Complete Guide

## Overview

The Universal Platform Controller is a powerful automation tool that integrates Claude's visual capabilities with multiple platforms including GitHub, Vercel, LinkedIn, Gmail, AWS, and more.

## Features

### Supported Platforms:
- **🐙 GitHub** - Repository management, PRs, issues, Actions
- **▲ Vercel** - Deployments, domains, environment variables
- **💼 LinkedIn** - Posts, messages, networking
- **📧 Gmail** - Compose, search, organize
- **☁️ AWS** - EC2, S3, Lambda management
- **💳 Stripe** - Payments, customers, invoices
- **🐦 Twitter/X** - Tweets, scheduling, analytics
- **📷 Instagram** - Posts, stories, insights
- **📺 YouTube** - Upload, analytics, comments

## Quick Start

### 1. Run the Setup Script:
```bash
setup-all-platforms.bat
```

### 2. Choose Your Option:
- **Option 1**: Universal Controller (all platforms)
- **Option 2**: GitHub-specific automation
- **Option 3**: Social media suite
- **Option 4**: Vercel helper
- **Option 5**: Simple visual control
- **Option 6**: Claude screen assistant

### 3. Using the Universal Controller:

1. **Select Platform**: Use dropdown to choose platform
2. **Quick Actions**: Click platform-specific buttons
3. **Ask Claude**: Type questions about what's on screen
4. **Keyboard Shortcuts**:
   - `Ctrl+Shift+G` - Switch to GitHub
   - `Ctrl+Shift+V` - Switch to Vercel
   - `Ctrl+Shift+L` - Switch to LinkedIn
   - `Ctrl+Shift+A` - Switch to AWS
   - `Ctrl+Shift+X` - Emergency stop
   - `Ctrl+Shift+S` - Take screenshot

## Platform-Specific Features

### GitHub Automation
- Daily workflow automation
- PR and issue management
- Project board updates
- Actions monitoring
- Branch synchronization

### Social Media Automation
- Cross-platform posting
- Content scheduling
- Analytics tracking
- Engagement monitoring

### Vercel Management
- Deployment monitoring
- Domain configuration
- Environment variables
- Build log analysis

## Example Workflows

### 1. Fix Vercel 404 Error:
```
1. Select "vercel" from dropdown
2. Click "🚀 Deployments"
3. Ask Claude: "Why is my deployment failing?"
4. Follow Claude's guidance
```

### 2. GitHub Daily Workflow:
```
1. Run: python github-automation.py
2. Automated checks will run:
   - Pull requests review
   - Issues triage
   - Actions status
   - Project board update
```

### 3. Cross-Platform Social Post:
```
1. Run: python social-media-automation.py
2. Enter your content
3. Tool posts to LinkedIn, Twitter, Instagram
```

## Configuration

Edit `platforms-config.json` to customize:
- Default repositories
- Team names
- Posting schedules
- Automation rules

## Troubleshooting

### Common Issues:

1. **"Module not found" error**:
   ```bash
   pip install pyautogui keyboard pillow python-dotenv anthropic
   ```

2. **API Key not found**:
   - Ensure `.env` file exists with `ANTHROPIC_API_KEY`

3. **Platform won't open**:
   - Check internet connection
   - Verify URLs in platform config

## Advanced Features

### Custom Platform Addition:
Add new platforms by updating the `platforms` dictionary in the controller:

```python
self.platforms["new_platform"] = {
    "name": "Platform Name",
    "url": "https://platform.com",
    "icon": "🎯",
    "actions": {
        "action1": self.new_platform_action1,
        "action2": self.new_platform_action2
    }
}
```

### Automation Rules:
Configure in `platforms-config.json`:
- Auto-review PRs
- Auto-redeploy on success
- Cross-post to social media
- Cost alerts for AWS

## Best Practices

1. **Always verify actions** before letting Claude execute
2. **Use specific questions** for better Claude responses
3. **Take screenshots** before and after changes
4. **Check logs** in the action log window
5. **Use keyboard shortcuts** for faster navigation

## Security Notes

- Never share your `.env` file
- Use read-only access where possible
- Review Claude's suggestions before executing
- Keep sensitive operations manual

## Support

For issues or questions:
1. Check the action log for errors
2. Take a screenshot of the issue
3. Ask Claude for help with the specific error

The Universal Platform Controller brings all your platforms together with Claude's AI assistance for maximum productivity!
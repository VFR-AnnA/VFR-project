# 🌐 Browser Automation with Claude Computer Use

## What Claude CAN Do in Your Browser

✅ **Open websites and navigate**
✅ **Click buttons and links**
✅ **Fill out forms**
✅ **Read error messages**
✅ **Take screenshots**
✅ **Check deployment status**
✅ **Debug console errors**

## Quick Commands for Your Current Claude Session

Since you already have Claude Screen Assistant running, you can type these commands directly:

### For Vercel 404 Issues:

```
"Open Chrome and go to my Vercel dashboard"
```

```
"Help me check why my VFR deployment on Vercel is giving 404 errors"
```

```
"Check my Vercel build logs for any errors"
```

```
"Help me add environment variables in Vercel settings"
```

```
"Check if my Next.js output directory is configured correctly in Vercel"
```

### For Local Development:

```
"Open localhost:3000/demo and check if it's working"
```

```
"Look at the browser console for any errors"
```

```
"Check the network tab to see if models are loading"
```

## Step-by-Step: Fix Vercel 404

1. **In your Claude terminal, type:**
   ```
   Open my browser and go to vercel.com/dashboard
   ```

2. **After login, type:**
   ```
   Help me find my VFR-ANNA project and check the latest deployment
   ```

3. **To check settings:**
   ```
   Navigate to project settings and check if output directory is set to .next
   ```

4. **For environment variables:**
   ```
   Show me where to add ANTHROPIC_API_KEY in Vercel environment variables
   ```

## Common Vercel 404 Causes & Fixes

### 1. Output Directory Issue
- **Problem**: Vercel doesn't know where your Next.js build output is
- **Fix**: Set Output Directory to `.next` in Vercel settings
- **Claude command**: `"Check my Vercel build settings for output directory"`

### 2. Missing Routes
- **Problem**: Route `/try/body-ai` doesn't exist in production
- **Fix**: Ensure file exists at `app/try/body-ai/page.tsx`
- **Claude command**: `"Help me check if my routes are deployed correctly"`

### 3. Environment Variables
- **Problem**: Missing API keys or config in production
- **Fix**: Add all `.env.local` variables to Vercel
- **Claude command**: `"Guide me to add environment variables in Vercel"`

### 4. Case Sensitivity
- **Problem**: Windows is case-insensitive, Vercel (Linux) is case-sensitive
- **Fix**: Check all import paths match exact case
- **Claude command**: `"Check my import statements for case sensitivity issues"`

## Browser Automation Examples

### Example 1: Check Deployment
```
You: "Open my Vercel project vfr-anna.vercel.app and check console for errors"
Claude: *Opens browser, navigates to site, opens DevTools*
Claude: "I see a 404 error for /api/model route. This suggests..."
```

### Example 2: Fix Configuration
```
You: "Help me change the build command in Vercel settings"
Claude: *Navigates to settings*
Claude: "Click on 'Build & Development Settings', then change the build command to..."
```

### Example 3: Debug Production vs Local
```
You: "Compare localhost:3000 with my Vercel deployment side by side"
Claude: *Opens both in different tabs*
Claude: "I notice the local version works but Vercel shows 404. This indicates..."
```

## Pro Tips

1. **Be Specific**: Instead of "fix my site", say "check why /demo route returns 404 on Vercel"

2. **Let Claude See**: Make sure the relevant part of the screen is visible

3. **Step by Step**: Break complex tasks into smaller steps

4. **Use Screenshots**: Claude can analyze what's on screen better than descriptions

## Safety Notes

- Claude will ask before clicking anything destructive
- Your passwords are safe (Claude can't see password fields)
- Use "show me where to click" if you want to do it yourself

## Quick Start Right Now

Since your Claude Assistant is already running, try this command:

```
Check why my VFR project shows 404 on Vercel but works locally
```

Claude will guide you through the debugging process!
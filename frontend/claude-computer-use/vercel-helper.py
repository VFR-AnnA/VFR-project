"""
Vercel Deployment Helper
Simple commands to help with Vercel 404 issues
"""

import webbrowser
import time

def show_vercel_404_fixes():
    """Display common Vercel 404 fixes"""
    print("\n🔧 Common Vercel 404 Fixes for VFR-ANNA Project")
    print("=" * 60)
    
    print("\n1. Check Build Output Directory:")
    print("   - Go to Vercel Dashboard > Settings > General")
    print("   - Ensure 'Output Directory' is set to '.next'")
    print("   - Framework Preset should be 'Next.js'")
    
    print("\n2. Environment Variables:")
    print("   - Add all required env vars in Vercel")
    print("   - Common ones: ANTHROPIC_API_KEY, DATABASE_URL, etc.")
    print("   - Go to Settings > Environment Variables")
    
    print("\n3. Dynamic Routes Issue:")
    print("   - For routes like /try/body-ai")
    print("   - Ensure you have proper file structure:")
    print("     app/try/body-ai/page.tsx OR")
    print("     pages/try/body-ai.tsx")
    
    print("\n4. API Routes:")
    print("   - Should be in app/api/ or pages/api/")
    print("   - Check case sensitivity (Linux vs Windows)")
    
    print("\n5. Check Vercel Logs:")
    print("   - Go to your deployment")
    print("   - Click on 'Functions' tab")
    print("   - Look for error logs")
    
    print("\n" + "=" * 60)

def open_vercel_with_instructions():
    """Open Vercel and provide step-by-step instructions"""
    print("\n🚀 Opening Vercel Dashboard...")
    webbrowser.open('https://vercel.com/dashboard')
    
    print("\n📋 Step-by-Step Instructions:")
    print("1. Log in to Vercel if needed")
    print("2. Find your VFR-ANNA project")
    print("3. Click on the project")
    print("4. Go to 'Deployments' to see recent builds")
    print("5. Click on the latest deployment")
    print("6. Check the 'Build Logs' for errors")
    print("7. If build succeeded, check 'Function Logs'")
    
    input("\nPress Enter when you're ready to continue...")
    
    print("\n🔍 What to look for:")
    print("- Red error messages in build logs")
    print("- Missing environment variables warnings")
    print("- Module not found errors")
    print("- Route compilation errors")

def quick_vercel_commands():
    """Show quick commands for Claude Screen Assistant"""
    print("\n💡 Quick Commands for Claude Screen Assistant:")
    print("=" * 60)
    
    print("\nIn your Claude terminal, you can type:")
    print("")
    print('1. "Open Vercel and check my deployment logs"')
    print('2. "Help me add ANTHROPIC_API_KEY to Vercel environment variables"')
    print('3. "Check why /try/body-ai route is giving 404 on Vercel"')
    print('4. "Compare my local routes with Vercel deployment"')
    print('5. "Help me redeploy my VFR project on Vercel"')
    
    print("\n🎯 Most Common Fix for 404:")
    print("Type this in Claude Assistant:")
    print('"Check my Vercel build settings and ensure output directory is .next"')

def main():
    """Main menu"""
    while True:
        print("\n🌐 Vercel 404 Helper for VFR-ANNA")
        print("=" * 40)
        print("1. Show common 404 fixes")
        print("2. Open Vercel with instructions")
        print("3. Show Claude commands for Vercel")
        print("4. Exit")
        
        choice = input("\nSelect option (1-4): ").strip()
        
        if choice == "1":
            show_vercel_404_fixes()
        elif choice == "2":
            open_vercel_with_instructions()
        elif choice == "3":
            quick_vercel_commands()
        elif choice == "4":
            print("👋 Good luck with your deployment!")
            break
        else:
            print("Invalid choice, please try again.")

if __name__ == "__main__":
    main()
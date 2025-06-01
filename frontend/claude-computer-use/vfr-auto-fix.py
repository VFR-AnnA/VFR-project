import os
import time
import subprocess
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class VFRAutoFix:
    """Automated fixes for common VFR-ANNA project issues"""
    
    def __init__(self):
        self.project_path = "c:/Users/User/VFR-project/frontend"
        print("🚀 VFR-ANNA Auto-Fix Tool")
        print("=" * 50)
        
    def check_npm_running(self):
        """Check if npm dev server is running"""
        print("\n🔍 Checking if development server is running...")
        try:
            # Check if port 3000 is in use
            result = subprocess.run(
                ["netstat", "-an"], 
                capture_output=True, 
                text=True,
                shell=True
            )
            if ":3000" in result.stdout:
                print("✅ Development server is running on port 3000")
                return True
            else:
                print("❌ Development server is not running")
                return False
        except Exception as e:
            print(f"⚠️ Could not check server status: {e}")
            return False
    
    def start_dev_server(self):
        """Start the development server"""
        if not self.check_npm_running():
            print("\n🚀 Starting development server...")
            try:
                # Kill any process on port 3000 first
                print("🔧 Clearing port 3000...")
                subprocess.run(["npx", "kill-port", "3000"], shell=True)
                time.sleep(2)
                
                # Start npm run dev
                print("🔧 Starting npm run dev...")
                subprocess.Popen(
                    ["npm", "run", "dev"], 
                    shell=True,
                    cwd=self.project_path
                )
                time.sleep(5)
                print("✅ Development server started!")
            except Exception as e:
                print(f"❌ Failed to start server: {e}")
    
    def check_dependencies(self):
        """Check and install missing dependencies"""
        print("\n🔍 Checking dependencies...")
        try:
            # Check if node_modules exists
            node_modules_path = os.path.join(self.project_path, "node_modules")
            if not os.path.exists(node_modules_path):
                print("❌ node_modules not found!")
                print("🔧 Installing dependencies...")
                subprocess.run(
                    ["npm", "install"], 
                    shell=True,
                    cwd=self.project_path
                )
                print("✅ Dependencies installed!")
            else:
                print("✅ Dependencies are installed")
        except Exception as e:
            print(f"❌ Error checking dependencies: {e}")
    
    def check_models(self):
        """Check if 3D models are in place"""
        print("\n🔍 Checking 3D models...")
        models_path = os.path.join(self.project_path, "public/models")
        
        if os.path.exists(models_path):
            models = os.listdir(models_path)
            if models:
                print(f"✅ Found {len(models)} models:")
                for model in models[:5]:  # Show first 5
                    print(f"   - {model}")
            else:
                print("⚠️ Models directory is empty")
        else:
            print("❌ Models directory not found!")
            print("🔧 Creating models directory...")
            os.makedirs(models_path, exist_ok=True)
            print("✅ Models directory created")
    
    def test_demo_endpoint(self):
        """Test if demo endpoint is accessible"""
        print("\n🔍 Testing demo endpoint...")
        try:
            import requests
            response = requests.get("http://localhost:3000/demo", timeout=5)
            if response.status_code == 200:
                print("✅ Demo endpoint is accessible!")
            else:
                print(f"⚠️ Demo endpoint returned status: {response.status_code}")
        except Exception as e:
            print(f"❌ Could not access demo endpoint: {e}")
    
    def run_all_checks(self):
        """Run all checks and fixes"""
        print("\n🎯 Running all checks...\n")
        
        # 1. Check dependencies
        self.check_dependencies()
        
        # 2. Check models
        self.check_models()
        
        # 3. Check/start dev server
        self.start_dev_server()
        
        # 4. Test demo endpoint
        time.sleep(3)  # Give server time to start
        self.test_demo_endpoint()
        
        print("\n" + "=" * 50)
        print("✅ Auto-fix complete!")
        print("\n📝 Next steps:")
        print("1. Open http://localhost:3000/demo in your browser")
        print("2. Check the terminal for any remaining errors")
        print("3. If issues persist, run claude-screen-assistant.py")

if __name__ == "__main__":
    fixer = VFRAutoFix()
    fixer.run_all_checks()
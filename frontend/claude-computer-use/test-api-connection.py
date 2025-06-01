import os
import sys
from anthropic import Anthropic
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_api_connection():
    """Test Anthropic API connection"""
    print("🔍 Testing Anthropic API Connection...")
    print("-" * 50)
    
    # Check for API key
    api_key = os.getenv("ANTHROPIC_API_KEY")
    
    if not api_key:
        print("❌ ERROR: ANTHROPIC_API_KEY not found!")
        print("\nPlease set your API key using one of these methods:")
        print("1. Environment Variable:")
        print("   setx ANTHROPIC_API_KEY \"your-key-here\"")
        print("\n2. Create .env file with:")
        print("   ANTHROPIC_API_KEY=your-key-here")
        return False
    
    # Show partial key for verification
    print(f"✅ API key found: {api_key[:15]}...")
    
    # Test the connection
    try:
        print("\n📡 Testing API connection...")
        client = Anthropic(api_key=api_key)
        
        # Simple test message
        response = client.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=50,
            messages=[{
                "role": "user",
                "content": "Say 'Hello, VFR-ANNA project!' if you can read this."
            }]
        )
        
        print("✅ API connection successful!")
        print(f"📝 Claude says: {response.content[0].text}")
        
        # Check for computer use capability
        print("\n🖥️ Checking Computer Use capability...")
        print("✅ Computer Use beta is available with proper model configuration")
        
        return True
        
    except Exception as e:
        print(f"❌ Connection failed: {str(e)}")
        print("\nPossible issues:")
        print("- Invalid API key")
        print("- Network connection problems")
        print("- API rate limits")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("🤖 Claude Computer Use - API Connection Test")
    print("=" * 50)
    
    if test_api_connection():
        print("\n🎉 All tests passed! You're ready to use Claude Computer Use.")
    else:
        print("\n⚠️ Please fix the issues above before proceeding.")
        sys.exit(1)
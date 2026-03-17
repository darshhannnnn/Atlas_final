#!/usr/bin/env python3
"""
Quick status check for ATLAS backend
"""

import requests
import sys

def check_service(name, url):
    """Check if a service is responding"""
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            print(f"✅ {name}: Running")
            return True
        else:
            print(f"⚠️  {name}: HTTP {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"❌ {name}: Not reachable")
        return False
    except requests.exceptions.Timeout:
        print(f"⏱️  {name}: Timeout")
        return False
    except Exception as e:
        print(f"❌ {name}: Error - {str(e)}")
        return False

def main():
    print("🔍 ATLAS Status Check")
    print("=" * 40)
    
    services = {
        "Backend API": "http://localhost:8000/health",
        "Frontend": "http://localhost:5173",
        "PostgreSQL": "http://localhost:5432",  # This will fail but shows if port is open
    }
    
    results = {}
    for name, url in services.items():
        results[name] = check_service(name, url)
    
    print("\n" + "=" * 40)
    
    # Check API key
    print("\n🔑 Checking API Key configuration...")
    try:
        with open("backend/.env", "r") as f:
            content = f.read()
            if "GEMINI_API_KEY=" in content and len(content.split("GEMINI_API_KEY=")[1].split("\n")[0].strip()) > 20:
                print("✅ GEMINI_API_KEY is configured")
            else:
                print("⚠️  GEMINI_API_KEY might not be set correctly")
    except Exception as e:
        print(f"❌ Could not read backend/.env: {e}")
    
    print("\n" + "=" * 40)
    
    if results.get("Backend API"):
        print("\n✅ Backend is running - you can test agents!")
        print("\nRun: python3 test_agents.py")
    else:
        print("\n❌ Backend is not running")
        print("\nStart services with: docker-compose up -d")

if __name__ == "__main__":
    main()

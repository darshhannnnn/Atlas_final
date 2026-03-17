#!/usr/bin/env python3
"""
Test script for ATLAS agents
Tests each agent in solo mode and the full research pipeline
"""

import requests
import json
import sys

BASE_URL = "http://localhost:8000/api/v1"

def login():
    """Login and get access token"""
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": "test2@example.com", "password": "testpass123"}
    )
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        print(f"❌ Login failed: {response.text}")
        sys.exit(1)

def test_agent(token, agent_name, query):
    """Test a single agent in solo mode"""
    print(f"\n🧪 Testing {agent_name}...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "message": query,
        "mode": "solo",
        "selected_agent": agent_name
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/chat/message",
            headers=headers,
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            content = data.get("content", "")
            if len(content) > 10:
                print(f"✅ {agent_name}: SUCCESS")
                print(f"   Response preview: {content[:150]}...")
                return True
            else:
                print(f"⚠️  {agent_name}: Empty or short response")
                print(f"   Full response: {json.dumps(data, indent=2)}")
                return False
        else:
            print(f"❌ {agent_name}: HTTP {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print(f"⏱️  {agent_name}: TIMEOUT (>30s)")
        return False
    except Exception as e:
        print(f"❌ {agent_name}: EXCEPTION - {str(e)}")
        return False

def test_pipeline(token):
    """Test full research pipeline"""
    print(f"\n🔬 Testing full research pipeline...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "message": "What is artificial intelligence?",
        "mode": "full_research"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/chat/message",
            headers=headers,
            json=payload,
            timeout=60
        )
        
        if response.status_code == 200:
            data = response.json()
            content = data.get("content", "")
            if len(content) > 50:
                print(f"✅ Full research pipeline: SUCCESS")
                print(f"   Content length: {len(content)} chars")
                print(f"   Agents executed: {len(data.get('agent_traces', []))}")
                return True
            else:
                print(f"⚠️  Full research pipeline: Short response")
                print(f"   Full response: {json.dumps(data, indent=2)}")
                return False
        else:
            print(f"❌ Full research pipeline: HTTP {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print(f"⏱️  Full research pipeline: TIMEOUT (>60s)")
        return False
    except Exception as e:
        print(f"❌ Full research pipeline: EXCEPTION - {str(e)}")
        return False

def main():
    print("🧪 ATLAS Agent Testing")
    print("=" * 50)
    
    # Login
    print("\n📝 Logging in...")
    token = login()
    print("✅ Login successful")
    
    # Test each agent
    agents = [
        ("search", "What is machine learning?"),
        ("outliner", "Create an outline about climate change"),
        ("writer", "Write about renewable energy"),
        ("verifier", "Verify facts about solar power"),
        ("summarizer", "Summarize the benefits of AI"),
        ("update", "Refine content about quantum computing")
    ]
    
    results = {}
    for agent_name, query in agents:
        results[agent_name] = test_agent(token, agent_name, query)
    
    # Test pipeline
    results["pipeline"] = test_pipeline(token)
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Summary:")
    print("=" * 50)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for name, success in results.items():
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed!")
        sys.exit(0)
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        sys.exit(1)

if __name__ == "__main__":
    main()

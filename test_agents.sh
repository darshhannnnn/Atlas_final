#!/bin/bash

# Test script for all ATLAS agents
# This script tests each agent in solo mode

echo "🧪 ATLAS Agent Testing Script"
echo "=============================="
echo ""

# First, login to get a token
echo "📝 Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test2@example.com", "password": "testpass123"}')

TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed. Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login successful"
echo ""

# Test each agent
test_agent() {
  local agent_name=$1
  local test_query=$2
  
  echo "Testing $agent_name..."
  
  RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/chat/message \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"message\": \"$test_query\", \"mode\": \"solo\", \"selected_agent\": \"$agent_name\"}")
  
  # Check if response contains content
  HAS_CONTENT=$(echo $RESPONSE | python3 -c "import sys, json; r=json.load(sys.stdin); print('YES' if 'content' in r and len(r.get('content', '')) > 10 else 'NO')" 2>/dev/null)
  
  if [ "$HAS_CONTENT" = "YES" ]; then
    echo "✅ $agent_name: SUCCESS"
    # Show first 100 chars of response
    echo $RESPONSE | python3 -c "import sys, json; r=json.load(sys.stdin); print('   Response:', r.get('content', '')[:100] + '...')" 2>/dev/null
  else
    echo "❌ $agent_name: FAILED"
    echo "   Response: $RESPONSE"
  fi
  echo ""
}

# Test all agents
echo "🔍 Testing individual agents in solo mode:"
echo ""

test_agent "search" "What is machine learning?"
test_agent "outliner" "Create an outline about climate change"
test_agent "writer" "Write about renewable energy"
test_agent "verifier" "Verify facts about solar power"
test_agent "summarizer" "Summarize the benefits of AI"
test_agent "update" "Refine content about quantum computing"

echo ""
echo "🔬 Testing full research pipeline:"
PIPELINE_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/chat/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message": "What is artificial intelligence?", "mode": "full_research"}')

PIPELINE_SUCCESS=$(echo $PIPELINE_RESPONSE | python3 -c "import sys, json; r=json.load(sys.stdin); print('YES' if 'content' in r and len(r.get('content', '')) > 50 else 'NO')" 2>/dev/null)

if [ "$PIPELINE_SUCCESS" = "YES" ]; then
  echo "✅ Full research pipeline: SUCCESS"
else
  echo "❌ Full research pipeline: FAILED"
  echo "   Response: $PIPELINE_RESPONSE"
fi

echo ""
echo "=============================="
echo "✅ Testing complete!"

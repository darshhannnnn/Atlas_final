#!/bin/bash
# Quick test to verify ATLAS is working

echo "🚀 Quick ATLAS Test"
echo ""

# Check if services are running
echo "1️⃣ Checking if backend is running..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
  echo "   ✅ Backend is running"
else
  echo "   ❌ Backend is not running"
  echo "   Run: docker-compose up -d"
  exit 1
fi

echo ""
echo "2️⃣ Checking if frontend is running..."
if curl -s http://localhost:5173 > /dev/null 2>&1; then
  echo "   ✅ Frontend is running"
else
  echo "   ❌ Frontend is not running"
fi

echo ""
echo "3️⃣ Checking API key..."
if grep -q "GEMINI_API_KEY=AIzaSy" backend/.env 2>/dev/null; then
  echo "   ✅ API key is configured"
else
  echo "   ⚠️  API key might not be set"
fi

echo ""
echo "✅ Basic checks complete!"
echo ""
echo "Next steps:"
echo "  • Run full agent tests: python3 test_agents.py"
echo "  • Open web interface: http://localhost:5173"
echo "  • Read testing guide: cat TESTING_GUIDE.md"

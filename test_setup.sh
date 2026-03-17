#!/bin/bash

echo "🧪 ATLAS Setup Test"
echo "==================="
echo ""

# Test 1: Docker
echo "1. Checking Docker..."
if docker info > /dev/null 2>&1; then
    echo "   ✅ Docker is running"
else
    echo "   ❌ Docker is not running"
    exit 1
fi

# Test 2: .env file
echo "2. Checking .env file..."
if [ -f ".env" ]; then
    echo "   ✅ .env file exists"
    
    if grep -q "your-gemini-api-key-here" .env; then
        echo "   ⚠️  Warning: API key not configured"
    else
        echo "   ✅ API key is configured"
    fi
else
    echo "   ❌ .env file missing"
    exit 1
fi

# Test 3: Services
echo "3. Checking services..."
if docker-compose ps | grep -q "Up"; then
    echo "   ✅ Services are running"
    
    # Test backend
    if curl -s http://localhost:8000/health > /dev/null; then
        echo "   ✅ Backend is responding"
    else
        echo "   ⚠️  Backend not responding yet (may still be starting)"
    fi
    
    # Test frontend
    if curl -s http://localhost:5173 > /dev/null; then
        echo "   ✅ Frontend is responding"
    else
        echo "   ⚠️  Frontend not responding yet (may still be starting)"
    fi
else
    echo "   ⚠️  Services not running. Start with: docker-compose up -d"
fi

echo ""
echo "📊 Test Summary"
echo "==============="
echo "If all checks passed, open: http://localhost:5173"
echo ""

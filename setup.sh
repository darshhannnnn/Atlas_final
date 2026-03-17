#!/bin/bash

echo "🔧 ATLAS Setup Script"
echo "====================="
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker Desktop first."
    echo "   Visit: https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker is running"

# Check for .env file
if [ ! -f ".env" ]; then
    echo ""
    echo "📝 Creating .env file..."
    cp backend/.env.example .env
    
    echo ""
    echo "⚠️  IMPORTANT: You need a Gemini API key"
    echo ""
    echo "1. Visit: https://makersuite.google.com/app/apikey"
    echo "2. Sign in with Google"
    echo "3. Create API Key (it's FREE)"
    echo "4. Copy the key"
    echo ""
    read -p "Enter your Gemini API key: " api_key
    
    if [ -z "$api_key" ]; then
        echo "❌ No API key provided. Please edit .env manually."
        exit 1
    fi
    
    # Update .env with API key
    sed -i.bak "s/your-gemini-api-key-here/$api_key/" .env
    rm .env.bak 2>/dev/null
    
    echo "✅ API key configured"
else
    echo "✅ .env file exists"
    
    # Check if API key is set
    if grep -q "your-gemini-api-key-here" .env; then
        echo "⚠️  Warning: Gemini API key not configured in .env"
        echo "   Please edit .env and add your API key"
        exit 1
    fi
fi

echo ""
echo "🏗️  Building and starting ATLAS..."
docker-compose up -d --build

echo ""
echo "⏳ Waiting for services to start..."
sleep 10

echo ""
echo "✅ ATLAS is ready!"
echo ""
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "📖 Next steps:"
echo "   1. Open http://localhost:5173 in your browser"
echo "   2. Register a new account"
echo "   3. Start chatting with ATLAS!"
echo ""
echo "💡 Tips:"
echo "   - View logs: docker-compose logs -f"
echo "   - Stop ATLAS: docker-compose down"
echo "   - Restart: docker-compose restart"
echo ""

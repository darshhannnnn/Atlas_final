#!/bin/bash

echo "🚀 Starting ATLAS Multi-Agent System..."

# Check if .env exists
if [ ! -f "atlas/.env" ]; then
    echo "⚠️  Warning: atlas/.env not found. Creating from example..."
    cp atlas/backend/.env.example atlas/.env
    echo "❗ Please edit atlas/.env and add your GEMINI_API_KEY"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Navigate to atlas directory
cd atlas

# Start services
echo "📦 Starting Docker containers..."
docker-compose up -d

echo ""
echo "✅ ATLAS is starting up!"
echo ""
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "⏳ Wait 10-15 seconds for services to initialize..."
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"

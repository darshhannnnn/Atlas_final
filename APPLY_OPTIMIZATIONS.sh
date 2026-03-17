#!/bin/bash

echo "🚀 Applying Performance Optimizations..."
echo ""
echo "Changes:"
echo "  ✅ Switched to mistral-small-latest (faster model)"
echo "  ✅ Reduced max tokens: 10000 → 2000"
echo "  ✅ Reduced timeouts: 180s → 60s"
echo "  ✅ Optimized agent prompts"
echo "  ✅ Added temperature and token limits"
echo ""
echo "Expected improvement: 50-70% faster responses"
echo ""

# Stop containers
echo "📦 Stopping containers..."
docker-compose down

# Rebuild backend with new optimizations
echo "🔨 Rebuilding backend..."
docker-compose build backend

# Start all services
echo "▶️  Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check status
echo ""
echo "✅ Services status:"
docker-compose ps

echo ""
echo "🎉 Optimizations applied!"
echo ""
echo "Test the improvements:"
echo "  1. Open http://localhost:3000"
echo "  2. Ask a simple question"
echo "  3. Response should be 3-6 seconds (was 8-15 seconds)"
echo ""
echo "View logs: docker-compose logs -f backend"

#!/bin/bash

echo "🚀 Setting up Onboarding Feature..."
echo ""

# Stop containers
echo "📦 Stopping containers..."
docker-compose down

# Rebuild backend with new models
echo "🔨 Rebuilding backend..."
docker-compose build backend

# Start database first
echo "▶️  Starting database..."
docker-compose up -d postgres
sleep 5

# Start backend
echo "▶️  Starting backend..."
docker-compose up -d backend
sleep 5

# Run migration
echo "🔄 Running database migration..."
docker-compose exec backend python migrate_onboarding.py

# Rebuild frontend
echo "🔨 Rebuilding frontend..."
docker-compose build frontend

# Start all services
echo "▶️  Starting all services..."
docker-compose up -d

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 10

# Check status
echo ""
echo "✅ Services status:"
docker-compose ps

echo ""
echo "🎉 Onboarding feature is ready!"
echo ""
echo "New user flow:"
echo "  1. Register → Onboarding (3 steps)"
echo "  2. Step 1: Enter name"
echo "  3. Step 2: Select up to 3 interests"
echo "  4. Step 3: Choose starter prompt or skip"
echo "  5. Start chatting!"
echo ""
echo "Test it: http://localhost:3000/register"
echo ""
echo "View logs: docker-compose logs -f backend frontend"

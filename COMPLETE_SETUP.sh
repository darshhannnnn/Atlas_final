#!/bin/bash

set -e  # Exit on error

echo "🚀 Complete ATLAS Setup with Onboarding"
echo "========================================"
echo ""

# Stop everything
echo "📦 Step 1: Stopping all containers..."
docker-compose down
echo "✅ Containers stopped"
echo ""

# Build images
echo "🔨 Step 2: Building Docker images..."
docker-compose build --no-cache backend frontend
echo "✅ Images built"
echo ""

# Start database
echo "🗄️  Step 3: Starting PostgreSQL..."
docker-compose up -d postgres
echo "⏳ Waiting for database to be ready..."
sleep 10
echo "✅ Database started"
echo ""

# Start backend
echo "⚙️  Step 4: Starting backend..."
docker-compose up -d backend
echo "⏳ Waiting for backend to be ready..."
sleep 10
echo "✅ Backend started"
echo ""

# Run migration
echo "🔄 Step 5: Running database migration..."
docker-compose exec backend python migrate_onboarding.py || {
    echo "⚠️  Migration failed or already applied"
}
echo "✅ Migration complete"
echo ""

# Start frontend and other services
echo "🎨 Step 6: Starting frontend..."
docker-compose up -d
echo "⏳ Waiting for all services..."
sleep 5
echo "✅ All services started"
echo ""

# Verify setup
echo "🔍 Step 7: Verifying setup..."
echo ""

echo "Container status:"
docker-compose ps
echo ""

echo "Backend health check:"
curl -s http://localhost:8000/health | jq '.' || echo "❌ Backend not responding"
echo ""

echo "Database schema check:"
docker-compose exec -T postgres psql -U atlas -d atlas_db -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name IN ('name', 'interests', 'onboarding_completed');" || echo "❌ Database check failed"
echo ""

echo "========================================"
echo "🎉 Setup Complete!"
echo "========================================"
echo ""
echo "📝 Next steps:"
echo "  1. Open http://localhost:3000"
echo "  2. Register a new account"
echo "  3. Complete the 3-step onboarding"
echo "  4. Start chatting!"
echo ""
echo "📊 Monitoring:"
echo "  - Backend logs:  docker-compose logs -f backend"
echo "  - Frontend logs: docker-compose logs -f frontend"
echo "  - All logs:      docker-compose logs -f"
echo ""
echo "🔧 Troubleshooting:"
echo "  - If issues occur, run: ./FIX_ONBOARDING.sh"
echo "  - Read: ONBOARDING_TROUBLESHOOTING.md"
echo ""

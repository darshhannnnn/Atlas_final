#!/bin/bash

echo "🔧 Fixing Onboarding Issues..."
echo ""

# Check if containers are running
echo "1. Checking container status..."
docker-compose ps

echo ""
echo "2. Restarting backend..."
docker-compose restart backend

echo ""
echo "3. Waiting for backend to start..."
sleep 5

echo ""
echo "4. Checking backend logs for errors..."
docker-compose logs --tail=20 backend

echo ""
echo "5. Testing backend health..."
curl -s http://localhost:8000/health | jq '.' || echo "Backend not responding"

echo ""
echo "6. Checking if database has new columns..."
docker-compose exec -T postgres psql -U atlas -d atlas_db -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name IN ('name', 'interests', 'onboarding_completed');"

echo ""
echo "7. If columns are missing, run migration..."
echo "   docker-compose exec backend python migrate_onboarding.py"

echo ""
echo "8. Restart frontend..."
docker-compose restart frontend

echo ""
echo "✅ Done! Check the logs above for any errors."
echo ""
echo "If you see 'Not Found' errors:"
echo "  1. Make sure backend is running: docker-compose ps"
echo "  2. Check backend logs: docker-compose logs backend"
echo "  3. Run migration: docker-compose exec backend python migrate_onboarding.py"
echo "  4. Restart: docker-compose restart backend frontend"

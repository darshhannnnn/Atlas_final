#!/bin/bash

echo "Testing Onboarding API Endpoints..."
echo ""

# First, check if backend is running
echo "1. Checking backend health..."
curl -s http://localhost:8000/health
echo ""
echo ""

# Check if the profile endpoint exists
echo "2. Testing profile endpoint (should return 401 without auth)..."
curl -s -X PATCH http://localhost:8000/api/v1/auth/profile \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "interests": ["coding"], "onboarding_completed": true}'
echo ""
echo ""

# Check database columns
echo "3. Checking database schema..."
docker-compose exec -T postgres psql -U atlas -d atlas_db -c "\d users"
echo ""

echo "Done!"

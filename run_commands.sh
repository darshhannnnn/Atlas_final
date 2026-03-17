#!/bin/bash

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  ATLAS - Mistral AI Migration                             ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "This script will rebuild your backend with Mistral AI"
echo ""
echo "Press ENTER to continue or Ctrl+C to cancel..."
read

echo ""
echo "Step 1: Stopping services..."
docker-compose down

echo ""
echo "Step 2: Rebuilding backend with Mistral SDK..."
docker-compose up -d --build

echo ""
echo "Step 3: Waiting for services to start (30 seconds)..."
sleep 30

echo ""
echo "Step 4: Testing Mistral connection..."
docker exec atlas-backend-1 python test_mistral.py

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  ✅ Migration Complete!                                   ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "  1. Test agents: python3 test_agents.py"
echo "  2. Open browser: http://localhost:5173"
echo ""
echo "You now have 1 BILLION tokens/month - no more expiration! 🎉"

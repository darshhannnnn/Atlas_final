#!/bin/bash

echo "🚀 ATLAS Deployment Script"
echo "=========================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Navigate to project root
cd "$(dirname "$0")"

echo "📁 Current directory: $(pwd)"

# Login to Railway
echo "🔐 Logging into Railway..."
railway login

# Initialize Railway project if not already done
if [ ! -f "railway.toml" ]; then
    echo "🆕 Initializing Railway project..."
    railway init
fi

# Deploy the backend
echo "🚀 Deploying backend to Railway..."
cd backend
railway up --detach

echo "✅ Backend deployment initiated!"
echo ""
echo "📋 Next steps:"
echo "1. Go to your Railway dashboard"
echo "2. Add PostgreSQL database service"
echo "3. Set environment variables:"
echo "   - MISTRAL_API_KEY=tGTh1pAmBIjMQcmND6xi6bbUDrvhetqy"
echo "   - SECRET_KEY=atlas-secret-key-change-in-production-2024"
echo "4. Wait for deployment to complete"
echo "5. Test the health endpoint: https://your-app.railway.app/health"
echo ""
echo "🌐 Frontend deployment:"
echo "1. cd ../frontend"
echo "2. Update API URL in your config"
echo "3. npm run build"
echo "4. npx vercel --prod"
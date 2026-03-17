# ATLAS Deployment Guide for Render

## Overview
This guide covers deploying the ATLAS application (FastAPI backend + React frontend) to Render using Infrastructure as Code.

## Prerequisites
1. Render account (free tier available)
2. GitHub repository with your code
3. Mistral API key

## Deployment Steps

### 1. Prepare Your Repository
Ensure your code is pushed to GitHub with the `render.yaml` file in the root directory.

### 2. Connect to Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Select the repository containing your ATLAS project

### 3. Configure Environment Variables
Render will automatically create the services defined in `render.yaml`. You'll need to set:

**Backend Service (atlas-backend):**
- `MISTRAL_API_KEY`: Your Mistral AI API key
- Other variables (DATABASE_URL, REDIS_URL, SECRET_KEY) are auto-generated

### 4. Service Architecture
The deployment creates:
- **Backend API**: FastAPI service on `atlas-backend.onrender.com`
- **Frontend**: Static site on `atlas-frontend.onrender.com`
- **Database**: PostgreSQL database (atlas-db)
- **Redis**: Redis instance for caching (atlas-redis)

### 5. Post-Deployment
1. Backend will be available at: `https://atlas-backend.onrender.com`
2. Frontend will be available at: `https://atlas-frontend.onrender.com`
3. Check logs in Render dashboard if any issues occur

## Environment Variables Reference

### Backend
- `SECRET_KEY`: Auto-generated JWT secret
- `DATABASE_URL`: Auto-connected to PostgreSQL
- `REDIS_URL`: Auto-connected to Redis
- `MISTRAL_API_KEY`: Your API key (set manually)

### Frontend
- `VITE_API_URL`: Points to backend service URL

## Troubleshooting

### Common Issues
1. **Build failures**: Check Python/Node versions in logs
2. **Database connection**: Verify DATABASE_URL is properly set
3. **CORS errors**: Backend allows all origins for development

### Logs Access
- Go to Render Dashboard
- Select your service
- Click "Logs" tab for real-time debugging

## Free Tier Limitations
- Services sleep after 15 minutes of inactivity
- 750 hours/month of runtime
- Limited database storage (1GB)
- No custom domains on free tier

## Scaling
To upgrade from free tier:
1. Go to service settings
2. Change plan to paid tier
3. Adjust instance types as needed

## Manual Deployment Alternative
If Blueprint deployment fails, you can create services manually:

1. Create Web Service for backend
2. Create Static Site for frontend  
3. Create PostgreSQL database
4. Create Redis service
5. Configure environment variables manually
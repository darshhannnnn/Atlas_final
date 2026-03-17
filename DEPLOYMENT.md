# ATLAS Deployment Guide

## Local Development

### Prerequisites
- Docker Desktop installed and running
- Google Gemini API key (free)

### Quick Start

1. Get API key from https://makersuite.google.com/app/apikey

2. Run setup:
```bash
cd atlas
chmod +x setup.sh
./setup.sh
```

3. Access at http://localhost:5173

### Manual Setup

```bash
cd atlas
cp backend/.env.example .env
# Edit .env and add GEMINI_API_KEY
docker-compose up -d
```

## Cloud Deployment

### Option 1: Render (Recommended)

1. Create account at https://render.com
2. Create PostgreSQL database (free tier)
3. Create Redis instance (free tier)
4. Create Web Service for backend:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Add environment variables
5. Create Static Site for frontend:
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

### Option 2: Railway

1. Create account at https://railway.app
2. New Project → Deploy from GitHub
3. Add PostgreSQL and Redis services
4. Configure environment variables
5. Deploy

### Option 3: Fly.io

```bash
fly launch
fly deploy
```

## Environment Variables

Required for backend:
```
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
SECRET_KEY=your-secret-key
GEMINI_API_KEY=your-gemini-key
```

Required for frontend:
```
VITE_API_URL=https://your-backend-url.com
```

## Production Checklist

- [ ] Change SECRET_KEY to strong random value
- [ ] Use production database (not default credentials)
- [ ] Enable HTTPS
- [ ] Set up proper CORS origins
- [ ] Configure rate limiting
- [ ] Set up monitoring/logging
- [ ] Regular database backups
- [ ] File upload size limits enforced

## Monitoring

View logs:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

Check health:
```bash
curl http://localhost:8000/health
```

## Troubleshooting

### Backend won't start
- Check DATABASE_URL is correct
- Verify GEMINI_API_KEY is set
- Check logs: `docker-compose logs backend`

### Frontend can't connect
- Verify VITE_API_URL in frontend/.env
- Check CORS settings in backend
- Ensure backend is running

### Database errors
- Reset: `docker-compose down -v && docker-compose up -d`
- Check PostgreSQL is running: `docker-compose ps`

### Agent execution fails
- Verify Gemini API key is valid
- Check API quota/limits
- Review agent logs in backend

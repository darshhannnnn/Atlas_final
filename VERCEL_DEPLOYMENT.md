# Deploying ATLAS to Vercel

## Overview
ATLAS consists of two parts that need to be deployed separately:
1. **Frontend** (React + Vite) - Deploy to Vercel
2. **Backend** (FastAPI) - Deploy to Vercel Serverless Functions

## Prerequisites

1. **Vercel Account**: Sign up at https://vercel.com
2. **GitHub Repository**: Push your code to GitHub
3. **External Database**: Set up PostgreSQL (recommended: Neon, Supabase, or Railway)
4. **External Redis**: Set up Redis (recommended: Upstash Redis)

## Step 1: Set Up External Services

### PostgreSQL Database (Choose one)

**Option A: Neon (Recommended)**
1. Go to https://neon.tech
2. Create a free account
3. Create a new project
4. Copy the connection string (looks like: `postgresql://user:pass@host.neon.tech/dbname`)

**Option B: Supabase**
1. Go to https://supabase.com
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string

**Option C: Railway**
1. Go to https://railway.app
2. Create a PostgreSQL database
3. Copy the connection string

### Redis (Upstash)
1. Go to https://upstash.com
2. Create a free account
3. Create a Redis database
4. Copy the Redis URL (looks like: `redis://default:pass@host.upstash.io:6379`)

## Step 2: Deploy Backend to Vercel

### 2.1 Prepare Backend

The backend needs a few modifications for Vercel:

1. **Create `api/index.py`** (Vercel entry point):
```bash
mkdir -p atlas/backend/api
```

Create `atlas/backend/api/index.py`:
```python
from main import app

# Vercel serverless function handler
def handler(request):
    return app(request)
```

### 2.2 Deploy Backend

1. **Push to GitHub**:
```bash
cd atlas
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

2. **Import to Vercel**:
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Select the `backend` folder as the root directory
   - Framework Preset: Other
   - Build Command: Leave empty
   - Output Directory: Leave empty

3. **Configure Environment Variables**:
   Go to Project Settings > Environment Variables and add:
   
   ```
   DATABASE_URL=postgresql://your-neon-connection-string
   REDIS_URL=redis://your-upstash-redis-url
   SECRET_KEY=your-secret-key-generate-a-random-string
   MISTRAL_API_KEY=tGTh1pAmBIjMQcmND6xi6bbUDrvhetqy
   ```

4. **Deploy**: Click "Deploy"

5. **Note the Backend URL**: After deployment, copy the URL (e.g., `https://atlas-backend.vercel.app`)

## Step 3: Deploy Frontend to Vercel

### 3.1 Update Frontend API URL

1. **Create `.env.production`** in `atlas/frontend/`:
```bash
VITE_API_URL=https://your-backend-url.vercel.app/api/v1
```

### 3.2 Deploy Frontend

1. **Import to Vercel**:
   - Go to https://vercel.com/new
   - Import your GitHub repository again
   - Select the `frontend` folder as the root directory
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

2. **Configure Environment Variables**:
   Go to Project Settings > Environment Variables and add:
   
   ```
   VITE_API_URL=https://your-backend-url.vercel.app/api/v1
   ```

3. **Deploy**: Click "Deploy"

4. **Your Frontend URL**: After deployment, you'll get a URL like `https://atlas.vercel.app`

## Step 4: Update CORS Settings

Update `atlas/backend/main.py` to allow your frontend domain:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://atlas.vercel.app",  # Your frontend URL
        "http://localhost:5173",      # Local development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Commit and push this change - Vercel will auto-deploy.

## Step 5: Initialize Database

Run migrations on your production database:

```bash
# Connect to your database and run:
psql "your-neon-connection-string"

# Then run the SQL from your migrations
```

Or use the migration script:
```bash
# Update DATABASE_URL in the script to your production URL
python atlas/backend/migrate_onboarding.py
```

## Step 6: Test Your Deployment

1. Visit your frontend URL: `https://atlas.vercel.app`
2. Register a new account
3. Complete onboarding
4. Test the chat functionality

## Troubleshooting

### Backend Issues

**Error: "Module not found"**
- Check that all dependencies are in `requirements.txt`
- Vercel has a 250MB limit for serverless functions

**Error: "Database connection failed"**
- Verify DATABASE_URL is correct
- Check that your database allows connections from Vercel IPs
- Neon and Supabase work best with Vercel

**Error: "Function timeout"**
- Vercel free tier has 10s timeout
- Pro tier has 60s timeout
- Consider upgrading or optimizing slow operations

### Frontend Issues

**Error: "API calls failing"**
- Check VITE_API_URL is correct
- Verify CORS settings in backend
- Check browser console for errors

**Error: "Environment variables not working"**
- Vercel requires `VITE_` prefix for Vite env vars
- Redeploy after adding env vars

## Alternative: Deploy Backend Elsewhere

If Vercel serverless functions are too limiting, consider:

1. **Railway** (Recommended for FastAPI):
   - Go to https://railway.app
   - Deploy from GitHub
   - Add PostgreSQL and Redis services
   - Set environment variables
   - Get deployment URL

2. **Render**:
   - Go to https://render.com
   - Create a Web Service
   - Connect GitHub repo
   - Add environment variables

3. **Fly.io**:
   - Install flyctl
   - Run `fly launch` in backend directory
   - Configure environment variables
   - Deploy with `fly deploy`

## Cost Estimates

**Free Tier (Hobby)**:
- Vercel: Free (100GB bandwidth, 100 builds/month)
- Neon: Free (3GB storage, 1 project)
- Upstash: Free (10,000 commands/day)
- **Total: $0/month**

**Paid Tier (Production)**:
- Vercel Pro: $20/month
- Neon Pro: $19/month
- Upstash: $10/month
- **Total: ~$49/month**

## Custom Domain

1. Go to Vercel Project Settings > Domains
2. Add your custom domain (e.g., `atlas.yourdomain.com`)
3. Update DNS records as instructed
4. SSL certificate is automatic

## Monitoring

- **Vercel Analytics**: Built-in, free
- **Vercel Logs**: View in dashboard
- **Error Tracking**: Consider Sentry integration

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:
- `main` branch → Production
- Other branches → Preview deployments

## Security Checklist

- [ ] Change SECRET_KEY to a strong random string
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS only (Vercel does this automatically)
- [ ] Set up proper CORS origins
- [ ] Use strong database passwords
- [ ] Enable database SSL connections
- [ ] Set up rate limiting (consider Upstash Rate Limit)

## Next Steps

1. Set up monitoring and alerts
2. Configure custom domain
3. Set up CI/CD for automated testing
4. Add error tracking (Sentry)
5. Set up database backups
6. Configure CDN for static assets

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for frontend errors
3. Check Vercel function logs for backend errors
4. Verify all environment variables are set correctly

Good luck with your deployment! 🚀

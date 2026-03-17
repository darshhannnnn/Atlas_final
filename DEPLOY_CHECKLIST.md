# 🚀 ATLAS Deployment Checklist

## Before You Start
- [ ] Have a GitHub account
- [ ] Have a Vercel account (sign up at vercel.com)
- [ ] Have your Mistral API key ready

## Step 1: Set Up External Services (10 minutes)

### Database - Neon (Free)
- [ ] Go to https://neon.tech
- [ ] Sign up / Log in
- [ ] Click "Create Project"
- [ ] Copy connection string
- [ ] Save as: `DATABASE_URL`

### Redis - Upstash (Free)
- [ ] Go to https://upstash.com
- [ ] Sign up / Log in
- [ ] Click "Create Database"
- [ ] Select "Redis"
- [ ] Copy Redis URL
- [ ] Save as: `REDIS_URL`

## Step 2: Prepare Code (5 minutes)

### Update CORS Settings
- [ ] Edit `atlas/backend/main.py`
- [ ] Update `allow_origins` with your future Vercel URL
- [ ] Or use `["*"]` for testing (not recommended for production)

### Create .env.production
- [ ] Already created at `atlas/frontend/.env.production`
- [ ] Will update after backend deployment

## Step 3: Push to GitHub (2 minutes)

```bash
cd atlas
git init
git add .
git commit -m "Initial ATLAS deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/atlas.git
git push -u origin main
```

- [ ] Code pushed to GitHub
- [ ] Repository is public or Vercel has access

## Step 4: Deploy Backend (5 minutes)

### On Vercel Dashboard
- [ ] Go to https://vercel.com/new
- [ ] Click "Import Git Repository"
- [ ] Select your atlas repository
- [ ] Configure:
  - Root Directory: `backend`
  - Framework: Other
  - Build Command: (leave empty)
  - Output Directory: (leave empty)

### Add Environment Variables
- [ ] Click "Environment Variables"
- [ ] Add these variables:

```
DATABASE_URL = your-neon-connection-string
REDIS_URL = your-upstash-redis-url
SECRET_KEY = generate-random-32-char-string
MISTRAL_API_KEY = tGTh1pAmBIjMQcmND6xi6bbUDrvhetqy
```

- [ ] Click "Deploy"
- [ ] Wait for deployment to complete
- [ ] Copy backend URL (e.g., `https://atlas-backend-xxx.vercel.app`)

### Test Backend
- [ ] Visit `https://your-backend-url.vercel.app/health`
- [ ] Should see: `{"status":"healthy"}`

## Step 5: Deploy Frontend (5 minutes)

### Update Frontend Config
- [ ] Edit `atlas/frontend/.env.production`
- [ ] Set `VITE_API_URL=https://your-backend-url.vercel.app/api/v1`
- [ ] Commit and push changes

### On Vercel Dashboard
- [ ] Go to https://vercel.com/new
- [ ] Import same repository
- [ ] Configure:
  - Root Directory: `frontend`
  - Framework: Vite
  - Build Command: `npm run build`
  - Output Directory: `dist`

### Add Environment Variables
- [ ] Add: `VITE_API_URL = https://your-backend-url.vercel.app/api/v1`
- [ ] Click "Deploy"
- [ ] Wait for deployment
- [ ] Copy frontend URL (e.g., `https://atlas-xxx.vercel.app`)

## Step 6: Update CORS (2 minutes)

- [ ] Edit `atlas/backend/main.py`
- [ ] Update `allow_origins`:
```python
allow_origins=[
    "https://your-frontend-url.vercel.app",
    "http://localhost:5173",
]
```
- [ ] Commit and push
- [ ] Vercel auto-deploys backend

## Step 7: Initialize Database (3 minutes)

### Run Migration
```bash
# Update DATABASE_URL in the script
python atlas/backend/migrate_onboarding.py
```

- [ ] Migration completed successfully
- [ ] Database tables created

## Step 8: Test Deployment (5 minutes)

- [ ] Visit your frontend URL
- [ ] Register a new account
- [ ] Complete onboarding (3 steps)
- [ ] Send a test message
- [ ] Verify response from AI

## Step 9: Configure Custom Domain (Optional)

### On Vercel Dashboard
- [ ] Go to Project Settings > Domains
- [ ] Add your domain (e.g., `atlas.yourdomain.com`)
- [ ] Update DNS records as shown
- [ ] Wait for SSL certificate (automatic)

## Troubleshooting

### Backend Issues
- **500 Error**: Check Vercel function logs
- **Database Error**: Verify DATABASE_URL is correct
- **CORS Error**: Check allow_origins in main.py

### Frontend Issues
- **Can't connect to API**: Check VITE_API_URL
- **404 on routes**: Vercel should handle this automatically
- **Env vars not working**: Redeploy after adding them

### Database Issues
- **Connection timeout**: Check Neon dashboard
- **Tables not found**: Run migration script
- **Permission denied**: Check connection string

## Post-Deployment

- [ ] Set up monitoring (Vercel Analytics)
- [ ] Configure error tracking (optional: Sentry)
- [ ] Set up database backups
- [ ] Document your deployment URLs
- [ ] Share with team/users

## URLs to Save

```
Frontend: https://_____________________.vercel.app
Backend:  https://_____________________.vercel.app
Database: postgresql://_____________________.neon.tech
Redis:    redis://_____________________.upstash.io
```

## Costs

**Free Tier:**
- Vercel: Free (100GB bandwidth/month)
- Neon: Free (3GB storage)
- Upstash: Free (10,000 commands/day)
- **Total: $0/month** ✅

**Paid Tier (if needed):**
- Vercel Pro: $20/month
- Neon Pro: $19/month
- Upstash: $10/month
- **Total: ~$49/month**

## Done! 🎉

Your ATLAS is now live and accessible worldwide!

Share your deployment:
- Frontend: `https://your-atlas.vercel.app`
- Invite users to register and try it out

## Next Steps

1. Monitor usage and performance
2. Set up custom domain
3. Configure analytics
4. Add more features
5. Scale as needed

Need help? Check:
- `QUICK_DEPLOY.md` for fast deployment
- `VERCEL_DEPLOYMENT.md` for detailed guide
- Vercel documentation: https://vercel.com/docs

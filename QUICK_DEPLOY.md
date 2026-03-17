# Quick Deploy Guide - ATLAS on Vercel

## 🚀 5-Minute Deployment

### Step 1: Set Up External Services (5 min)

**Database (Neon - Free)**
1. Go to https://neon.tech → Sign up
2. Create project → Copy connection string
3. Save it: `postgresql://user:pass@host.neon.tech/dbname`

**Redis (Upstash - Free)**
1. Go to https://upstash.com → Sign up
2. Create Redis database → Copy Redis URL
3. Save it: `redis://default:pass@host.upstash.io:6379`

### Step 2: Deploy Backend (2 min)

1. **Push to GitHub**:
```bash
cd atlas
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/atlas.git
git push -u origin main
```

2. **Deploy on Vercel**:
   - Go to https://vercel.com/new
   - Import your GitHub repo
   - Root Directory: `backend`
   - Click "Deploy"

3. **Add Environment Variables** (in Vercel dashboard):
```
DATABASE_URL=your-neon-connection-string
REDIS_URL=your-upstash-redis-url
SECRET_KEY=generate-random-string-here
MISTRAL_API_KEY=tGTh1pAmBIjMQcmND6xi6bbUDrvhetqy
```

4. **Redeploy** after adding env vars

5. **Copy Backend URL**: `https://atlas-backend-xxx.vercel.app`

### Step 3: Deploy Frontend (2 min)

1. **Update Frontend Config**:
Edit `atlas/frontend/.env.production`:
```
VITE_API_URL=https://your-backend-url.vercel.app/api/v1
```

2. **Deploy on Vercel**:
   - Go to https://vercel.com/new
   - Import same GitHub repo
   - Root Directory: `frontend`
   - Framework: Vite
   - Click "Deploy"

3. **Add Environment Variable**:
```
VITE_API_URL=https://your-backend-url.vercel.app/api/v1
```

4. **Redeploy**

### Step 4: Initialize Database (1 min)

```bash
# Update DATABASE_URL in migrate_onboarding.py to your Neon URL
python atlas/backend/migrate_onboarding.py
```

### Step 5: Update CORS (1 min)

Edit `atlas/backend/main.py`:
```python
allow_origins=[
    "https://your-frontend-url.vercel.app",
    "http://localhost:5173",
]
```

Commit and push - auto-deploys!

### Done! 🎉

Visit your frontend URL and test:
1. Register account
2. Complete onboarding
3. Start chatting

## Troubleshooting

**Backend not working?**
- Check Vercel function logs
- Verify all env vars are set
- Check DATABASE_URL is correct

**Frontend can't connect?**
- Check VITE_API_URL is correct
- Verify CORS settings
- Check browser console

**Database errors?**
- Run migration script
- Check Neon dashboard for connection issues

## Free Tier Limits

- Vercel: 100GB bandwidth/month
- Neon: 3GB storage
- Upstash: 10,000 commands/day

Perfect for testing and small projects!

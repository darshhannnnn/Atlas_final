# 🚀 ATLAS Vercel Deployment Guide

## Quick Start

This guide will walk you through deploying ATLAS to Vercel step-by-step.

**Estimated Time**: 30-60 minutes  
**Cost**: $20-50/month (Vercel Pro + databases)

---

## 📋 Prerequisites

- [x] Vercel account (sign up at https://vercel.com)
- [x] GitHub account with repository connected
- [x] Mistral AI API key (https://console.mistral.ai/)
- [ ] Upstash Redis account (https://upstash.com) - Free tier available
- [ ] Pinecone account (https://www.pinecone.io/) - Free tier available

---

## 🎯 Step 1: Project Cleanup

First, we need to clean up duplicate folders in your project.

### 1.1 Delete Duplicate Folders

```bash
# Navigate to your project
cd "C:\Users\Meet Jain\Atlas_final"

# Delete duplicate app folder (keep backend/app)
Remove-Item -Recurse -Force .\app

# Verify backend/app still exists
Test-Path .\backend\app
# Should return: True
```

### 1.2 Verify Structure

Your project should now look like:
```
Atlas_final/
├── api/
│   └── index.py          ✅ Updated for Vercel
├── backend/
│   ├── app/              ✅ Main application code
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── vercel.json           ✅ New - Vercel config
├── requirements.txt      ✅ New - Root requirements
└── .env.example          ✅ New - Environment template
```

---

## 🎯 Step 2: Install Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login
```

Follow the prompts to authenticate with your Vercel account.

---

## 🎯 Step 3: Setup Vercel Postgres

### 3.1 Create Database

```bash
# Create Vercel Postgres database
vercel postgres create atlas-db
```

Select your project when prompted.

### 3.2 Link Database to Project

```bash
# Link database to your project
vercel postgres link
```

This automatically adds `DATABASE_URL` to your environment variables.

### 3.3 Verify Connection String

```bash
# View environment variables
vercel env ls
```

You should see `DATABASE_URL` listed.

---

## 🎯 Step 4: Setup Upstash Redis

### 4.1 Create Redis Database

1. Go to https://upstash.com
2. Sign up / Log in
3. Click "Create Database"
4. Choose:
   - **Name**: atlas-redis
   - **Type**: Regional
   - **Region**: Choose closest to your Vercel region (e.g., us-east-1)
   - **TLS**: Enabled

### 4.2 Get Connection String

1. Click on your database
2. Copy the **REST URL** or **Redis URL**
3. Format: `redis://default:PASSWORD@HOST:PORT`

### 4.3 Add to Vercel

```bash
# Add Redis URL to Vercel
vercel env add REDIS_URL
```

Paste your Upstash Redis URL when prompted.

Select all environments (Production, Preview, Development).

---

## 🎯 Step 5: Setup Pinecone (Vector Database)

### 5.1 Create Pinecone Account

1. Go to https://www.pinecone.io/
2. Sign up for free tier
3. Create a new project

### 5.2 Create Index

1. Click "Create Index"
2. Settings:
   - **Name**: atlas-knowledge
   - **Dimensions**: 384 (for all-MiniLM-L6-v2 embeddings)
   - **Metric**: cosine
   - **Cloud**: AWS
   - **Region**: us-east-1

### 5.3 Get API Key

1. Go to "API Keys" section
2. Copy your API key

### 5.4 Add to Vercel

```bash
# Add Pinecone API key
vercel env add PINECONE_API_KEY

# Add Pinecone environment
vercel env add PINECONE_ENVIRONMENT
# Enter: us-east-1 (or your chosen region)

# Add Pinecone index name
vercel env add PINECONE_INDEX_NAME
# Enter: atlas-knowledge
```

---

## 🎯 Step 6: Setup Vercel Blob Storage

Vercel Blob is automatically available with your Vercel account.

```bash
# Enable Blob storage (automatic with Vercel)
# The BLOB_READ_WRITE_TOKEN is automatically set by Vercel
```

No manual setup required! Vercel will automatically provide the token.

---

## 🎯 Step 7: Configure Environment Variables

### 7.1 Add Mistral AI API Key

```bash
vercel env add MISTRAL_API_KEY
```

Paste your Mistral AI API key when prompted.

### 7.2 Add Secret Key

```bash
# Generate a secure secret key
# On Windows PowerShell:
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)

# Copy the output and add to Vercel:
vercel env add SECRET_KEY
```

### 7.3 Verify All Environment Variables

```bash
vercel env ls
```

You should see:
- ✅ DATABASE_URL
- ✅ REDIS_URL
- ✅ SECRET_KEY
- ✅ MISTRAL_API_KEY
- ✅ PINECONE_API_KEY
- ✅ PINECONE_ENVIRONMENT
- ✅ PINECONE_INDEX_NAME
- ✅ BLOB_READ_WRITE_TOKEN (auto-set by Vercel)

---

## 🎯 Step 8: Update Frontend Configuration

The frontend is already configured! Verify:

```bash
# Check frontend/.env.production
cat frontend/.env.production
```

Should contain:
```env
VITE_API_URL=/api/v1
```

---

## 🎯 Step 9: Link GitHub Repository

### 9.1 Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for Vercel deployment"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/atlas-final.git

# Push
git push -u origin main
```

### 9.2 Connect to Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the configuration from `vercel.json`

---

## 🎯 Step 10: Deploy!

### 10.1 Deploy via CLI

```bash
# Deploy to preview
vercel

# Or deploy to production
vercel --prod
```

### 10.2 Deploy via GitHub

Simply push to your main branch:

```bash
git push origin main
```

Vercel will automatically deploy!

---

## 🎯 Step 11: Initialize Database

After first deployment, you need to create database tables.

### 11.1 Run Migration Script

Create a temporary script to initialize the database:

```bash
# Create init_db.py in your project root
```

```python
# init_db.py
import os
os.environ['DATABASE_URL'] = 'YOUR_VERCEL_POSTGRES_URL'

from backend.app.database import Base, engine

# Create all tables
Base.metadata.create_all(bind=engine)
print("✅ Database tables created!")
```

Run locally:
```bash
python init_db.py
```

**OR** use Vercel's SQL editor:

1. Go to Vercel Dashboard → Storage → Your Postgres DB
2. Click "Query" tab
3. Run the SQL schema manually

---

## 🎯 Step 12: Test Your Deployment

### 12.1 Check Health Endpoint

```bash
# Get your deployment URL
vercel ls

# Test health endpoint
curl https://your-app.vercel.app/health
```

Should return:
```json
{"status": "healthy"}
```

### 12.2 Test Frontend

Open your browser:
```
https://your-app.vercel.app
```

### 12.3 Test API

```bash
# Test root endpoint
curl https://your-app.vercel.app/api/v1/

# Should return API info
```

---

## 🎯 Step 13: Configure Custom Domain (Optional)

### 13.1 Add Domain

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### 13.2 Update CORS

If using custom domain, update `backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-domain.com",
        "https://www.your-domain.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🔧 Troubleshooting

### Issue: "Module not found" error

**Solution**: Check that `api/index.py` has correct path:
```python
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
```

### Issue: Database connection timeout

**Solution**: Check connection pooling in `backend/app/database.py`:
```python
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10
)
```

### Issue: Redis connection failed

**Solution**: Verify `REDIS_URL` format:
```
redis://default:PASSWORD@HOST:PORT
```

### Issue: File upload fails

**Solution**: Ensure `BLOB_READ_WRITE_TOKEN` is set (should be automatic).

### Issue: Vector search not working

**Solution**: 
1. Verify Pinecone API key
2. Check index name matches
3. Ensure embeddings are generated (see vector_service_pinecone.py)

### Issue: Cold start timeout

**Solution**: 
1. Upgrade to Vercel Pro (60s timeout)
2. Optimize imports (lazy loading)
3. Reduce LLM token limits

---

## 📊 Monitoring & Logs

### View Logs

```bash
# Real-time logs
vercel logs --follow

# Or in dashboard
# Vercel Dashboard → Your Project → Logs
```

### Monitor Performance

1. Go to Vercel Dashboard → Your Project → Analytics
2. Check:
   - Response times
   - Error rates
   - Cold start frequency

---

## 💰 Cost Breakdown

### Vercel Pro Plan: $20/month
- Serverless functions
- Automatic scaling
- 60s function timeout
- 100GB bandwidth

### Vercel Postgres: ~$10-30/month
- Based on storage and compute
- Starts at $10/month

### Upstash Redis: Free - $10/month
- Free tier: 10K commands/day
- Pro: $10/month for 100K commands/day

### Pinecone: Free - $70/month
- Free tier: 1 index, 100K vectors
- Starter: $70/month for 5M vectors

### Vercel Blob: ~$0-5/month
- $0.15/GB stored
- $0.30/GB bandwidth
- First 1GB free

**Total Estimated Cost**: $30-135/month

---

## 🎉 Success Checklist

- [ ] Project cleaned up (duplicates removed)
- [ ] Vercel CLI installed and authenticated
- [ ] Vercel Postgres created and linked
- [ ] Upstash Redis created and configured
- [ ] Pinecone index created and configured
- [ ] All environment variables set
- [ ] GitHub repository connected
- [ ] Deployed to Vercel
- [ ] Database tables created
- [ ] Health endpoint responding
- [ ] Frontend loading correctly
- [ ] API endpoints working
- [ ] File uploads working
- [ ] Chat functionality working

---

## 🚀 Next Steps

1. **Setup CI/CD**: Automatic deployments on git push (already configured!)
2. **Add monitoring**: Setup error tracking (Sentry, LogRocket)
3. **Optimize performance**: Add caching, optimize queries
4. **Add tests**: Write integration tests
5. **Custom domain**: Configure your domain
6. **Backup strategy**: Setup database backups

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Postgres Guide](https://vercel.com/docs/storage/vercel-postgres)
- [Upstash Redis Docs](https://docs.upstash.com/redis)
- [Pinecone Documentation](https://docs.pinecone.io/)
- [FastAPI on Vercel](https://vercel.com/guides/deploying-fastapi-with-vercel)

---

## 🆘 Need Help?

If you encounter issues:

1. Check Vercel logs: `vercel logs --follow`
2. Check environment variables: `vercel env ls`
3. Review error messages in Vercel Dashboard
4. Consult the troubleshooting section above

---

## ✅ Deployment Complete!

Your ATLAS multi-agent AI system is now running on Vercel! 🎉

Access your app at: `https://your-app.vercel.app`

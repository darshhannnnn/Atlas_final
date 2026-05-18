# 🚀 ATLAS Deployment - Complete Guide

## 📖 Overview

This repository contains everything you need to deploy ATLAS (Autonomous Task-oriented Learning & Agentic System) to production.

**ATLAS** is a multi-agent AI system with:
- 🤖 6 specialized agents (Search, Outliner, Writer, Verifier, Summarizer, Update)
- 💬 Real-time chat interface
- 📄 Document processing (PDF, DOCX, TXT)
- 🧠 Vector-based knowledge retrieval
- 🔐 User authentication

---

## ⚡ Quick Start (Choose Your Path)

### 🏃 Fastest: Railway (15 minutes, $5-20/month)
```bash
npm i -g @railway/cli && railway login && railway init
```
[→ Full Railway Guide](ALTERNATIVE_DEPLOYMENTS.md#option-1-railwayapp)

### 🎯 Serverless: Vercel (1 hour, $30-135/month)
```bash
.\cleanup_project.ps1
npm i -g vercel && vercel login && vercel --prod
```
[→ Full Vercel Guide](DEPLOYMENT_GUIDE.md)

### 🆓 Free Tier: Render (30 minutes, $0-31/month)
Go to https://render.com and connect your GitHub repo.  
[→ Full Render Guide](ALTERNATIVE_DEPLOYMENTS.md#option-2-rendercom)

---

## 📚 Documentation Index

| Document | Description | When to Read |
|----------|-------------|--------------|
| **[QUICK_START.md](QUICK_START.md)** | Fast deployment guide | Start here! |
| **[DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)** | What's been done & what you need to do | Read second |
| **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** | Detailed Vercel deployment | If choosing Vercel |
| **[ALTERNATIVE_DEPLOYMENTS.md](ALTERNATIVE_DEPLOYMENTS.md)** | Railway, Render, Fly.io, etc. | If not using Vercel |
| **[VERCEL_MIGRATION_PLAN.md](VERCEL_MIGRATION_PLAN.md)** | Technical migration details | For deep dive |

---

## 🎯 Which Platform Should You Choose?

### Railway ⭐ Recommended
**Best for**: Quick deployment, keeping Docker setup
- ✅ 15-minute deployment
- ✅ No code changes needed
- ✅ $5-20/month (includes database, Redis)
- ✅ Docker support
- ❌ Not serverless

### Vercel
**Best for**: Serverless, auto-scaling, modern architecture
- ✅ Auto-scaling
- ✅ Serverless functions
- ✅ Global CDN
- ❌ More expensive ($30-135/month)
- ❌ Requires code changes (already done ✅)

### Render
**Best for**: Free tier testing, then affordable production
- ✅ Free tier available
- ✅ Docker support
- ✅ Simple deployment
- ❌ Free tier spins down (slow cold starts)
- ❌ $24-31/month for production

---

## 📋 What's Included

### ✅ Code Updates (Already Done)
- Updated configuration for serverless deployment
- Vercel Blob Storage support for file uploads
- Pinecone support for vector database
- Optimized database connection pooling
- Environment variable configuration

### ✅ New Files Created
- `vercel.json` - Vercel deployment config
- `requirements.txt` - Python dependencies
- `.env.example` - Environment template
- `cleanup_project.ps1` - Cleanup script
- Complete deployment documentation

### ✅ Services Configured
- FastAPI backend → Vercel serverless functions
- React frontend → Vercel static hosting
- PostgreSQL → Vercel Postgres / Railway / Render
- Redis → Upstash / Railway / Render
- File storage → Vercel Blob / Local
- Vector DB → Pinecone / ChromaDB

---

## 🚀 Deployment Steps (High Level)

### 1. Prepare Project (5 minutes)
```powershell
# Clean up duplicate folders
.\cleanup_project.ps1
```

### 2. Choose Platform (1 minute)
- Railway (easiest)
- Vercel (serverless)
- Render (free tier)

### 3. Setup Services (10-30 minutes)
- Create database (PostgreSQL)
- Create cache (Redis)
- Get API keys (Mistral AI)
- Optional: Vector DB (Pinecone)

### 4. Deploy (5-15 minutes)
- Connect GitHub repository
- Set environment variables
- Deploy application

### 5. Test (5 minutes)
- Test health endpoint
- Test frontend
- Test chat functionality

**Total Time**: 25-60 minutes depending on platform

---

## 🔑 Required API Keys & Services

### Essential (All Platforms):
1. **Mistral AI API Key**
   - Get from: https://console.mistral.ai/
   - Used for: LLM responses
   - Cost: Pay-per-use (~$0.001-0.01 per request)

2. **PostgreSQL Database**
   - Provided by: Vercel / Railway / Render
   - Used for: User data, conversations
   - Cost: $5-30/month

3. **Redis Cache**
   - Provided by: Upstash / Railway / Render
   - Used for: Session caching
   - Cost: Free tier or $5-10/month

### Optional (Vercel Only):
4. **Pinecone API Key**
   - Get from: https://www.pinecone.io/
   - Used for: Vector search
   - Cost: Free tier (100K vectors) or $70/month

---

## 💰 Cost Breakdown

### Railway (Recommended)
- **Total**: $5-20/month
- Includes: Hosting, PostgreSQL, Redis, storage
- Best value for money

### Render
- **Free Tier**: $0/month (limited, spins down)
- **Production**: $24-31/month
- Includes: Hosting, PostgreSQL, Redis

### Vercel
- **Total**: $30-135/month
- Breakdown:
  - Vercel Pro: $20/month
  - Vercel Postgres: $10-30/month
  - Upstash Redis: Free-$10/month
  - Pinecone: Free-$70/month
  - Vercel Blob: $0-5/month

---

## 🏗️ Architecture

### Current (Docker)
```
Docker Compose
├── Backend (FastAPI)
├── Frontend (React)
├── PostgreSQL
├── Redis
└── ChromaDB (local files)
```

### After Migration (Vercel)
```
Vercel
├── Serverless Functions (FastAPI)
├── Static Site (React)
├── Vercel Postgres
├── Upstash Redis
├── Vercel Blob (files)
└── Pinecone (vectors)
```

### After Migration (Railway/Render)
```
Railway/Render
├── Docker Container (FastAPI + React)
├── Managed PostgreSQL
├── Managed Redis
└── Persistent Volume (ChromaDB)
```

---

## 📁 Project Structure

```
Atlas_final/
├── 📄 README_DEPLOYMENT.md          ← You are here
├── 📄 QUICK_START.md                ← Start here
├── 📄 DEPLOYMENT_SUMMARY.md         ← What's been done
├── 📄 DEPLOYMENT_GUIDE.md           ← Vercel guide
├── 📄 ALTERNATIVE_DEPLOYMENTS.md    ← Other platforms
├── 📄 VERCEL_MIGRATION_PLAN.md      ← Technical details
│
├── 🔧 vercel.json                   ← Vercel config
├── 🔧 requirements.txt              ← Python deps
├── 🔧 .env.example                  ← Env template
├── 🔧 cleanup_project.ps1           ← Cleanup script
│
├── 📁 api/
│   └── index.py                     ← Vercel entry point
│
├── 📁 backend/
│   ├── main.py                      ← FastAPI app
│   └── app/
│       ├── agents/                  ← AI agents
│       ├── api/                     ← API routes
│       ├── core/                    ← Config
│       ├── models/                  ← Database models
│       ├── orchestrator/            ← Agent orchestrator
│       ├── schemas/                 ← Pydantic schemas
│       └── services/                ← Business logic
│
└── 📁 frontend/
    ├── src/                         ← React app
    └── package.json
```

---

## ✅ Pre-Deployment Checklist

- [ ] Read [QUICK_START.md](QUICK_START.md)
- [ ] Run `cleanup_project.ps1`
- [ ] Get Mistral AI API key
- [ ] Generate SECRET_KEY (32+ characters)
- [ ] Choose deployment platform
- [ ] Push code to GitHub
- [ ] Review cost estimates

---

## 🎯 Recommended Deployment Path

### For Most Users:
1. **Start with Railway**
   - Fastest deployment (15 minutes)
   - Lowest cost ($5-20/month)
   - No code changes needed
   - Keep Docker setup

2. **Migrate to Vercel Later** (if needed)
   - When you need auto-scaling
   - When you have high traffic
   - When you want serverless benefits

### Why This Approach?
- ✅ Get to production quickly
- ✅ Test with real users
- ✅ Low initial cost
- ✅ Easy to migrate later
- ✅ Learn what you actually need

---

## 🔧 Environment Variables

### Required for All Platforms:
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://default:pass@host:6379
SECRET_KEY=your-secret-key-min-32-chars
MISTRAL_API_KEY=your-mistral-api-key
```

### Additional for Vercel:
```env
BLOB_READ_WRITE_TOKEN=auto-set-by-vercel
PINECONE_API_KEY=your-pinecone-key
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX_NAME=atlas-knowledge
```

See [.env.example](.env.example) for complete list.

---

## 🧪 Testing After Deployment

### 1. Health Check
```bash
curl https://your-app.com/health
# Expected: {"status": "healthy"}
```

### 2. API Test
```bash
curl https://your-app.com/api/v1/
# Expected: API info
```

### 3. Frontend Test
Open browser: `https://your-app.com`

### 4. Full Test
1. Create user account
2. Upload a document
3. Start a chat
4. Verify agent responses

---

## 🐛 Troubleshooting

### Common Issues:

**"Module not found" error**
- Check `api/index.py` path configuration
- Verify `sys.path` includes backend directory

**Database connection timeout**
- Verify `DATABASE_URL` format
- Check connection pooling settings

**Redis connection failed**
- Verify `REDIS_URL` format
- Check credentials and hostname

**File upload fails**
- Vercel: Check `BLOB_READ_WRITE_TOKEN`
- Others: Check file permissions

**Vector search not working**
- Verify Pinecone API key
- Check index name matches
- Ensure embeddings are generated

See full troubleshooting in [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md#troubleshooting)

---

## 📊 Performance Optimization

### After Deployment:
1. **Monitor cold starts** (Vercel)
   - Optimize imports
   - Lazy load heavy dependencies
   - Consider Pro plan for 60s timeout

2. **Database optimization**
   - Add indexes for frequent queries
   - Optimize connection pooling
   - Monitor query performance

3. **Caching strategy**
   - Cache LLM responses
   - Cache vector search results
   - Use Redis effectively

4. **Cost optimization**
   - Monitor usage
   - Optimize LLM token usage
   - Review database queries

---

## 🔒 Security Checklist

- [ ] Use strong SECRET_KEY (32+ chars)
- [ ] Enable HTTPS (automatic on all platforms)
- [ ] Set secure CORS origins
- [ ] Rotate API keys regularly
- [ ] Use environment variables (never commit secrets)
- [ ] Enable database SSL
- [ ] Monitor access logs
- [ ] Set up rate limiting

---

## 📈 Scaling Considerations

### Railway/Render:
- Vertical scaling (increase RAM/CPU)
- Horizontal scaling (multiple instances)
- Load balancer (higher tiers)

### Vercel:
- Automatic scaling (serverless)
- No configuration needed
- Pay per request

---

## 🎓 Learning Resources

### Platform Documentation:
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app/)
- [Render Docs](https://render.com/docs)

### Technology Documentation:
- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [Redis](https://redis.io/docs/)

---

## 🤝 Contributing

If you improve the deployment process:
1. Document your changes
2. Update relevant guides
3. Test thoroughly
4. Share your learnings

---

## 📝 License

[Your License Here]

---

## 🎉 Ready to Deploy?

1. **Read**: [QUICK_START.md](QUICK_START.md)
2. **Clean**: Run `cleanup_project.ps1`
3. **Choose**: Your platform
4. **Deploy**: Follow the guide
5. **Test**: Verify everything works
6. **Celebrate**: You're live! 🚀

---

## 📞 Support

Need help? Check:
1. [QUICK_START.md](QUICK_START.md) - Quick deployment guide
2. [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Detailed Vercel guide
3. [ALTERNATIVE_DEPLOYMENTS.md](ALTERNATIVE_DEPLOYMENTS.md) - Other platforms
4. Platform-specific documentation
5. Deployment logs and error messages

---

**Last Updated**: 2024
**Status**: ✅ Ready for Deployment
**Estimated Deployment Time**: 15-60 minutes
**Recommended Platform**: Railway (for quick start)

Good luck with your deployment! 🚀

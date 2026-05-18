# ATLAS Vercel Migration Plan

## 🎯 Overview
Migrate ATLAS (multi-agent AI system) from Docker Compose to Vercel serverless deployment.

## 📊 Current Architecture Analysis

### Backend (FastAPI)
- **Agents**: Search, Outliner, Writer, Verifier, Summarizer, Update
- **Database**: PostgreSQL (users, conversations, messages)
- **Cache**: Redis
- **Vector DB**: ChromaDB (local file-based)
- **File Storage**: Local filesystem (`./uploads`)
- **Entry Point**: `backend/main.py`

### Frontend (React + Vite)
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Build Output**: `dist/`

### Issues Identified
1. ❌ **Duplicate folders**: `app/` and `backend/app/` (same content)
2. ❌ **Local file storage**: Not compatible with serverless
3. ❌ **ChromaDB**: File-based, needs migration
4. ❌ **Redis**: Hardcoded Docker hostname
5. ❌ **PostgreSQL**: Docker-based

---

## 🚀 Migration Strategy

### Phase 1: Project Cleanup & Restructure
**Goal**: Remove duplicates, organize for Vercel

#### Actions:
1. **Delete duplicate `app/` folder** (keep `backend/app/`)
2. **Delete duplicate `api/index.py`** (keep `backend/api/index.py`)
3. **Move backend to root** for cleaner structure
4. **Create Vercel configuration files**

#### New Structure:
```
Atlas_final/
├── api/                    # Vercel serverless functions
│   └── index.py           # Entry point (imports from app/)
├── app/                   # Backend application code
│   ├── agents/
│   ├── api/
│   ├── core/
│   ├── models/
│   ├── orchestrator/
│   ├── schemas/
│   └── services/
├── frontend/              # React app
├── vercel.json           # Vercel configuration
├── requirements.txt      # Python dependencies
└── .env.example          # Environment template
```

---

### Phase 2: Database Migration

#### PostgreSQL → Vercel Postgres
**Steps**:
1. Create Vercel Postgres database in dashboard
2. Update `DATABASE_URL` environment variable
3. Run migrations on first deployment

**Code Changes**:
- ✅ `app/database.py`: Already uses `settings.DATABASE_URL`
- ✅ `app/core/config.py`: Already configurable via env vars

#### Redis → Vercel KV (or Upstash Redis)
**Option A: Vercel KV** (Recommended - Native integration)
```python
# Install: pip install vercel-kv
from vercel_kv import kv

# Usage:
await kv.set("key", "value")
value = await kv.get("key")
```

**Option B: Upstash Redis** (More Redis-compatible)
```python
# Keep existing redis library
# Just update REDIS_URL to Upstash endpoint
```

**Recommendation**: Use **Upstash Redis** for minimal code changes.

---

### Phase 3: Vector Database Migration

#### ChromaDB → Serverless Alternative

**Option A: Supabase Vector (pgvector)** ⭐ Recommended
- PostgreSQL extension (works with Vercel Postgres)
- No additional service needed
- Cost-effective

**Option B: Pinecone**
- Fully managed vector DB
- Generous free tier
- Easy integration

**Option C: Keep ChromaDB with Vercel Blob Storage**
- Store ChromaDB files in Vercel Blob
- Load on cold start (slower)

**Recommendation**: **Supabase Vector** for simplicity and cost.

---

### Phase 4: File Storage Migration

#### Local Filesystem → Vercel Blob Storage

**Changes Required**:
```python
# Install: pip install vercel-blob
from vercel_blob import put, get

# Upload file
blob = await put(filename, file_content, {
    'access': 'public',
    'contentType': file.content_type
})

# Get file URL
url = blob['url']
```

**Update `app/services/file_service.py`**:
- Replace `os.makedirs()` and file writes
- Use Vercel Blob for storage
- Return blob URLs instead of file paths

---

### Phase 5: Serverless Function Adaptation

#### Key Changes for Vercel Serverless

**1. Database Connection Pooling**
```python
# Update app/database.py
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,          # Limit connections
    max_overflow=10,
    pool_recycle=3600     # Recycle connections
)
```

**2. Cold Start Optimization**
- Lazy load heavy dependencies (ChromaDB, LLM clients)
- Cache initialized services
- Use smaller LLM models (already using `mistral-small-latest` ✅)

**3. Timeout Handling**
- Vercel serverless functions: 10s (Hobby), 60s (Pro), 300s (Enterprise)
- Current `MAX_RESPONSE_TIME: 60` ✅ (fits Pro tier)
- Consider streaming responses for long operations

**4. Environment Variables**
- All secrets in Vercel dashboard
- No `.env` files in deployment

---

### Phase 6: Frontend Deployment

#### Vercel Configuration
Frontend builds automatically with Vite.

**Update `frontend/.env.production`**:
```env
VITE_API_URL=/api
```

**Why `/api`?** Vercel routes `/api/*` to serverless functions automatically.

---

## 📝 Step-by-Step Implementation

### Step 1: Cleanup Project Structure
```bash
# Delete duplicates
rm -rf app/
rm api/index.py

# Move backend files to root
mv backend/app ./app
mv backend/requirements.txt ./requirements.txt
mv backend/.env.example ./.env.example
```

### Step 2: Create Vercel Configuration
Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "frontend/dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "api/index.py"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ],
  "env": {
    "PYTHON_VERSION": "3.11"
  }
}
```

### Step 3: Update API Entry Point
Create `api/index.py`:
```python
import sys
import os

# Add app directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.main import app

# Vercel handler
handler = app
```

### Step 4: Update Database Configuration
Update `app/database.py`:
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import redis
import os

from app.core.config import settings

# Optimized for serverless
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    pool_recycle=3600,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Redis client (lazy initialization)
_redis_client = None

def get_redis():
    global _redis_client
    if _redis_client is None:
        try:
            _redis_client = redis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5
            )
        except Exception as e:
            print(f"Redis connection failed: {e}")
            _redis_client = None
    return _redis_client

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### Step 5: Update Configuration
Update `app/core/config.py`:
```python
from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Database (Vercel Postgres)
    DATABASE_URL: str
    
    # Redis (Upstash Redis)
    REDIS_URL: str
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    
    # LLM
    MISTRAL_API_KEY: str
    LLM_MODEL: str = "mistral-small-latest"
    LLM_TEMPERATURE: float = 0.7
    LLM_MAX_TOKENS: int = 2000
    
    # File handling
    MAX_FILE_SIZE: int = 100 * 1024 * 1024
    ALLOWED_FILE_TYPES: list = [".pdf", ".docx", ".txt"]
    MAX_UPLOAD_SIZE_MB: int = 100
    
    # Vercel Blob Storage
    BLOB_READ_WRITE_TOKEN: Optional[str] = None
    
    # Vector DB (if using Pinecone)
    PINECONE_API_KEY: Optional[str] = None
    PINECONE_ENVIRONMENT: Optional[str] = None
    PINECONE_INDEX_NAME: str = "atlas-knowledge"
    
    # Performance
    MAX_RESPONSE_TIME: int = 60
    MAX_TOKENS: int = 2000
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "allow"

settings = Settings()
```

### Step 6: Update File Service for Vercel Blob
Update `app/services/file_service.py`:
```python
import os
from typing import Dict, Any
from fastapi import UploadFile
import PyPDF2
from docx import Document
import logging
from io import BytesIO

# Vercel Blob imports
try:
    from vercel_blob import put, delete
    BLOB_AVAILABLE = True
except ImportError:
    BLOB_AVAILABLE = False

logger = logging.getLogger("atlas.file_service")

class FileService:
    def __init__(self):
        self.use_blob = BLOB_AVAILABLE and os.getenv("BLOB_READ_WRITE_TOKEN")
        if not self.use_blob:
            self.upload_dir = "uploads"
            os.makedirs(self.upload_dir, exist_ok=True)
            logger.warning("⚠️ Vercel Blob not available, using local storage")

    async def process_file(self, file: UploadFile) -> Dict[str, Any]:
        content = await file.read()
        
        try:
            # Extract text based on file type
            file_type = file.filename.split('.')[-1].lower()
            
            if file_type == "pdf":
                text_content = self._extract_pdf(BytesIO(content))
            elif file_type in ["docx", "doc"]:
                text_content = self._extract_docx(BytesIO(content))
            elif file_type == "txt":
                text_content = content.decode('utf-8')
            else:
                raise ValueError(f"Unsupported file type: {file_type}")
            
            if not text_content or len(text_content.strip()) < 10:
                raise ValueError(f"Could not extract text from {file.filename}")
            
            # Store file
            if self.use_blob:
                blob = await put(file.filename, content, {
                    'access': 'public',
                    'contentType': file.content_type
                })
                file_url = blob['url']
            else:
                file_path = os.path.join(self.upload_dir, file.filename)
                with open(file_path, "wb") as f:
                    f.write(content)
                file_url = file_path
            
            logger.info(f"✅ Processed {file.filename}: {len(text_content)} chars")
            
            return {
                "filename": file.filename,
                "file_type": file_type,
                "content": text_content,
                "file_url": file_url,
                "size": len(content),
                "text_length": len(text_content)
            }
        except Exception as e:
            logger.error(f"❌ File processing failed: {e}")
            raise Exception(f"Failed to process {file.filename}: {str(e)}")

    def _extract_pdf(self, file_obj) -> str:
        try:
            text = ""
            pdf_reader = PyPDF2.PdfReader(file_obj)
            
            for page in pdf_reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            
            if not text.strip():
                raise ValueError("No text extracted from PDF")
            
            return text
        except Exception as e:
            raise ValueError(f"Could not read PDF: {str(e)}")

    def _extract_docx(self, file_obj) -> str:
        try:
            doc = Document(file_obj)
            text = "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
            
            if not text.strip():
                raise ValueError("No text found in document")
            
            return text
        except Exception as e:
            raise ValueError(f"Could not read DOCX: {str(e)}")
```

### Step 7: Update Vector Service (Pinecone Example)
Create `app/services/vector_service_pinecone.py`:
```python
import logging
from typing import List, Dict, Any
import os

try:
    from pinecone import Pinecone, ServerlessSpec
    PINECONE_AVAILABLE = True
except ImportError:
    PINECONE_AVAILABLE = False

logger = logging.getLogger("atlas.vector_service")

class VectorService:
    def __init__(self):
        if not PINECONE_AVAILABLE:
            logger.error("❌ Pinecone not installed")
            self.index = None
            return
        
        api_key = os.getenv("PINECONE_API_KEY")
        index_name = os.getenv("PINECONE_INDEX_NAME", "atlas-knowledge")
        
        if not api_key:
            logger.error("❌ PINECONE_API_KEY not set")
            self.index = None
            return
        
        try:
            pc = Pinecone(api_key=api_key)
            
            # Create index if doesn't exist
            if index_name not in pc.list_indexes().names():
                pc.create_index(
                    name=index_name,
                    dimension=1536,  # OpenAI embedding dimension
                    metric="cosine",
                    spec=ServerlessSpec(cloud="aws", region="us-east-1")
                )
            
            self.index = pc.Index(index_name)
            logger.info("✅ Pinecone initialized")
        except Exception as e:
            logger.error(f"❌ Pinecone initialization failed: {e}")
            self.index = None

    def add_documents(self, documents: List[str], metadatas: List[Dict] = None, ids: List[str] = None):
        if not self.index:
            return
        
        # Implementation depends on your embedding strategy
        # You'll need to generate embeddings first
        pass

    def query(self, query_texts: List[str], n_results: int = 5) -> Dict[str, Any]:
        if not self.index:
            return {"documents": [], "metadatas": [], "distances": []}
        
        # Implementation depends on your embedding strategy
        pass
```

### Step 8: Update Requirements
Update `requirements.txt`:
```txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
psycopg2-binary==2.9.9
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
bcrypt==4.0.1
python-multipart==0.0.6
pydantic>=2.8.2
pydantic-settings==2.1.0
email-validator==2.1.0
mistralai>=1.0.0
PyPDF2==3.0.1
python-docx==1.1.0
redis==5.0.1
numpy<2.0.0

# Vercel-specific
vercel-blob>=0.1.0
pinecone-client>=3.0.0  # or chromadb if keeping it
```

### Step 9: Update Frontend Environment
Update `frontend/.env.production`:
```env
VITE_API_URL=/api/v1
```

### Step 10: Create Environment Template
Create `.env.example`:
```env
# Database (Vercel Postgres)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Redis (Upstash Redis)
REDIS_URL=redis://default:password@host:6379

# Security
SECRET_KEY=your-secret-key-min-32-chars

# LLM
MISTRAL_API_KEY=your-mistral-api-key

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=your-blob-token

# Vector DB (Pinecone)
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX_NAME=atlas-knowledge
```

---

## 🚢 Deployment Steps

### 1. Setup Vercel Project
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
cd Atlas_final
vercel link
```

### 2. Setup Vercel Postgres
```bash
# Create database
vercel postgres create atlas-db

# Link to project
vercel postgres link

# Get connection string (automatically added to env vars)
```

### 3. Setup Upstash Redis
1. Go to https://upstash.com
2. Create Redis database
3. Copy `REDIS_URL`
4. Add to Vercel environment variables

### 4. Setup Pinecone (Optional)
1. Go to https://pinecone.io
2. Create index: `atlas-knowledge`
3. Copy API key
4. Add to Vercel environment variables

### 5. Setup Vercel Blob
```bash
# Blob storage is automatic with Vercel
# Token is auto-generated, access via BLOB_READ_WRITE_TOKEN
```

### 6. Configure Environment Variables
```bash
# Add all environment variables
vercel env add SECRET_KEY
vercel env add MISTRAL_API_KEY
vercel env add PINECONE_API_KEY
# ... etc
```

### 7. Deploy
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### 8. Run Database Migrations
After first deployment:
```bash
# SSH into Vercel function (or use migration script)
# Run: python -c "from app.database import Base, engine; Base.metadata.create_all(bind=engine)"
```

---

## ⚠️ Important Considerations

### 1. Serverless Limitations
- **Cold starts**: First request may be slow (3-5s)
- **Execution time**: 10s (Hobby), 60s (Pro), 300s (Enterprise)
- **Memory**: 1GB (Hobby), 3GB (Pro)
- **Concurrent executions**: Limited by plan

### 2. Cost Estimates (Vercel Pro Plan)
- **Vercel Pro**: $20/month
- **Vercel Postgres**: ~$10-50/month (based on usage)
- **Upstash Redis**: Free tier (10K commands/day) or $10/month
- **Pinecone**: Free tier (1 index, 100K vectors) or $70/month
- **Vercel Blob**: $0.15/GB stored, $0.30/GB bandwidth

**Total**: ~$30-150/month depending on usage

### 3. Alternatives to Consider
- **Railway.app**: Supports Docker, easier migration, ~$5-20/month
- **Render.com**: Docker support, free tier available
- **Fly.io**: Docker support, generous free tier

### 4. Recommended Approach
If budget is tight or you want minimal code changes:
1. Deploy to **Railway** or **Render** (keep Docker setup)
2. Use managed PostgreSQL and Redis from same provider
3. Keep ChromaDB with persistent volumes

If you want full serverless:
1. Follow this Vercel migration plan
2. Budget for Pro plan ($20/month minimum)
3. Use Supabase for PostgreSQL + Vector (cheaper than separate services)

---

## 📋 Checklist

### Pre-Deployment
- [ ] Delete duplicate `app/` folder
- [ ] Delete duplicate `api/index.py`
- [ ] Create `vercel.json`
- [ ] Update `api/index.py` entry point
- [ ] Update `app/database.py` for connection pooling
- [ ] Update `app/core/config.py` for Vercel env vars
- [ ] Update `app/services/file_service.py` for Vercel Blob
- [ ] Update `app/services/vector_service.py` for Pinecone/Supabase
- [ ] Update `requirements.txt`
- [ ] Update `frontend/.env.production`
- [ ] Create `.env.example`
- [ ] Test locally with Vercel CLI (`vercel dev`)

### Vercel Setup
- [ ] Create Vercel account
- [ ] Install Vercel CLI
- [ ] Link GitHub repository
- [ ] Create Vercel Postgres database
- [ ] Setup Upstash Redis
- [ ] Setup Pinecone/Supabase Vector
- [ ] Configure environment variables
- [ ] Deploy to preview
- [ ] Run database migrations
- [ ] Test all endpoints
- [ ] Deploy to production

### Post-Deployment
- [ ] Test authentication
- [ ] Test file uploads
- [ ] Test chat functionality
- [ ] Test all agents
- [ ] Monitor cold start times
- [ ] Monitor error logs
- [ ] Setup custom domain (optional)
- [ ] Configure CORS for production domain

---

## 🆘 Troubleshooting

### Issue: "Module not found" errors
**Solution**: Ensure `sys.path` is correctly set in `api/index.py`

### Issue: Database connection errors
**Solution**: Check `DATABASE_URL` format and connection pooling settings

### Issue: Cold start timeouts
**Solution**: 
- Reduce dependencies
- Lazy load heavy modules
- Consider upgrading to Pro plan

### Issue: File upload failures
**Solution**: Verify `BLOB_READ_WRITE_TOKEN` is set and Vercel Blob is enabled

### Issue: Vector search not working
**Solution**: Check Pinecone API key and index name

---

## 📚 Resources

- [Vercel Python Documentation](https://vercel.com/docs/functions/serverless-functions/runtimes/python)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Vercel Blob Storage](https://vercel.com/docs/storage/vercel-blob)
- [Upstash Redis](https://upstash.com/docs/redis)
- [Pinecone Documentation](https://docs.pinecone.io/)
- [FastAPI on Vercel](https://vercel.com/guides/deploying-fastapi-with-vercel)

---

## ✅ Next Steps

1. Review this plan
2. Decide on vector DB solution (Pinecone vs Supabase vs keep ChromaDB)
3. Decide on deployment platform (Vercel vs Railway vs Render)
4. Start with Phase 1 (cleanup)
5. Test locally with `vercel dev`
6. Deploy to preview environment
7. Test thoroughly
8. Deploy to production

**Estimated Time**: 4-6 hours for full migration

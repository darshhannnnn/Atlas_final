# Technology Stack Document
# ATLAS – Autonomous Task-oriented Learning & Agentic System

---

## 1. Tech Stack Design Principles

The technology stack for ATLAS is selected based on the following principles:

✅ **Free and open-source**  
✅ **Student-friendly**  
✅ **Cloud deployable**  
✅ **Scalable and modular**  
✅ **Well-supported ecosystem**  
✅ **Suitable for multi-agent and agentic AI systems**  

---

## 2. High-Level Architecture Mapping

| Layer | Responsibility | Technology |
|-------|----------------|------------|
| **Frontend** | Chat-based UI | React + Vite + Tailwind CSS |
| **Backend API** | Request handling & orchestration | FastAPI (Python) |
| **Agent Engine** | Multi-agent execution | Custom Python modules |
| **Memory Layer** | Short-term, long-term, vector memory | Redis + PostgreSQL + ChromaDB |
| **LLM Layer** | Language generation & reasoning | Google Gemini (Free API) |
| **Storage** | File & session storage | Local filesystem + PostgreSQL |
| **Deployment** | Cloud hosting | Docker + Render/Railway |

---

## 3. Programming Language

### Primary Language: **Python 3.11+**

**Reasoning**:
- Industry-standard for AI/ML systems
- Rich ecosystem for LLMs and agents
- Easy to explain in academics
- Excellent library support
- Async/await support for concurrent operations

**Secondary Language**: **JavaScript/TypeScript** (Frontend only)

---

## 4. Backend Framework

### **FastAPI**

**Why FastAPI**:
- ✅ High performance (async support)
- ✅ Clean API design
- ✅ Automatic API documentation (Swagger)
- ✅ Ideal for microservices and agent orchestration
- ✅ Type hints and validation (Pydantic)
- ✅ WebSocket support for real-time updates

**Responsibilities**:
- API endpoints
- Authentication
- Session handling
- Orchestrator execution
- Agent invocation
- File upload handling

**Key Libraries**:
```python
fastapi==0.109.0
uvicorn[standard]==0.27.0
pydantic==2.5.3
python-multipart==0.0.6
```

---

## 5. Frontend Stack

### **Chat-Based Web UI**

**Framework**: **React 18 + Vite**

**Why React + Vite**:
- ✅ Fast development and build times
- ✅ Component-based architecture
- ✅ Large ecosystem
- ✅ Easy to learn and maintain
- ✅ Hot module replacement

**UI Library**: **Tailwind CSS**

**Why Tailwind**:
- ✅ Utility-first CSS
- ✅ Rapid prototyping
- ✅ Consistent design
- ✅ No custom CSS needed

**State Management**: **Zustand**

**Why Zustand**:
- ✅ Lightweight
- ✅ Simple API
- ✅ No boilerplate
- ✅ Perfect for chat state

**Features**:
- ChatGPT-like interface
- Agent selection toggle
- File upload (multiple files)
- Optional agent trace viewer
- Real-time updates
- Responsive design

**Key Libraries**:
```json
{
  "react": "^18.2.0",
  "vite": "^5.0.11",
  "tailwindcss": "^3.4.1",
  "zustand": "^4.4.7",
  "axios": "^1.6.5",
  "react-router-dom": "^6.21.1"
}
```

---

## 6. LLM (Language Model) Layer

### **Google Gemini API (Free Tier)**

**Model**: `gemini-pro`

**Why Google Gemini**:
- ✅ **Free API** with generous limits
- ✅ High-quality text generation
- ✅ Fast response times
- ✅ Good reasoning capabilities
- ✅ No credit card required
- ✅ Academic-friendly

**API Limits (Free Tier)**:
- 60 requests per minute
- 1,500 requests per day
- Sufficient for academic project

**Alternative Options** (if needed):
- LLaMA-based models (via Ollama)
- Mistral / Mixtral family
- Phi / Falcon (lightweight)

**Library**:
```python
google-generativeai==0.3.2
```

**Usage Pattern**:
```python
import google.generativeai as genai

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-pro')
response = model.generate_content(prompt)
```

---

## 7. Agent Framework

### **Custom Agent Architecture (Python-based)**

**Design Choice**:
- ✅ No heavy dependency lock-in
- ✅ Lightweight agent classes
- ✅ Explicit control over:
  - Agent calls
  - Retries
  - Logs
  - Orchestration

**Agent Implementation**:
```python
class BaseAgent:
    def __init__(self, name, llm_client):
        self.name = name
        self.llm = llm_client
    
    async def execute(self, input_data, context):
        # Agent-specific logic
        pass
    
    def log_execution(self, result):
        # Logging logic
        pass
```

**Agents are implemented as**:
- Independent Python modules
- Callable by the Orchestrator
- Stateless by default (state via memory layer)

**Agent Structure**:
```
backend/app/agents/
├── base_agent.py
├── search_agent.py
├── outliner_agent.py
├── writer_agent.py
├── verifier_agent.py
├── summarizer_agent.py
└── update_agent.py
```

---

## 8. Orchestrator Implementation

### **Agentic Orchestrator (Custom)**

**Features**:
- Dynamic planning
- Agent-to-agent calls
- Execution limits (time, hops, retries)
- Failure recovery
- Logging hooks

**Why Custom**:
- ✅ Full transparency
- ✅ Easy to explain in viva
- ✅ Avoids black-box orchestration
- ✅ Complete control over execution flow

**Implementation**:
```python
class AgentOrchestrator:
    def __init__(self, agents, memory, logger):
        self.agents = agents
        self.memory = memory
        self.logger = logger
    
    async def execute_solo(self, agent_name, input_data):
        # Execute single agent
        pass
    
    async def execute_pipeline(self, input_data):
        # Execute full agent pipeline
        pass
    
    def handle_failure(self, agent, error):
        # Retry logic
        pass
```

---

## 9. Memory & Databases

### 9.1 Vector Database

**Technology**: **ChromaDB**

**Why ChromaDB**:
- ✅ Open-source
- ✅ Easy to use
- ✅ Python-native
- ✅ Persistent storage
- ✅ No external dependencies

**Usage**:
- Semantic search
- Knowledge grounding
- Future RAG integration

**Library**:
```python
chromadb==0.4.22
```

**Alternative**: FAISS (if needed for performance)

---

### 9.2 Short-Term Memory

**Technology**: **Redis** (optional) or **In-memory**

**Why Redis**:
- ✅ Fast in-memory storage
- ✅ Session management
- ✅ TTL support (auto-expiry)
- ✅ Pub/sub for real-time updates

**Usage**:
- Session context
- Intermediate agent outputs
- Temporary data

**For Development**: Python dict (in-memory)

**Library**:
```python
redis==5.0.1
```

---

### 9.3 Long-Term Memory

**Technology**: **PostgreSQL**

**Why PostgreSQL**:
- ✅ Robust and reliable
- ✅ ACID compliance
- ✅ JSON support
- ✅ Free and open-source
- ✅ Excellent for production

**Usage**:
- User preferences
- Chat history
- Persistent memory
- User authentication

**ORM**: **SQLAlchemy**

**Libraries**:
```python
sqlalchemy==2.0.25
psycopg2-binary==2.9.9
alembic==1.13.1
```

**Alternative for Development**: SQLite

---

## 10. File Handling & Storage

### Temporary File Storage

**Strategy**:
- Files parsed once
- Stored temporarily
- Auto-deleted after task/session

**Libraries**:

| File Type | Library | Purpose |
|-----------|---------|---------|
| PDF | PyPDF2 | Text extraction |
| DOCX | python-docx | Document parsing |
| TXT | Built-in | Direct reading |

**File Processing Libraries**:
```python
PyPDF2==3.0.1
python-docx==1.1.0
```

**Storage Location**:
- Development: `./uploads/`
- Production: Cloud storage or mounted volume

**File Lifecycle**:
```
Upload → Parse → Store in memory → Process → Delete
```

---

## 11. Authentication

### Simple Authentication System

**Strategy**: **JWT-based authentication**

**Why JWT**:
- ✅ Stateless
- ✅ Scalable
- ✅ Industry-standard
- ✅ Easy to implement

**Features**:
- Email + password
- Session-based login
- Token refresh mechanism

**Purpose**:
- Enable long-term memory
- Secure user isolation
- Track user sessions

**Libraries**:
```python
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
bcrypt==4.1.2
```

---

## 12. Explainability & Logging

### Logging Stack

**Tools**:
- Python `logging` module
- Structured JSON logs
- Database storage for persistence

**Logged Information**:
- Agent execution order
- Agent outputs
- Verification flags
- Retry decisions
- Execution timings
- Error traces

**Logs Support**:
- Debugging
- Academic evaluation
- Viva explanation
- Performance monitoring

**Implementation**:
```python
import logging
import json

logger = logging.getLogger("atlas")
logger.setLevel(logging.INFO)

# Structured logging
logger.info(json.dumps({
    "event": "agent_execution",
    "agent": "search_agent",
    "status": "success",
    "duration": 2.5
}))
```

---

## 13. Error Handling & Monitoring

### Error Strategy

**Approach**:
- Automatic retries (with exponential backoff)
- Graceful degradation
- Clear error messages
- User-friendly explanations

**Library**:
```python
tenacity==8.2.3  # Retry logic
```

**Monitoring** (Optional for production):
- Basic health checks
- Execution time tracking
- Error rate monitoring

---

## 14. Deployment Platform

### Cloud Deployment (Free Tier)

**Recommended Platforms**:

| Platform | Free Tier | Best For |
|----------|-----------|----------|
| **Render** | 750 hours/month | Full-stack apps |
| **Railway** | $5 credit/month | Database + backend |
| **Fly.io** | 3 VMs free | Global deployment |
| **Vercel** | Unlimited | Frontend only |

**Containerization**: **Docker + Docker Compose**

**Why Docker**:
- ✅ Consistent environments
- ✅ Easy deployment
- ✅ Portable
- ✅ Industry-standard

**Deployment Characteristics**:
- Web-accessible
- Scalable
- Student-budget friendly
- HTTPS enabled

---

## 15. Security & Privacy Tools

**Security Measures**:

| Feature | Implementation |
|---------|----------------|
| HTTPS | Platform-provided SSL |
| Session isolation | JWT + user-specific contexts |
| File cleanup | Automatic deletion after session |
| Input validation | Pydantic models |
| Rate limiting | FastAPI middleware |
| CORS | Configured origins only |

**Privacy**:
- No cross-user data access
- Temporary file storage
- User data encryption
- GDPR-compliant design

---

## 16. Version Control & Collaboration

### **Git + GitHub**

**Usage**:
- Source control
- Documentation
- Portfolio showcase
- Collaboration

**Repository Structure**:
```
atlas/
├── backend/
├── frontend/
├── docs/
├── .github/
├── docker-compose.yml
└── README.md
```

---

## 17. Development Tools

### Backend Development

```python
# Development dependencies
pytest==7.4.3           # Testing
black==23.12.1          # Code formatting
flake8==7.0.0           # Linting
mypy==1.8.0             # Type checking
```

### Frontend Development

```json
{
  "eslint": "^8.56.0",
  "prettier": "^3.1.1",
  "@vitejs/plugin-react": "^4.2.1"
}
```

---

## 18. Tech Stack Summary Table

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Language** | Python | 3.11+ | Backend & agents |
| **Language** | JavaScript | ES6+ | Frontend |
| **Backend** | FastAPI | 0.109.0 | API framework |
| **Frontend** | React | 18.2.0 | UI framework |
| **Build Tool** | Vite | 5.0.11 | Frontend bundler |
| **Styling** | Tailwind CSS | 3.4.1 | CSS framework |
| **LLM** | Google Gemini | gemini-pro | Language model |
| **Vector DB** | ChromaDB | 0.4.22 | Semantic search |
| **Short-Term Memory** | Redis | 5.0.1 | Session cache |
| **Long-Term Memory** | PostgreSQL | 15 | Persistent storage |
| **ORM** | SQLAlchemy | 2.0.25 | Database ORM |
| **Auth** | JWT | - | Authentication |
| **File Processing** | PyPDF2, python-docx | - | Document parsing |
| **Containerization** | Docker | - | Deployment |
| **Deployment** | Render/Railway | - | Cloud hosting |

---

## 19. Complete Dependency List

### Backend (requirements.txt)

```txt
# Core Framework
fastapi==0.109.0
uvicorn[standard]==0.27.0
pydantic==2.5.3
pydantic-settings==2.1.0

# Database
sqlalchemy==2.0.25
psycopg2-binary==2.9.9
alembic==1.13.1

# Authentication
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
bcrypt==4.1.2
pydantic[email]==2.5.3
email-validator==2.1.0

# LLM
google-generativeai==0.3.2

# Vector DB
chromadb==0.4.22

# Cache
redis==5.0.1

# File Processing
PyPDF2==3.0.1
python-docx==1.1.0
python-multipart==0.0.6

# HTTP Client
httpx==0.26.0
aiohttp==3.9.1

# Utilities
python-dotenv==1.0.0
tenacity==8.2.3

# Development
pytest==7.4.3
black==23.12.1
flake8==7.0.0
```

### Frontend (package.json)

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.1",
    "axios": "^1.6.5",
    "zustand": "^4.4.7",
    "lucide-react": "^0.309.0",
    "react-hot-toast": "^2.4.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.11",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.33",
    "eslint": "^8.56.0",
    "prettier": "^3.1.1"
  }
}
```

---

## 20. Final Tech Stack Justification

The ATLAS tech stack:

✅ **Meets all academic constraints** (free, open-source)  
✅ **Enables agentic AI workflows** (custom orchestration)  
✅ **Is cost-free and scalable** (free tiers available)  
✅ **Is future-proof** (easy to add RAG and new agents)  
✅ **Is industry-aligned** (modern, production-ready stack)  
✅ **Is student-friendly** (well-documented, popular tools)  

---

## 21. Technology Alternatives

### If Constraints Change

| Component | Current | Alternative |
|-----------|---------|-------------|
| LLM | Google Gemini | OpenAI GPT-4, Anthropic Claude |
| Vector DB | ChromaDB | Pinecone, Weaviate, FAISS |
| Backend | FastAPI | Flask, Django |
| Frontend | React | Vue.js, Svelte, Next.js |
| Database | PostgreSQL | MongoDB, MySQL |
| Deployment | Render | AWS, GCP, Azure |

---

## 22. Completion Status

✅ **You now have**:

1. ✔️ **PRD** (Product Requirements Document)
2. ✔️ **Design Document** (System Architecture)
3. ✔️ **Tech Stack Document** (Technology Specifications)

**This is a complete, professional, end-to-end project documentation set.**

---

## 23. Next Steps

### Implementation Roadmap

1. **Phase 1**: Backend setup + Database
2. **Phase 2**: Agent implementation
3. **Phase 3**: Orchestrator logic
4. **Phase 4**: Frontend UI
5. **Phase 5**: Integration & testing
6. **Phase 6**: Deployment

### Optional Enhancements

- Convert docs to DOCX/PDF
- Create architecture diagrams
- Generate GitHub README
- Prepare viva Q&A
- Start coding implementation

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Status**: Ready for Implementation ✅

---

**Built with academic excellence and industry standards in mind** 🎓🚀

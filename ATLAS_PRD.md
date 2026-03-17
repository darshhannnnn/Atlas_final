# Product Requirements Document (PRD)
# ATLAS – Autonomous Task-oriented Learning & Agentic System

---

## 1. Product Overview

### 1.1 Product Name
**ATLAS**  
Autonomous Task-oriented Learning & Agentic System

### 1.2 Purpose of the Project
ATLAS is developed as:
- An academic project submission
- A resume and portfolio-grade system
- A demonstration of modern multi-agent and agentic AI system design

### 1.3 Product Description
ATLAS is an academic, portfolio-grade, cloud-based, multi-agent AI system designed to provide explainable, agentic task execution.

### 1.4 Target Users
- General users
- Students (primary focus) who require:
  - Research assistance
  - Structured writing help
  - Summarization and verification
  - Explainable AI workflows

### 1.5 Problem Statement
Current AI assistants provide strong conversational ability but lack:
- Explicit agent modularity
- Explainable execution pipelines
- User-controlled single-agent vs multi-agent workflows
- Strong safeguards against hallucination

**ATLAS addresses these gaps using a fully agentic, orchestrated multi-agent architecture.**

---

## 2. Goals & Objectives

### 2.1 Primary Goals
- Provide a ChatGPT-like conversational experience
- Allow users to choose how work is executed
- Reduce hallucinations through verification and regeneration
- Ensure transparency via agent traceability

### 2.2 Secondary Goals
- Support both text and file-based inputs
- Maintain free/open-source feasibility
- Be scalable for future RAG integration

---

## 3. System Scope

### 3.1 In Scope
- Conversational chat interface
- Six specialized agents
- Fully agentic orchestration
- Multi-file input handling
- Explainable agent execution logs
- Temporary file storage
- User-specific memory

### 3.2 Out of Scope (v1.0)
- Real-time web browsing guarantees
- Autonomous agent spawning
- Built-in plagiarism detection
- Paid or proprietary AI services

---

## 4. User Experience & Interaction Flow

### 4.1 Interaction Model
- Users interact with ATLAS via a chat-style web interface
- Conversation starts naturally (like ChatGPT)
- When task execution begins, user is prompted to:
  - Select a single agent
  - OR run the full multi-agent workflow

### 4.2 Supported Inputs
- Plain text prompts
- Multiple files simultaneously:
  - PDF
  - DOCX
  - TXT
- Maximum upload size: 100 MB

### 4.3 Output Flexibility
Outputs depend on user choice:
- Full article
- Summary / TL;DR
- Verified content
- Refined or rewritten text

---

## 5. Modes of Operation

| Mode | Description |
|------|-------------|
| **Solo Agent Mode** | Executes only the selected agent |
| **Full Research Mode** | Executes entire agent pipeline |
| **Rewrite Mode** | Refinement and rewriting only |
| **Summarize-Only Mode** | Summarizer agent only |
| **Verify-Only Mode** | Fact-checking and validation |

---

## 6. Agent Architecture

ATLAS consists of six specialized agents, each with a clearly defined role.

## 4. System Capabilities

- ChatGPT-like conversational UI
- User-controlled agent selection
- Multi-file input (PDF, DOCX, TXT)
- Flexible output (article, summary, verified content)

### 6.1 Search Agent
**Role**: Performs web and internal knowledge search

- **Uses**: Vector DB + tools
- **Input**: User query or extracted task prompt
- **Output**: 
  - Raw sources
  - Notes and retrieved context

### 6.2 Outliner Agent
**Role**: Converts raw information into structured outlines

**Output Example**:
1. Introduction
2. Key Concepts
3. Technical Details
4. Use Cases

### 6.3 Writer Agent
**Role**: Generates full-length content from outlines

- Can operate independently in write-only mode
- Produces complete articles/documents

### 6.4 Verifier Agent
**Role**: Fact-checks generated content

- Cross-verifies against sources and vector database
- Detects hallucinations
- **Failure Strategy**: Triggers regeneration if verification fails

### 6.5 Summarizer Agent
**Role**: Produces concise summaries

**Outputs**:
- TL;DR
- Executive summaries
- Bullet highlights

### 6.6 Update / Refinement Agent
**Role**: Improves clarity and structure

- Applies user feedback
- Rewrites sections when required
- Enhances overall quality

---

## 7. Agent Orchestrator

### 7.1 Role
The Orchestrator is a **fully agentic controller** responsible for:
- Deciding execution flow
- Managing inter-agent communication
- Handling retries and failures

**Think of it as a manager agent (but rule-based)**

### 7.2 Execution Logic

**Solo Mode**:
```
run(selected_agent)
```

**Multi-Agent Mode**:
```
Search → Outline → Write → Verify → Update → Summarize
```

Agents are allowed to:
- Call each other
- Request additional context
- Re-execute steps to improve output quality

### 7.3 Example Code Logic (Conceptual)

```python
if task.mode == "solo":
    run(selected_agent)
else:
    run(search_agent)
    run(outliner_agent)
    run(writer_agent)
    run(verifier_agent)
    run(update_agent)
    run(summarizer_agent)
```

---

## 8. Memory Architecture

ATLAS uses three distinct storage layers:

| Memory Type | Purpose |
|-------------|---------|
| **Vector Database** | Semantic search, future RAG |
| **Short-Term Memory** | Session-level context |
| **Long-Term Memory** | User-specific persistent memory |

**Details**:
- **Vector DB**: For document storage and retrieval
- **Short-term memory**: Current conversation context
- **Long-term memory**: Persistent knowledge base

---

## 9. Authentication & Data Handling

### 9.1 Authentication
- Simple login system
- Enables personalized long-term memory

### 9.2 Data Policy
- User chats are stored
- Uploaded files are stored temporarily
- Files are auto-deleted after task/session completion
- Privacy-aware and academic-safe design

---

## 10. Explainability & Logging

ATLAS prioritizes transparency.

**Visible Logs Include**:
- Agent execution order
- Agent-specific modifications
- Verification flags and confidence indicators

**These logs support**:
- Debugging
- Academic evaluation
- Viva explanations

---

## 11. Error Handling & Reliability

**Failure Strategy**:
- Automatic retries on failure
- Graceful degradation
- Clear user-facing explanations if failure persists

---

## 12. Constraints & Performance

| Constraint | Value |
|------------|-------|
| **Cost** | Free / open-source tools only |
| **Max Response Time** | ≤ 3 minutes |
| **Max Tokens** | 10,000 per run |
| **Deployment** | Cloud-based, web-accessible |
| **Max Upload Size** | 100 MB |

---

## 13. Non-Functional Requirements

- **Scalability**: Modular agent design
- **Maintainability**: Loosely coupled agents
- **Explainability**: Mandatory agent traces
- **Accessibility**: Simple language mode (default)

---

## 14. Success Metrics

- Reduction in hallucinations
- Improved factual accuracy
- User satisfaction (qualitative)
- Clear agent traceability

---

## 15. Versioning & Future Scope

### v1.0 (Current)
- Academic & portfolio release
- Multi-agent execution
- Explainable workflows
- Six specialized agents
- Solo vs Multi-Agent modes

### v2.0+ (Future)
- RAG integration
- Additional agents (planner, critic, coder)
- Enhanced UI
- Higher autonomy
- Real-time web browsing
- Autonomous agent spawning

---

## 16. Technical Architecture

### Backend Stack
- **Framework**: FastAPI (Python)
- **AI Model**: Google Gemini API (Free)
- **Vector DB**: ChromaDB (local/hosted)
- **Database**: PostgreSQL
- **Task Queue**: Celery / FastAPI BackgroundTasks
- **File Processing**: PyPDF2, python-docx

### Frontend Stack
- **Framework**: React + Vite
- **UI Library**: Tailwind CSS
- **State Management**: Zustand
- **API Client**: Axios
- **File Upload**: React Dropzone

### Deployment Options (Free/Low Cost)
- **Backend**: AWS EC2 / Lightsail, Render, Railway, Fly.io
- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **Database**: Supabase / Railway PostgreSQL
- **Vector DB**: ChromaDB (local or hosted)

### Security & Scaling
- JWT authentication
- Rate limiting
- Agent execution timeouts
- Task isolation per user
- Async background tasks
- File size validation
- Secure file storage

---

## 17. Mental Model

**ATLAS is NOT a chatbot**

It is a **task-driven, agent-orchestrated AI platform**

Each agent:
- Has a single responsibility
- Can work independently
- Or cooperate under orchestration

The system balances:
- **Power**: Multi-agent collaboration
- **Transparency**: Explainable workflows
- **Academic rigor**: Proper documentation
- **Practical usability**: ChatGPT-like interface

---

## 18. Conclusion

ATLAS represents a modern, agentic AI system that demonstrates strong understanding of:
- Multi-agent systems
- Orchestration logic
- Explainable AI
- Scalable system design

It serves as an excellent academic project and portfolio piece, showcasing advanced AI architecture while maintaining practical usability.

---

## Key Features Summary

✅ 6 Specialized Agents (Search, Outliner, Writer, Verifier, Summarizer, Update)  
✅ Intelligent Orchestrator (Fully Agentic Controller)  
✅ Solo vs Multi-Agent Modes (User Choice)  
✅ Multi-file Input Support (PDF, DOCX, TXT - up to 100MB)  
✅ Vector DB Memory (3-tier: Vector, Short-term, Long-term)  
✅ Explainable AI (Agent traces, verification flags)  
✅ Free/Open-Source Stack (Google Gemini API)  
✅ ChatGPT-like UI (Conversational interface)  
✅ Academic & Portfolio Ready (Complete documentation)  
✅ Error Handling (Automatic retries, graceful degradation)  
✅ Authentication (User-specific memory)  
✅ Privacy-Aware (Temporary file storage, auto-deletion)

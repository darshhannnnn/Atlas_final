# ATLAS - Autonomous Task-oriented Learning & Agentic System

A multi-agent AI system that orchestrates specialized agents to answer questions, research topics, and generate content.

## Features

- 6 Specialized Agents (Search, Outliner, Writer, Verifier, Summarizer, Update)
- Solo Agent or Full Research Pipeline modes
- Multi-file upload support (PDF, DOCX, TXT)
- Vector database for semantic search
- Real-time agent execution traces
- ChatGPT-like conversational UI

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Google Gemini API key (free tier)

### Setup

1. Get your Gemini API key:
   - Visit https://makersuite.google.com/app/apikey
   - Create a free API key

2. Configure environment:
   ```bash
   cd atlas
   cp backend/.env.example backend/.env
   # Edit backend/.env and add your GEMINI_API_KEY
   ```

3. Start the application:
   ```bash
   docker-compose up -d
   ```

4. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### First Time Use

1. Register a new account at http://localhost:5173/register
2. Login with your credentials
3. Start chatting with ATLAS

## Usage

### Solo Agent Mode
- Select a specific agent (Search, Writer, etc.)
- Agent works independently on your query

### Full Research Pipeline
- All agents work together in sequence:
  1. Search → finds information
  2. Outliner → structures content
  3. Writer → creates full response
  4. Verifier → fact-checks
  5. Update → refines content
  6. Summarizer → creates summary

### File Upload
- Click 📎 to attach files (PDF, DOCX, TXT)
- Files are indexed in vector database
- Agents can reference uploaded content

## Tech Stack

- Backend: FastAPI + Python
- Frontend: React + Vite + Tailwind CSS
- LLM: Google Gemini (free API)
- Vector DB: ChromaDB
- Database: PostgreSQL
- Cache: Redis

## Development

Stop services:
```bash
docker-compose down
```

View logs:
```bash
docker-compose logs -f
```

Rebuild after changes:
```bash
docker-compose up -d --build
```

## Architecture

See detailed documentation:
- `ATLAS_PRD.md` - Product requirements
- `DESIGN_DOCUMENT.md` - System architecture
- `TECH_STACK.md` - Technology decisions
# Atlas_final

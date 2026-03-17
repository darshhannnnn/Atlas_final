# ATLAS Quick Start Guide

Get ATLAS running in 5 minutes.

## Step 1: Get Gemini API Key (Free)

1. Visit https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key

## Step 2: Configure

```bash
cd atlas
nano .env
```

Add your API key:
```
GEMINI_API_KEY=your-actual-api-key-here
```

Save and exit (Ctrl+X, Y, Enter)

## Step 3: Start ATLAS

From the project root:

```bash
./atlas/start.sh
```

Or manually:

```bash
cd atlas
docker-compose up -d
```

## Step 4: Wait for Startup

Services take 10-15 seconds to initialize. Check status:

```bash
docker-compose logs -f
```

Press Ctrl+C to exit logs.

## Step 5: Access ATLAS

Open browser: http://localhost:5173

1. Click "Register" 
2. Create account (email + password)
3. Login
4. Start chatting!

## Using ATLAS

### Solo Mode
- Select one agent (Search, Writer, etc.)
- Ask your question
- That agent handles it alone

### Pipeline Mode
- All 6 agents work together
- Search → Outline → Write → Verify → Update → Summarize
- Best for research tasks

### Upload Files
- Click 📎 icon
- Select PDF, DOCX, or TXT files
- Files are indexed for semantic search
- Agents can reference your documents

## Troubleshooting

### Port already in use
```bash
docker-compose down
docker-compose up -d
```

### Can't connect to backend
Check if services are running:
```bash
docker-compose ps
```

### Database errors
Reset database:
```bash
docker-compose down -v
docker-compose up -d
```

### View logs
```bash
docker-compose logs backend
docker-compose logs frontend
```

## Stop ATLAS

```bash
cd atlas
docker-compose down
```

## Next Steps

- Read `ATLAS_PRD.md` for full feature list
- Read `DESIGN_DOCUMENT.md` for architecture
- Check `README.md` for development guide

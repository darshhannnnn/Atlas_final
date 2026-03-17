# 🚀 START HERE - ATLAS Quick Launch

## What is ATLAS?

ATLAS is a multi-agent AI system with 6 specialized agents that work together to answer your questions, research topics, and generate content.

## 3-Step Launch

### 1️⃣ Get Free API Key (2 minutes)

Visit: https://makersuite.google.com/app/apikey
- Sign in with Google
- Click "Create API Key"
- Copy the key

### 2️⃣ Configure (1 minute)

```bash
cd atlas
nano .env
```

Paste your API key:
```
GEMINI_API_KEY=your-actual-key-here
```

Save: Ctrl+X, Y, Enter

### 3️⃣ Launch (2 minutes)

```bash
docker-compose up -d
```

Wait 15 seconds, then open: http://localhost:5173

## First Use

1. Click "Register"
2. Create account (any email format works)
3. Login
4. Start chatting!

## Two Modes

### Solo Mode
Pick one agent:
- Search: Find information
- Outliner: Structure content
- Writer: Write articles
- Verifier: Fact-check
- Summarizer: Create summaries
- Update: Refine content

### Pipeline Mode
All agents work together automatically:
Search → Outline → Write → Verify → Update → Summarize

## Upload Files

Click 📎 to upload PDF, DOCX, or TXT files (up to 100MB)
Agents can search and reference your documents.

## Troubleshooting

### Can't access http://localhost:5173
```bash
docker-compose ps  # Check if services are running
docker-compose logs frontend  # Check for errors
```

### Backend errors
```bash
docker-compose logs backend
```

### Reset everything
```bash
docker-compose down -v
docker-compose up -d
```

## Stop ATLAS

```bash
docker-compose down
```

## Need Help?

- Read `QUICKSTART.md` for detailed setup
- Read `README.md` for full documentation
- Read `PROJECT_STATUS.md` for feature list
- Check `DEPLOYMENT.md` for cloud deployment

## That's It!

You're ready to use ATLAS. Open http://localhost:5173 and start exploring.

# 🚀 ATLAS Launch Instructions

## You're Ready to Launch!

Everything is built. Just follow these 3 steps:

---

## Step 1: Get Your Free API Key

Go to: **https://makersuite.google.com/app/apikey**

1. Sign in with your Google account
2. Click "Create API Key"
3. Copy the key (looks like: AIzaSy...)

---

## Step 2: Add API Key

Open terminal and run:

```bash
cd atlas
nano .env
```

You'll see:
```
GEMINI_API_KEY=your-gemini-api-key-here
```

Replace `your-gemini-api-key-here` with your actual key.

Save: Press `Ctrl+X`, then `Y`, then `Enter`

---

## Step 3: Launch ATLAS

```bash
docker-compose up -d
```

Wait 15 seconds for services to start.

---

## Step 4: Open ATLAS

Open your browser: **http://localhost:5173**

1. Click "Register"
2. Enter email and password (any format works)
3. Click "Login"
4. Start chatting!

---

## Using ATLAS

### Choose Your Mode

**Solo Mode**: Pick one agent
- Search Agent - Find information
- Writer Agent - Write content
- Summarizer Agent - Create summaries
- etc.

**Pipeline Mode**: All 6 agents work together
- Best for research and comprehensive answers

### Upload Files

Click the 📎 icon to upload:
- PDF documents
- Word documents (.docx)
- Text files (.txt)
- Up to 100MB per file

Agents will search and reference your documents.

### View Agent Traces

Click "Show Agent Trace" to see:
- Which agents ran
- What each agent did
- Execution time
- Status of each step

---

## Example Questions to Try

1. "Explain quantum computing in simple terms"
2. "Write an article about climate change"
3. "Summarize the key points about AI ethics"
4. "Search for information about renewable energy"

---

## Stop ATLAS

```bash
cd atlas
docker-compose down
```

---

## Troubleshooting

**Can't connect?**
```bash
docker-compose ps  # Check if running
docker-compose logs -f  # View logs
```

**Backend errors?**
- Check your API key is correct in .env
- Restart: `docker-compose restart backend`

**Need to reset?**
```bash
docker-compose down -v
docker-compose up -d
```

---

## That's It!

You now have a fully functional multi-agent AI system.

**Next**: Open http://localhost:5173 and start exploring!

For more help, read:
- `START_HERE.md` - Quick guide
- `TROUBLESHOOTING.md` - Common issues
- `README.md` - Full documentation

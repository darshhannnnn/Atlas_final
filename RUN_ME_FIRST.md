# 🎯 RUN ME FIRST

## ATLAS is 100% Complete - Here's How to Launch

---

## ⚡ Super Quick Start (Copy & Paste)

```bash
# 1. Navigate to atlas
cd atlas

# 2. Make scripts executable
chmod +x setup.sh start.sh test_setup.sh

# 3. Edit .env and add your Gemini API key
nano .env
# Change: GEMINI_API_KEY=your-gemini-api-key-here
# To: GEMINI_API_KEY=AIzaSy... (your actual key)
# Save: Ctrl+X, Y, Enter

# 4. Launch ATLAS
docker-compose up -d

# 5. Wait 15 seconds, then open browser
open http://localhost:5173
```

---

## 📋 Step-by-Step Instructions

### Step 1: Get API Key

1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key (starts with AIzaSy...)

### Step 2: Add API Key

```bash
cd atlas
nano .env
```

Find this line:
```
GEMINI_API_KEY=your-gemini-api-key-here
```

Replace with your actual key:
```
GEMINI_API_KEY=AIzaSyYourActualKeyHere
```

Save: `Ctrl+X`, then `Y`, then `Enter`

### Step 3: Launch

```bash
docker-compose up -d
```

You'll see:
```
Creating atlas_postgres_1 ... done
Creating atlas_redis_1    ... done
Creating atlas_backend_1  ... done
Creating atlas_frontend_1 ... done
```

### Step 4: Access ATLAS

Open browser: **http://localhost:5173**

1. Click "Register"
2. Enter:
   - Email: test@example.com
   - Username: testuser
   - Password: password123
3. Click "Login"
4. Start chatting!

---

## 🎮 How to Use ATLAS

### Choose Mode

**Solo Mode**:
- Select one agent from dropdown
- Fast, focused responses
- Example: Pick "Search Agent" to find info

**Pipeline Mode**:
- All 6 agents work together
- Comprehensive research
- Takes 20-40 seconds

### Upload Files

1. Click 📎 icon
2. Select PDF, DOCX, or TXT files
3. Files are indexed automatically
4. Agents can search your documents

### View Agent Traces

- Toggle "Show Agent Trace"
- See which agents ran
- View execution details
- Debug agent behavior

---

## 🧪 Test It

Try these questions:

1. "Explain machine learning in simple terms"
2. "Write a short article about renewable energy"
3. "Summarize the benefits of electric vehicles"

---

## 🛠️ Useful Commands

```bash
# View logs
docker-compose logs -f

# Stop ATLAS
docker-compose down

# Restart
docker-compose restart

# Reset everything
docker-compose down -v
docker-compose up -d

# Check status
docker-compose ps

# Test backend
curl http://localhost:8000/health
```

---

## ❓ Troubleshooting

### "Docker is not running"
→ Open Docker Desktop application

### "Port already in use"
→ Run: `docker-compose down`
→ Or change ports in docker-compose.yml

### "Can't connect to backend"
→ Check: `docker-compose logs backend`
→ Verify API key in .env

### "Frontend shows blank page"
→ Check: `docker-compose logs frontend`
→ Try: `docker-compose restart frontend`

### "Agent execution failed"
→ Verify Gemini API key is correct
→ Check API quota at https://makersuite.google.com

---

## 📚 Documentation

- `PROJECT_MAP.txt` - Visual project structure
- `COMPLETE.md` - What's built
- `TROUBLESHOOTING.md` - Common issues
- `DEPLOYMENT.md` - Cloud deployment
- `README.md` - Full documentation

---

## ✅ What's Working

✅ User authentication (register/login)
✅ Conversation management
✅ 6 AI agents (all functional)
✅ Solo agent mode
✅ Full pipeline mode
✅ File upload (PDF, DOCX, TXT)
✅ Vector database search
✅ Agent execution traces
✅ Real-time chat UI
✅ Docker deployment

---

## 🎯 Your Action

1. Get API key from Google
2. Add to `atlas/.env`
3. Run `docker-compose up -d`
4. Open http://localhost:5173
5. Register and start chatting!

**That's it! You're ready to go! 🚀**

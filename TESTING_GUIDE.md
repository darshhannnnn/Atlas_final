# ATLAS Testing Guide

## Quick Status Check

Run this first to verify services are running:

```bash
cd atlas
python3 check_status.py
```

## Test All Agents

Run the comprehensive agent test:

```bash
cd atlas
python3 test_agents.py
```

This will test:
- ✅ Search Agent
- ✅ Outliner Agent  
- ✅ Writer Agent
- ✅ Verifier Agent
- ✅ Summarizer Agent
- ✅ Update Agent
- ✅ Full Research Pipeline

## Manual Testing via Web Interface

1. Open browser: `http://localhost:5173`
2. Login with your credentials
3. Create a new conversation
4. Select mode:
   - **Solo Agent**: Test individual agents
   - **Full Research Pipeline**: Test complete workflow

### Testing Individual Agents

Select "Solo Agent" mode and choose each agent:

1. **Search Agent**: "What is machine learning?"
2. **Outliner Agent**: "Create an outline about climate change"
3. **Writer Agent**: "Write about renewable energy"
4. **Verifier Agent**: "Verify facts about solar power"
5. **Summarizer Agent**: "Summarize the benefits of AI"
6. **Update Agent**: "Refine content about quantum computing"

### Testing Full Pipeline

Select "Full Research Pipeline" mode and ask: "What is artificial intelligence?"

## Troubleshooting

### If agents don't respond:

1. Check backend logs:
```bash
docker logs atlas-backend-1 --tail=50
```

2. Verify API key is set:
```bash
cat backend/.env | grep GEMINI_API_KEY
```

3. Restart backend:
```bash
docker-compose restart backend
```

### If you see "white screen" in full research mode:

- Check browser console (F12) for JavaScript errors
- Check backend logs for Python errors
- Verify all agents work individually first

### Common Issues:

1. **"Conversation not found"**: Create a new conversation first
2. **"Could not validate credentials"**: Login again
3. **Empty responses**: Check GEMINI_API_KEY is valid
4. **Timeout errors**: Increase timeout in test scripts

## Expected Behavior

### Solo Mode:
- Each agent should return a response within 5-15 seconds
- Response should be relevant to the query
- No errors in backend logs

### Full Research Pipeline:
- Takes 30-60 seconds to complete
- Executes all 6 agents in sequence
- Returns comprehensive researched content
- Shows agent traces when enabled

## API Key Management

Your current API key is in `atlas/.env`:
```
GEMINI_API_KEY=AIzaSyCeHzbfoDgq3_21YYzh8fxi7xHKveJUm6w
```

This is automatically copied to `atlas/backend/.env` when services start.

If you get a new API key:
1. Update `atlas/.env`
2. Update `atlas/backend/.env`
3. Restart backend: `docker-compose restart backend`

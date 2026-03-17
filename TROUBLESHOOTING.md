# ATLAS Troubleshooting Guide

## Common Issues & Solutions

### 1. "Docker is not running"

**Problem**: Docker Desktop is not started

**Solution**:
```bash
# macOS: Open Docker Desktop from Applications
# Check status:
docker info
```

### 2. "Port already in use"

**Problem**: Ports 5173, 8000, 5432, or 6379 are occupied

**Solution**:
```bash
# Stop ATLAS
docker-compose down

# Check what's using the port
lsof -i :5173
lsof -i :8000

# Kill the process or change ports in docker-compose.yml
```

### 3. "GEMINI_API_KEY not set"

**Problem**: API key missing or incorrect in .env

**Solution**:
```bash
cd atlas
nano .env
# Add: GEMINI_API_KEY=your-actual-key
# Save and restart:
docker-compose restart backend
```

### 4. "Cannot connect to backend"

**Problem**: Backend not responding

**Solution**:
```bash
# Check backend logs
docker-compose logs backend

# Common fixes:
docker-compose restart backend
# or
docker-compose down && docker-compose up -d
```

### 5. "Database connection failed"

**Problem**: PostgreSQL not ready or wrong credentials

**Solution**:
```bash
# Check postgres is running
docker-compose ps

# Restart postgres
docker-compose restart postgres

# Reset database
docker-compose down -v
docker-compose up -d
```

### 6. "401 Unauthorized" when logging in

**Problem**: Token or authentication issue

**Solution**:
- Clear browser localStorage
- Try registering a new account
- Check backend logs for errors
- Verify SECRET_KEY is set in .env

### 7. "Agent execution failed"

**Problem**: Gemini API error or quota exceeded

**Solution**:
- Verify API key is correct
- Check Gemini API quota: https://makersuite.google.com
- Wait a few minutes if rate limited
- Check backend logs: `docker-compose logs backend`

### 8. "File upload failed"

**Problem**: File too large or unsupported type

**Solution**:
- Max file size: 100MB
- Supported: PDF, DOCX, TXT only
- Check file permissions
- Review backend logs

### 9. Frontend shows blank page

**Problem**: Build error or wrong API URL

**Solution**:
```bash
# Check frontend logs
docker-compose logs frontend

# Verify .env
cat frontend/.env
# Should have: VITE_API_URL=http://localhost:8000

# Rebuild
docker-compose up -d --build frontend
```

### 10. "Module not found" errors

**Problem**: Dependencies not installed

**Solution**:
```bash
# Rebuild with fresh install
docker-compose down
docker-compose up -d --build
```

## Debug Commands

### View all logs
```bash
docker-compose logs -f
```

### View specific service
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Check service status
```bash
docker-compose ps
```

### Restart specific service
```bash
docker-compose restart backend
docker-compose restart frontend
```

### Complete reset
```bash
docker-compose down -v  # Removes volumes too
docker-compose up -d --build
```

### Enter container shell
```bash
docker-compose exec backend bash
docker-compose exec frontend sh
```

## Health Checks

### Backend health
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy"}
```

### API docs
Open: http://localhost:8000/docs

### Database connection
```bash
docker-compose exec postgres psql -U atlas -d atlas_db
# Type: \dt to see tables
# Type: \q to exit
```

## Performance Issues

### Slow agent responses
- Normal: 10-30 seconds for pipeline mode
- Check Gemini API latency
- Reduce file upload sizes
- Use solo mode for faster responses

### High memory usage
- ChromaDB can use significant memory
- Restart services periodically
- Clear vector DB if needed

## Still Having Issues?

1. Check all logs: `docker-compose logs`
2. Verify .env configuration
3. Ensure Docker has enough resources (4GB+ RAM)
4. Try complete reset: `docker-compose down -v && docker-compose up -d --build`
5. Check firewall/antivirus isn't blocking ports

## Getting Help

- Review `DESIGN_DOCUMENT.md` for architecture
- Check `PROJECT_STATUS.md` for feature status
- Read API docs at http://localhost:8000/docs
- Inspect browser console for frontend errors (F12)

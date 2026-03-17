# Onboarding Troubleshooting Guide

## Issue: "Failed to save profile" and "Not Found" errors

### Quick Fix

Run this script to diagnose and fix the issue:

```bash
cd atlas
./FIX_ONBOARDING.sh
```

### Manual Steps

#### 1. Check if backend is running

```bash
docker-compose ps
```

Expected: backend container should be "Up"

#### 2. Check backend logs

```bash
docker-compose logs backend | tail -50
```

Look for errors related to:
- Database connection
- Missing columns
- Route not found

#### 3. Verify database schema

```bash
docker-compose exec postgres psql -U atlas -d atlas_db -c "\d users"
```

Expected columns:
- `name` (character varying)
- `interests` (json)
- `onboarding_completed` (boolean)

#### 4. Run migration if columns are missing

```bash
docker-compose exec backend python migrate_onboarding.py
```

Expected output:
```
✅ 'name' column added
✅ 'interests' column added
✅ 'onboarding_completed' column added
✅ Existing users updated
🎉 Migration completed successfully!
```

#### 5. Restart services

```bash
docker-compose restart backend frontend
```

#### 6. Test the API endpoint

```bash
# This should return 401 (unauthorized) but NOT 404 (not found)
curl -X PATCH http://localhost:8000/api/v1/auth/profile \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'
```

Expected: `{"detail":"Not authenticated"}` (401 error)
NOT: `{"detail":"Not Found"}` (404 error)

### Common Issues

#### Issue: 404 Not Found

**Cause**: Backend route not registered or backend not running

**Fix**:
1. Check if backend is running: `docker-compose ps`
2. Restart backend: `docker-compose restart backend`
3. Check logs: `docker-compose logs backend`

#### Issue: 500 Internal Server Error

**Cause**: Database columns missing

**Fix**:
1. Run migration: `docker-compose exec backend python migrate_onboarding.py`
2. Restart backend: `docker-compose restart backend`

#### Issue: "Failed to save profile" but no specific error

**Cause**: Network issue or CORS

**Fix**:
1. Check browser console (F12) for detailed error
2. Verify API URL in frontend: `http://localhost:8000/api/v1`
3. Check CORS settings in backend

### Verification Steps

After fixing, verify everything works:

1. **Register a new user**
   - Go to http://localhost:3000/register
   - Create account
   - Should redirect to /onboarding

2. **Complete onboarding**
   - Step 1: Enter name → Click arrow
   - Step 2: Select interests → Click "Let's go"
   - Step 3: Click "I have my own topic"
   - Should redirect to /chat

3. **Check profile was saved**
   ```bash
   docker-compose exec postgres psql -U atlas -d atlas_db -c "SELECT email, name, interests, onboarding_completed FROM users;"
   ```

### Still Having Issues?

1. **Full rebuild**:
   ```bash
   docker-compose down
   docker-compose build --no-cache backend frontend
   docker-compose up -d
   sleep 10
   docker-compose exec backend python migrate_onboarding.py
   ```

2. **Check browser console** (F12):
   - Look for network errors
   - Check API responses
   - Verify token is being sent

3. **Check backend logs in real-time**:
   ```bash
   docker-compose logs -f backend
   ```
   Then try the onboarding flow again

4. **Verify environment variables**:
   ```bash
   docker-compose exec backend env | grep DATABASE_URL
   ```

### Debug Mode

Enable detailed logging:

1. Open browser console (F12)
2. Go through onboarding
3. Look for console.log messages:
   - "Updating profile with: ..."
   - "Profile updated successfully: ..."
   - Or error messages

The logs will show exactly what's being sent and received.

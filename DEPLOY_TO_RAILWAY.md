# Deploy ATLAS to Railway

## Step-by-Step Deployment Instructions

### 1. Prepare for Deployment

The backend is now properly configured for Railway deployment. All configuration files are in the `backend/` directory.

### 2. Deploy Backend to Railway

1. **Connect to Railway:**
   ```bash
   cd atlas
   npx @railway/cli login
   ```

2. **Initialize Railway project:**
   ```bash
   npx @railway/cli init
   ```

3. **Set the root directory to backend:**
   ```bash
   npx @railway/cli up --detach
   ```

4. **Add PostgreSQL database:**
   - Go to your Railway dashboard
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will automatically provide the DATABASE_URL environment variable

5. **Set environment variables in Railway dashboard:**
   - `MISTRAL_API_KEY=tGTh1pAmBIjMQcmND6xi6bbUDrvhetqy`
   - `SECRET_KEY=atlas-secret-key-change-in-production-2024`
   - DATABASE_URL will be automatically set by Railway PostgreSQL service

6. **Deploy:**
   ```bash
   cd backend
   npx @railway/cli up
   ```

### 3. Deploy Frontend to Vercel

1. **Prepare frontend for deployment:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Vercel:**
   ```bash
   npx vercel --prod
   ```

3. **Update frontend API URL:**
   - Get your Railway backend URL (e.g., `https://your-app.railway.app`)
   - Update the API base URL in your frontend configuration

### 4. Initialize Production Database

Once the backend is deployed, run the migration script:

```bash
# This will be done automatically when the app starts
# The database tables are created in main.py with Base.metadata.create_all(bind=engine)
```

### 5. Test Deployment

1. **Test backend health:**
   ```bash
   curl https://your-railway-app.railway.app/health
   ```

2. **Test frontend:**
   - Visit your Vercel URL
   - Try registering a new user
   - Test the chat functionality

## Configuration Files

- `backend/nixpacks.toml` - Railway build configuration
- `backend/railway.json` - Railway deployment settings  
- `backend/requirements.txt` - Python dependencies
- `backend/main.py` - FastAPI application entry point
- `backend/.env` - Environment variables (local development)

## Troubleshooting

If deployment fails:

1. Check Railway build logs in the dashboard
2. Verify all environment variables are set
3. Ensure PostgreSQL service is connected
4. Check that the backend directory is set as root directory

## Next Steps

After successful deployment:
1. Update CORS origins in `main.py` to include your production domains
2. Set up proper SSL certificates (Railway handles this automatically)
3. Configure domain names if needed
4. Set up monitoring and logging
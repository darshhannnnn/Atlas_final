"""
Vercel serverless function entry point for ATLAS backend
"""
from main import app

# Export the FastAPI app for Vercel
handler = app

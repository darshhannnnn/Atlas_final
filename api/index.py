"""
Vercel serverless function entry point for ATLAS backend
"""
import sys
import os

# Add backend directory to Python path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_path)

# Import FastAPI app
from main import app

# Vercel handler
handler = app

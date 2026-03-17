#!/bin/bash
# Render startup script for ATLAS backend

echo "Starting ATLAS backend on Render..."

# Run database migrations if needed
python -c "
from app.database import engine, Base
print('Creating database tables...')
Base.metadata.create_all(bind=engine)
print('Database setup complete.')
"

# Start the FastAPI application
exec uvicorn main:app --host 0.0.0.0 --port $PORT
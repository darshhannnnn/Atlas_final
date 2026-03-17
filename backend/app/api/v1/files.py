from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from typing import List
from app.dependencies import get_current_user
from app.models.user import User
from app.services.file_service import FileService
from app.services.vector_service import VectorService
from app.core.config import settings
import logging
import time

logger = logging.getLogger("atlas.api.files")

router = APIRouter()
file_service = FileService(settings.UPLOAD_DIR)
vector_service = VectorService(settings.CHROMA_DB_DIR)


@router.post("/upload")
async def upload_files(
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user)
):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    processed_files = []
    errors = []
    
    for file in files:
        try:
            # Check file size
            file_size = 0
            content = await file.read()
            file_size = len(content)
            await file.seek(0)
            
            max_size = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
            if file_size > max_size:
                errors.append(f"{file.filename}: Exceeds {settings.MAX_UPLOAD_SIZE_MB}MB limit")
                continue
            
            # Validate file type
            file_ext = '.' + file.filename.split('.')[-1].lower()
            if file_ext not in settings.ALLOWED_FILE_TYPES:
                errors.append(f"{file.filename}: Invalid type. Only PDF, DOCX, TXT allowed")
                continue
            
            # Process file
            result = await file_service.process_file(file)
            processed_files.append(result)
            
            # Add to vector DB
            if result.get("content"):
                vector_service.add_documents(
                    documents=[result["content"]],
                    metadatas=[{
                        "filename": result["filename"],
                        "user_id": current_user.id,
                        "file_type": result["file_type"]
                    }],
                    ids=[f"user_{current_user.id}_{result['filename']}_{int(time.time())}"]
                )
                logger.info(f"✅ Added {file.filename} to vector DB")
            
        except Exception as e:
            logger.error(f"❌ Failed to process {file.filename}: {e}")
            errors.append(f"{file.filename}: {str(e)}")
    
    if not processed_files and errors:
        raise HTTPException(status_code=400, detail=f"All files failed: {'; '.join(errors)}")
    
    logger.info(f"✅ Processed {len(processed_files)} files for user {current_user.id}")
    
    response = {
        "message": f"Successfully processed {len(processed_files)} file(s)",
        "files": processed_files,
        "file_ids": list(range(len(processed_files)))
    }
    
    if errors:
        response["warnings"] = errors
    
    return response

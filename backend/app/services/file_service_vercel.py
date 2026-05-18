"""
File service with Vercel Blob Storage support for serverless deployment
Falls back to local storage for development
"""
import os
from typing import Dict, Any
from fastapi import UploadFile
import PyPDF2
from docx import Document
import logging
from io import BytesIO

logger = logging.getLogger("atlas.file_service")

# Try to import Vercel Blob
try:
    from vercel_blob import put, delete
    BLOB_AVAILABLE = True
except ImportError:
    BLOB_AVAILABLE = False
    logger.warning("⚠️ vercel-blob not installed, using local storage")


class FileService:
    def __init__(self):
        """Initialize file service with Vercel Blob or local storage"""
        self.blob_token = os.getenv("BLOB_READ_WRITE_TOKEN")
        self.use_blob = BLOB_AVAILABLE and self.blob_token is not None
        
        if self.use_blob:
            logger.info("✅ Using Vercel Blob Storage")
        else:
            self.upload_dir = "uploads"
            os.makedirs(self.upload_dir, exist_ok=True)
            logger.info("📁 Using local file storage")

    async def process_file(self, file: UploadFile) -> Dict[str, Any]:
        """
        Process uploaded file: extract text and store
        
        Args:
            file: Uploaded file from FastAPI
            
        Returns:
            Dict with file metadata and extracted text
        """
        try:
            # Read file content
            content = await file.read()
            
            # Extract text based on file type
            file_type = file.filename.split('.')[-1].lower()
            
            if file_type == "pdf":
                text_content = self._extract_pdf(BytesIO(content))
            elif file_type in ["docx", "doc"]:
                text_content = self._extract_docx(BytesIO(content))
            elif file_type == "txt":
                text_content = content.decode('utf-8', errors='ignore')
            else:
                raise ValueError(f"Unsupported file type: {file_type}")
            
            # Validate extracted text
            if not text_content or len(text_content.strip()) < 10:
                raise ValueError(f"Could not extract meaningful text from {file.filename}")
            
            # Store file
            file_url = await self._store_file(file.filename, content, file.content_type)
            
            logger.info(f"✅ Processed {file.filename}: {len(text_content)} chars extracted")
            
            return {
                "filename": file.filename,
                "file_type": file_type,
                "content": text_content,
                "file_url": file_url,
                "size": len(content),
                "text_length": len(text_content)
            }
            
        except Exception as e:
            logger.error(f"❌ File processing failed for {file.filename}: {e}")
            raise Exception(f"Failed to process {file.filename}: {str(e)}")

    async def _store_file(self, filename: str, content: bytes, content_type: str) -> str:
        """Store file in Vercel Blob or local filesystem"""
        if self.use_blob:
            try:
                # Upload to Vercel Blob
                blob = await put(
                    filename,
                    content,
                    {
                        'access': 'public',
                        'contentType': content_type,
                        'token': self.blob_token
                    }
                )
                return blob['url']
            except Exception as e:
                logger.error(f"❌ Blob upload failed: {e}")
                raise Exception(f"Failed to upload file to storage: {str(e)}")
        else:
            # Store locally
            file_path = os.path.join(self.upload_dir, filename)
            with open(file_path, "wb") as f:
                f.write(content)
            return file_path

    def _extract_pdf(self, file_obj) -> str:
        """Extract text from PDF file"""
        try:
            text = ""
            pdf_reader = PyPDF2.PdfReader(file_obj)
            
            if len(pdf_reader.pages) == 0:
                raise ValueError("PDF has no pages")
            
            for page_num, page in enumerate(pdf_reader.pages):
                try:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
                except Exception as e:
                    logger.warning(f"⚠️ Failed to extract page {page_num}: {e}")
                    continue
            
            if not text.strip():
                raise ValueError("No text could be extracted from PDF")
            
            return text
            
        except Exception as e:
            logger.error(f"❌ PDF extraction failed: {e}")
            raise ValueError(f"Could not read PDF: {str(e)}")

    def _extract_docx(self, file_obj) -> str:
        """Extract text from DOCX file"""
        try:
            doc = Document(file_obj)
            text = "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
            
            if not text.strip():
                raise ValueError("No text found in document")
            
            return text
            
        except Exception as e:
            logger.error(f"❌ DOCX extraction failed: {e}")
            raise ValueError(f"Could not read DOCX: {str(e)}")

    async def delete_file(self, file_url: str):
        """Delete file from storage"""
        if self.use_blob:
            try:
                await delete(file_url, {'token': self.blob_token})
                logger.info(f"🗑️ Deleted blob: {file_url}")
            except Exception as e:
                logger.error(f"❌ Blob deletion failed: {e}")
        else:
            try:
                if os.path.exists(file_url):
                    os.remove(file_url)
                    logger.info(f"🗑️ Deleted file: {file_url}")
            except Exception as e:
                logger.error(f"❌ File deletion failed: {e}")

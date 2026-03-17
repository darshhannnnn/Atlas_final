import os
from typing import List, Dict, Any
from fastapi import UploadFile
import PyPDF2
from docx import Document
import logging

logger = logging.getLogger("atlas.file_service")


class FileService:
    def __init__(self, upload_dir: str = "uploads"):
        self.upload_dir = upload_dir
        os.makedirs(upload_dir, exist_ok=True)

    async def process_file(self, file: UploadFile) -> Dict[str, Any]:
        file_path = os.path.join(self.upload_dir, file.filename)
        
        try:
            # Save file
            with open(file_path, "wb") as f:
                content = await file.read()
                f.write(content)
            
            # Extract text based on file type
            text_content = ""
            file_type = file.filename.split('.')[-1].lower()
            
            if file_type == "pdf":
                text_content = self._extract_pdf(file_path)
            elif file_type in ["docx", "doc"]:
                text_content = self._extract_docx(file_path)
            elif file_type == "txt":
                with open(file_path, 'r', encoding='utf-8') as f:
                    text_content = f.read()
            else:
                raise ValueError(f"Unsupported file type: {file_type}")
            
            if not text_content or len(text_content.strip()) < 10:
                raise ValueError(f"Could not extract text from {file.filename}")
            
            logger.info(f"✅ Processed {file.filename}: {len(text_content)} chars extracted")
            
            return {
                "filename": file.filename,
                "file_type": file_type,
                "content": text_content,
                "file_path": file_path,
                "size": len(content),
                "text_length": len(text_content)
            }
        except Exception as e:
            logger.error(f"❌ File processing failed for {file.filename}: {e}")
            # Clean up file on error
            if os.path.exists(file_path):
                os.remove(file_path)
            raise Exception(f"Failed to process {file.filename}: {str(e)}")

    def _extract_pdf(self, file_path: str) -> str:
        try:
            text = ""
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                
                if len(pdf_reader.pages) == 0:
                    raise ValueError("PDF has no pages")
                
                for page_num, page in enumerate(pdf_reader.pages):
                    try:
                        page_text = page.extract_text()
                        if page_text:
                            text += page_text + "\n"
                    except Exception as e:
                        logger.warning(f"Failed to extract page {page_num}: {e}")
                        continue
                
                if not text.strip():
                    raise ValueError("No text could be extracted from PDF")
                
            return text
        except Exception as e:
            logger.error(f"PDF extraction failed: {e}")
            raise ValueError(f"Could not read PDF: {str(e)}")

    def _extract_docx(self, file_path: str) -> str:
        try:
            doc = Document(file_path)
            text = "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
            
            if not text.strip():
                raise ValueError("No text found in document")
            
            return text
        except Exception as e:
            logger.error(f"DOCX extraction failed: {e}")
            raise ValueError(f"Could not read DOCX: {str(e)}")

    def cleanup_file(self, file_path: str):
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"🗑️ Cleaned up: {file_path}")
        except Exception as e:
            logger.error(f"Cleanup failed: {e}")

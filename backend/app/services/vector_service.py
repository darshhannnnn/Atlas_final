import chromadb
from chromadb.config import Settings
import logging
from typing import List, Dict, Any

logger = logging.getLogger("atlas.vector_service")


class VectorService:
    def __init__(self, persist_directory: str = "chroma_db"):
        try:
            self.client = chromadb.Client(Settings(
                persist_directory=persist_directory,
                anonymized_telemetry=False
            ))
            self.collection = self.client.get_or_create_collection(
                name="atlas_knowledge",
                metadata={"description": "ATLAS knowledge base"}
            )
            logger.info("✅ Vector DB initialized")
        except Exception as e:
            logger.error(f"❌ Vector DB initialization failed: {e}")
            self.client = None
            self.collection = None

    def add_documents(self, documents: List[str], metadatas: List[Dict] = None, ids: List[str] = None):
        if not self.collection:
            return
        
        try:
            if not ids:
                ids = [f"doc_{i}" for i in range(len(documents))]
            
            self.collection.add(
                documents=documents,
                metadatas=metadatas or [{}] * len(documents),
                ids=ids
            )
            logger.info(f"✅ Added {len(documents)} documents to vector DB")
        except Exception as e:
            logger.error(f"❌ Failed to add documents: {e}")

    def query(self, query_texts: List[str], n_results: int = 5) -> Dict[str, Any]:
        if not self.collection:
            return {"documents": [], "metadatas": [], "distances": []}
        
        try:
            results = self.collection.query(
                query_texts=query_texts,
                n_results=n_results
            )
            return results
        except Exception as e:
            logger.error(f"❌ Query failed: {e}")
            return {"documents": [], "metadatas": [], "distances": []}

    def clear(self):
        if self.collection:
            try:
                self.client.delete_collection("atlas_knowledge")
                self.collection = self.client.create_collection("atlas_knowledge")
                logger.info("🗑️ Vector DB cleared")
            except Exception as e:
                logger.error(f"❌ Clear failed: {e}")

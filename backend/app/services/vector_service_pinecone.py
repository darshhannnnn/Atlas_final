"""
Vector service with Pinecone support for serverless deployment
Falls back to ChromaDB for local development
"""
import logging
from typing import List, Dict, Any
import os

logger = logging.getLogger("atlas.vector_service")

# Try to import Pinecone
try:
    from pinecone import Pinecone, ServerlessSpec
    PINECONE_AVAILABLE = True
except ImportError:
    PINECONE_AVAILABLE = False
    logger.warning("⚠️ Pinecone not installed")

# Try to import ChromaDB as fallback
try:
    import chromadb
    from chromadb.config import Settings as ChromaSettings
    CHROMADB_AVAILABLE = True
except ImportError:
    CHROMADB_AVAILABLE = False
    logger.warning("⚠️ ChromaDB not installed")


class VectorService:
    """
    Vector database service supporting both Pinecone (serverless) and ChromaDB (local)
    """
    
    def __init__(self):
        """Initialize vector service with Pinecone or ChromaDB"""
        self.use_pinecone = False
        self.use_chromadb = False
        self.index = None
        self.collection = None
        
        # Try Pinecone first (for serverless)
        if PINECONE_AVAILABLE and os.getenv("PINECONE_API_KEY"):
            self._init_pinecone()
        
        # Fall back to ChromaDB (for local development)
        elif CHROMADB_AVAILABLE:
            self._init_chromadb()
        
        else:
            logger.error("❌ No vector database available (install pinecone-client or chromadb)")

    def _init_pinecone(self):
        """Initialize Pinecone vector database"""
        try:
            api_key = os.getenv("PINECONE_API_KEY")
            environment = os.getenv("PINECONE_ENVIRONMENT", "us-east-1")
            index_name = os.getenv("PINECONE_INDEX_NAME", "atlas-knowledge")
            
            pc = Pinecone(api_key=api_key)
            
            # Create index if it doesn't exist
            existing_indexes = [idx['name'] for idx in pc.list_indexes()]
            
            if index_name not in existing_indexes:
                logger.info(f"Creating Pinecone index: {index_name}")
                pc.create_index(
                    name=index_name,
                    dimension=384,  # all-MiniLM-L6-v2 dimension
                    metric="cosine",
                    spec=ServerlessSpec(
                        cloud="aws",
                        region=environment
                    )
                )
            
            self.index = pc.Index(index_name)
            self.use_pinecone = True
            logger.info("✅ Pinecone vector DB initialized")
            
        except Exception as e:
            logger.error(f"❌ Pinecone initialization failed: {e}")
            # Fall back to ChromaDB
            if CHROMADB_AVAILABLE:
                self._init_chromadb()

    def _init_chromadb(self):
        """Initialize ChromaDB vector database (local fallback)"""
        try:
            persist_directory = os.getenv("CHROMA_DB_DIR", "./chroma_db")
            
            client = chromadb.Client(ChromaSettings(
                persist_directory=persist_directory,
                anonymized_telemetry=False
            ))
            
            self.collection = client.get_or_create_collection(
                name="atlas_knowledge",
                metadata={"description": "ATLAS knowledge base"}
            )
            
            self.use_chromadb = True
            logger.info("✅ ChromaDB vector DB initialized (local)")
            
        except Exception as e:
            logger.error(f"❌ ChromaDB initialization failed: {e}")

    def add_documents(
        self,
        documents: List[str],
        metadatas: List[Dict] = None,
        ids: List[str] = None
    ):
        """
        Add documents to vector database
        
        Args:
            documents: List of text documents
            metadatas: Optional metadata for each document
            ids: Optional IDs for each document
        """
        if not documents:
            return
        
        try:
            if not ids:
                ids = [f"doc_{i}" for i in range(len(documents))]
            
            if not metadatas:
                metadatas = [{}] * len(documents)
            
            if self.use_pinecone:
                self._add_documents_pinecone(documents, metadatas, ids)
            elif self.use_chromadb:
                self._add_documents_chromadb(documents, metadatas, ids)
            else:
                logger.warning("⚠️ No vector database available")
                
        except Exception as e:
            logger.error(f"❌ Failed to add documents: {e}")

    def _add_documents_pinecone(
        self,
        documents: List[str],
        metadatas: List[Dict],
        ids: List[str]
    ):
        """Add documents to Pinecone"""
        # Note: You'll need to generate embeddings first
        # This is a placeholder - implement with your embedding model
        logger.warning("⚠️ Pinecone document addition requires embedding generation")
        
        # Example with sentence-transformers:
        # from sentence_transformers import SentenceTransformer
        # model = SentenceTransformer('all-MiniLM-L6-v2')
        # embeddings = model.encode(documents)
        # 
        # vectors = [
        #     {
        #         "id": ids[i],
        #         "values": embeddings[i].tolist(),
        #         "metadata": {**metadatas[i], "text": documents[i]}
        #     }
        #     for i in range(len(documents))
        # ]
        # 
        # self.index.upsert(vectors=vectors)
        # logger.info(f"✅ Added {len(documents)} documents to Pinecone")

    def _add_documents_chromadb(
        self,
        documents: List[str],
        metadatas: List[Dict],
        ids: List[str]
    ):
        """Add documents to ChromaDB"""
        self.collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )
        logger.info(f"✅ Added {len(documents)} documents to ChromaDB")

    def query(
        self,
        query_texts: List[str],
        n_results: int = 5
    ) -> Dict[str, Any]:
        """
        Query vector database for similar documents
        
        Args:
            query_texts: List of query texts
            n_results: Number of results to return
            
        Returns:
            Dict with documents, metadatas, and distances
        """
        try:
            if self.use_pinecone:
                return self._query_pinecone(query_texts, n_results)
            elif self.use_chromadb:
                return self._query_chromadb(query_texts, n_results)
            else:
                logger.warning("⚠️ No vector database available")
                return {"documents": [], "metadatas": [], "distances": []}
                
        except Exception as e:
            logger.error(f"❌ Query failed: {e}")
            return {"documents": [], "metadatas": [], "distances": []}

    def _query_pinecone(
        self,
        query_texts: List[str],
        n_results: int
    ) -> Dict[str, Any]:
        """Query Pinecone"""
        # Note: You'll need to generate embeddings first
        logger.warning("⚠️ Pinecone query requires embedding generation")
        
        # Example with sentence-transformers:
        # from sentence_transformers import SentenceTransformer
        # model = SentenceTransformer('all-MiniLM-L6-v2')
        # query_embeddings = model.encode(query_texts)
        # 
        # results = self.index.query(
        #     vector=query_embeddings[0].tolist(),
        #     top_k=n_results,
        #     include_metadata=True
        # )
        # 
        # return {
        #     "documents": [[match['metadata']['text'] for match in results['matches']]],
        #     "metadatas": [[match['metadata'] for match in results['matches']]],
        #     "distances": [[match['score'] for match in results['matches']]]
        # }
        
        return {"documents": [], "metadatas": [], "distances": []}

    def _query_chromadb(
        self,
        query_texts: List[str],
        n_results: int
    ) -> Dict[str, Any]:
        """Query ChromaDB"""
        results = self.collection.query(
            query_texts=query_texts,
            n_results=n_results
        )
        return results

    def clear(self):
        """Clear all documents from vector database"""
        try:
            if self.use_pinecone:
                self.index.delete(delete_all=True)
                logger.info("🗑️ Pinecone index cleared")
            elif self.use_chromadb:
                self.collection.delete()
                logger.info("🗑️ ChromaDB collection cleared")
        except Exception as e:
            logger.error(f"❌ Clear failed: {e}")

    def get_stats(self) -> Dict[str, Any]:
        """Get vector database statistics"""
        try:
            if self.use_pinecone:
                stats = self.index.describe_index_stats()
                return {
                    "backend": "pinecone",
                    "total_vectors": stats.get('total_vector_count', 0)
                }
            elif self.use_chromadb:
                count = self.collection.count()
                return {
                    "backend": "chromadb",
                    "total_vectors": count
                }
            else:
                return {"backend": "none", "total_vectors": 0}
        except Exception as e:
            logger.error(f"❌ Failed to get stats: {e}")
            return {"backend": "error", "total_vectors": 0}

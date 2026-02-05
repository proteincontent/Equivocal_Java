import requests
import uuid
from typing import List, Dict, Any, Optional
from langchain_core.documents import Document
from app.core.config import get_settings

settings = get_settings()

class CloudflareVectorStore:
    def __init__(self):
        self.account_id = settings.CF_ACCOUNT_ID
        self.cf_api_token = settings.CF_API_TOKEN
        self.index_name = settings.CF_VECTORIZE_INDEX
        
        # Embedding configuration
        self.embedding_api_key = settings.EMBEDDING_API_KEY
        self.embedding_api_base = settings.EMBEDDING_API_BASE
        self.embedding_model = settings.EMBEDDING_MODEL
        
        self.cf_base_url = "https://api.cloudflare.com/client/v4/accounts"
        self.cf_headers = {
            "Authorization": f"Bearer {self.cf_api_token}",
            "Content-Type": "application/json"
        }

    def _get_embedding(self, text: str) -> List[float]:
        """Generate embedding using 智谱 AI Embedding API"""
        url = f"{self.embedding_api_base}/embeddings"
        headers = {
            "Authorization": f"Bearer {self.embedding_api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.embedding_model,
            "input": text,
            "dimensions": settings.EMBEDDING_DIMENSION
        }
        
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        
        result = response.json()
        # 智谱 AI returns: {"data": [{"embedding": [...]}], ...}
        embedding = result.get("data", [{}])[0].get("embedding", [])
        return embedding

    def search(self, query: str, limit: int = 3) -> List[Document]:
        """Search similar documents"""
        try:
            # 1. Generate embedding for query
            query_vector = self._get_embedding(query)
            
            # 2. Query Vectorize (using v2 API)
            url = f"{self.cf_base_url}/{self.account_id}/vectorize/v2/indexes/{self.index_name}/query"
            payload = {
                "vector": query_vector,
                "topK": limit,
                "returnValues": False,
                "returnMetadata": "all"
            }
            
            response = requests.post(url, headers=self.cf_headers, json=payload)
            response.raise_for_status()
            
            matches = response.json().get("result", {}).get("matches", [])
            
            documents = []
            for match in matches:
                metadata = match.get("metadata", {})
                text = metadata.get("text", "")
                # Remove text from metadata to avoid duplication if needed, but keeping it is fine
                documents.append(Document(page_content=text, metadata=metadata))
                
            return documents
            
        except Exception as e:
            print(f"Error searching vector store: {e}")
            return []

    def insert_documents(self, documents: List[Document]):
        """Insert documents into Vectorize"""
        vectors = []
        
        for doc in documents:
            vector_id = str(uuid.uuid4())
            embedding = self._get_embedding(doc.page_content)
            
            # Vectorize metadata values must be strings
            metadata = doc.metadata.copy()
            metadata["text"] = doc.page_content # Store content in metadata to retrieve it later
            
            # Convert all metadata values to strings as Vectorize requires
            clean_metadata = {k: str(v) for k, v in metadata.items()}
            
            vectors.append({
                "id": vector_id,
                "values": embedding,
                "metadata": clean_metadata
            })
            
        # Batch insert using v2 API (Vectorize limits batch size, typically 1000, here we assume small batches)
        url = f"{self.cf_base_url}/{self.account_id}/vectorize/v2/indexes/{self.index_name}/insert"
        
        # Split into chunks if necessary (simple implementation for now)
        payload = {"vectors": vectors}
        
        response = requests.post(url, headers=self.cf_headers, json=payload)
        response.raise_for_status()
        return response.json()

# Global instance
# Note: This will fail instantiation if env vars are missing, which is expected
try:
    vector_store = CloudflareVectorStore()
except Exception:
    vector_store = None

def search_documents(query: str) -> List[Document]:
    if not vector_store:
        return []
    return vector_store.search(query)

def add_documents(documents: List[Document]):
    """Wrapper to insert documents into the vector store"""
    if not vector_store:
        return None
    return vector_store.insert_documents(documents)
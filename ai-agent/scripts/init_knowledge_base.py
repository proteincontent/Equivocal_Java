import os
import sys

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from app.services.vector_store import vector_store

def init_knowledge_base():
    print("Initializing Knowledge Base with Cloudflare Vectorize...")
    
    if not vector_store:
        print("Error: Vector store not initialized. Check your .env configuration.")
        return

    # 1. Load data
    file_path = os.path.join(os.path.dirname(__file__), "../data/legal_knowledge.md")
    if not os.path.exists(file_path):
        print(f"Error: Data file not found at {file_path}")
        return
        
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()
        
    # 2. Split text
    # We create a single document first
    doc = Document(page_content=text, metadata={"source": "legal_knowledge.md"})
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    
    splits = text_splitter.split_documents([doc])
    print(f"Split documents into {len(splits)} chunks.")
    
    # 3. Add to Vector Store (Cloudflare Vectorize)
    try:
        print("Inserting documents into Cloudflare Vectorize...")
        # Note: Depending on the number of splits, you might want to batch this loop
        # The vector_store.insert_documents method currently handles basic batching logic if implemented,
        # or we can rely on it to just work for small datasets.
        
        vector_store.insert_documents(splits)
        print("Successfully imported knowledge base to Cloudflare!")
        
    except Exception as e:
        print(f"Error importing data: {e}")

if __name__ == "__main__":
    init_knowledge_base()
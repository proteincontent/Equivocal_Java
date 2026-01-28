from langchain_core.tools import tool
from app.services.vector_store import search_documents

@tool
def legal_rag_search(query: str) -> str:
    """Search legal knowledge base for laws and regulations."""
    try:
        docs = search_documents(query)
        if not docs:
            return "No relevant legal documents found."
        
        result = "Relevant Legal References:\n\n"
        for i, doc in enumerate(docs):
            source = doc.metadata.get("source", "Unknown Source")
            result += f"--- Document {i+1} (Source: {source}) ---\n"
            result += doc.page_content + "\n\n"
            
        return result
    except Exception as e:
        return f"Error searching knowledge base: {str(e)}"

@tool
def legal_rag_info() -> str:
    """Get legal knowledge base status."""
    # This is a placeholder. Implementing actual stats requires accessing Chroma collection directly
    return "Legal Knowledge Base Status: Active. Contains laws, regulations, and standard contract templates."
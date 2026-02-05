from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from app.services.vector_store import add_documents
from langchain_community.document_loaders import PyPDFLoader, TextLoader, Docx2txtLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
import shutil
import os
import tempfile

router = APIRouter()

def process_and_index_file(file_path: str, filename: str):
    try:
        ext = os.path.splitext(filename)[1].lower()
        
        if ext == ".pdf":
            loader = PyPDFLoader(file_path)
        elif ext == ".docx":
            loader = Docx2txtLoader(file_path)
        elif ext in [".txt", ".md"]:
            loader = TextLoader(file_path, encoding='utf-8')
        else:
            print(f"Skipping unsupported file: {filename}")
            return

        docs = loader.load()
        
        # Split text
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.split_documents(docs)
        
        # Add metadata
        for doc in splits:
            doc.metadata["source"] = filename
            
        # Add to vector store
        add_documents(splits)
        print(f"Successfully indexed {filename}")
        
    except Exception as e:
        print(f"Error indexing {filename}: {str(e)}")
    finally:
        if os.path.exists(file_path):
            os.unlink(file_path)

@router.post("/ingest")
async def ingest_document(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """
    Upload and ingest a document into the knowledge base (Vector Store).
    """
    try:
        # Save to temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name
            
        # Run indexing in background
        background_tasks.add_task(process_and_index_file, tmp_path, file.filename)
        
        return {"message": f"File {file.filename} received and processing started."}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
from fastapi import APIRouter, UploadFile, File, HTTPException
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from app.services.storage import storage_service
from app.services.vector_store import vector_store
from app.tools.ocr import extract_text_from_file
import shutil
import os
import tempfile

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Upload a file to R2, extract text, and ingest into Vector Store (RAG).
    Returns the file URL and extracted text.
    """
    try:
        # Create a temp file to store the upload
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name
            
        # Read file content for upload
        with open(tmp_path, "rb") as f:
            file_content = f.read()
            
        # Upload to R2
        url = storage_service.upload_file(file_content, file.filename, file.content_type)
        
        # Extract text
        extracted_text = extract_text_from_file(tmp_path)
        
        # Ingest into Vector Store (RAG)
        if extracted_text and vector_store:
            try:
                # Create Document
                doc = Document(
                    page_content=extracted_text,
                    metadata={
                        "source": url,
                        "filename": file.filename
                    }
                )
                
                # Split text
                text_splitter = RecursiveCharacterTextSplitter(
                    chunk_size=1000,
                    chunk_overlap=200
                )
                splits = text_splitter.split_documents([doc])
                
                # Insert into Vectorize
                vector_store.insert_documents(splits)
                print(f"Successfully ingested {len(splits)} chunks from {file.filename} into Vector Store.")
                
            except Exception as e:
                print(f"Error ingesting file into Vector Store: {e}")
                # We don't fail the upload if RAG ingestion fails, just log it
        
        # Clean up
        os.unlink(tmp_path)
        
        return {
            "url": url,
            "filename": file.filename,
            "extracted_text": extracted_text,
            "rag_ingested": bool(extracted_text and vector_store)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
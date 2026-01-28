import os
import requests
import tempfile
from pypdf import PdfReader
from langchain_core.tools import tool
import io

# Optional: Import EasyOCR only if needed to save startup time/memory if not used
try:
    import easyocr
    EASYOCR_AVAILABLE = True
except ImportError:
    EASYOCR_AVAILABLE = False
    print("EasyOCR not installed. Image OCR will not work.")

# Initialize EasyOCR reader lazily
_reader = None

def get_ocr_reader():
    global _reader
    if _reader is None and EASYOCR_AVAILABLE:
        # Initialize for Chinese and English
        _reader = easyocr.Reader(['ch_sim', 'en'])
    return _reader

@tool
def extract_text_from_file(file_path_or_url: str) -> str:
    """Extract text from PDF, Image, or text files. Accepts local path or URL."""
    # Handle URL
    temp_file = None
    file_path = file_path_or_url
    
    if file_path_or_url.startswith("http://") or file_path_or_url.startswith("https://"):
        try:
            response = requests.get(file_path_or_url, stream=True)
            response.raise_for_status()
            
            # Try to guess extension from URL or Content-Type
            import mimetypes
            content_type = response.headers.get('content-type')
            ext = mimetypes.guess_extension(content_type) or ""
            if not ext:
                # Fallback to URL path
                from urllib.parse import urlparse
                path = urlparse(file_path_or_url).path
                ext = os.path.splitext(path)[1]

            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
            for chunk in response.iter_content(chunk_size=8192):
                temp_file.write(chunk)
            temp_file.close()
            file_path = temp_file.name
        except Exception as e:
            return f"Error downloading file: {str(e)}"

    if not os.path.exists(file_path):
        return "Error: File not found."
    
    ext = os.path.splitext(file_path)[1].lower()
    
    if ext == ".pdf":
        try:
            reader = PdfReader(file_path)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text
        except Exception as e:
            return f"Error extracting PDF: {str(e)}"
            
    elif ext in [".jpg", ".jpeg", ".png", ".bmp"]:
        if not EASYOCR_AVAILABLE:
            return "Error: OCR library not available."
        
        try:
            reader = get_ocr_reader()
            result = reader.readtext(file_path, detail=0)
            return "\n".join(result)
        except Exception as e:
            return f"Error performing OCR: {str(e)}"
            
    elif ext in [".txt", ".md"]:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            return f"Error reading text file: {str(e)}"
            
    else:
        return f"Unsupported file type: {ext}"
    
    # Cleanup temp file if created
    if temp_file:
        try:
            os.unlink(temp_file.name)
        except:
            pass
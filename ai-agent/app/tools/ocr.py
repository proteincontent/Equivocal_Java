import os
import requests
import tempfile
from pypdf import PdfReader
from langchain_core.tools import tool
import io

# NOTE:
# EasyOCR -> torch/torchvision 在 Windows + Python 3.13 上可能导入很慢或不兼容。
# 为避免“启动即卡死/崩溃”，这里做彻底懒加载：只有真正处理图片 OCR 时才尝试导入。
EASYOCR_AVAILABLE = None
EASYOCR_IMPORT_ERROR = None

# Initialize EasyOCR reader lazily
_reader = None

def get_ocr_reader():
    global _reader
    global EASYOCR_AVAILABLE, EASYOCR_IMPORT_ERROR

    if os.getenv("DISABLE_OCR", "").lower() in {"1", "true", "yes"}:
        EASYOCR_AVAILABLE = False
        EASYOCR_IMPORT_ERROR = "DISABLE_OCR is set"
        return None

    if _reader is None:
        try:
            import easyocr  # noqa: WPS433 (runtime import intentional)

            # Initialize for Chinese and English
            _reader = easyocr.Reader(["ch_sim", "en"])
            EASYOCR_AVAILABLE = True
        except Exception as e:  # ImportError/RuntimeError/OS error, etc.
            EASYOCR_AVAILABLE = False
            EASYOCR_IMPORT_ERROR = str(e)
            return None
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
        try:
            reader = get_ocr_reader()
            if reader is None:
                hint = (
                    f"Error: OCR library not available ({EASYOCR_IMPORT_ERROR}).\n"
                    "提示：这是可选能力；你仍可正常使用对话/文档生成/RAG。\n"
                    "如需 OCR：建议使用 Python 3.11 并安装与之匹配的 torch/torchvision，或移除 DISABLE_OCR。\n"
                )
                return hint
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

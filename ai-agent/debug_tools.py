from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

from langchain_core.utils.function_calling import convert_to_openai_tool
from app.tools.rag import legal_rag_search, legal_rag_info
from app.tools.ocr import extract_text_from_file
from app.tools.doc_generator import generate_legal_document, list_supported_documents
import json

# Define tools list
tools = [
    extract_text_from_file,
    generate_legal_document,
    list_supported_documents,
    legal_rag_search,
    legal_rag_info
]

# Convert all tools to OpenAI format and print them
print("Tool Schemas:")
for tool in tools:
    tool_schema = convert_to_openai_tool(tool)
    print(f"\n--- {tool.name} ---")
    print(json.dumps(tool_schema, indent=2, ensure_ascii=False))
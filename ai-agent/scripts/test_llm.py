"""Test LLM with tools to debug the 400 error"""
import os
import sys
import json

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage, ToolMessage

# Import actual tools
from app.tools.doc_generator import generate_legal_document, list_supported_documents
from app.tools.rag import legal_rag_search, legal_rag_info

# Get settings
from app.core.config import get_settings
settings = get_settings()

print(f"API Base: {settings.LLM_API_BASE}")
print(f"Model: {settings.LLM_MODEL}")
print()

# Create LLM
llm = ChatOpenAI(
    model=settings.LLM_MODEL,
    openai_api_key=settings.LLM_API_KEY,
    openai_api_base=settings.LLM_API_BASE,
    temperature=0.7,
    max_tokens=500
)

# All tools
all_tools = [
    generate_legal_document,
    list_supported_documents,
    legal_rag_search,
    legal_rag_info
]

SYSTEM_PROMPT = """你是专业法律智能助手，提供合同分析、文书生成和法律咨询服务。

核心能力：
1. 文书生成：用 generate_legal_document 生成 Word 文档
2. 法律咨询：用 legal_rag_search 查询法律条文

保持专业、客观、准确。使用中文交流。"""

# Test with all tools AND system prompt (matching agent.py)
print("=== Test 1: First LLM call (should trigger tool) ===")
llm_with_tools = llm.bind_tools(all_tools)

messages = [
    SystemMessage(content=SYSTEM_PROMPT),
    HumanMessage(content="什么是民法典")
]

try:
    response = llm_with_tools.invoke(messages)
    print(f"Response content: {response.content[:100] if response.content else 'No content'}")
    print(f"Tool calls: {response.tool_calls}")
    
    # If there are tool calls, simulate the second round
    if response.tool_calls:
        print("\n=== Test 2: Second LLM call (after tool execution) ===")
        
        # Add AI response to messages
        messages.append(response)
        
        # Simulate tool result
        for tool_call in response.tool_calls:
            tool_result = f"模拟工具结果: {tool_call['name']} 执行成功"
            messages.append(ToolMessage(
                content=tool_result,
                tool_call_id=tool_call["id"]
            ))
        
        print(f"Messages count: {len(messages)}")
        print(f"Message types: {[type(m).__name__ for m in messages]}")
        
        # Call LLM again with tool results
        try:
            response2 = llm_with_tools.invoke(messages)
            print(f"Success! Response: {response2.content[:200] if response2.content else 'No content'}")
        except Exception as e2:
            print(f"Error on second call: {e2}")
            import traceback
            traceback.print_exc()
            
except Exception as e:
    print(f"Error on first call: {e}")
    import traceback
    traceback.print_exc()

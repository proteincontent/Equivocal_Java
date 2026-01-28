from typing import Annotated, TypedDict, Union, List
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage, ToolMessage
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode, tools_condition
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from app.services.llm import get_llm
from app.tools.ocr import extract_text_from_file
from app.tools.doc_generator import generate_legal_document, list_supported_documents
from app.tools.rag import legal_rag_search, legal_rag_info
from app.core.config import get_settings

# Define the state of the agent
class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], "The conversation history"]

# Define tools list
tools = [
    extract_text_from_file,
    generate_legal_document,
    list_supported_documents,
    legal_rag_search,
    legal_rag_info
]

# System Prompt - 意图识别增强版
SYSTEM_PROMPT = """你是一位专业、温暖的法律AI助手。你的首要任务是**理解用户的真实需求**，而不是机械执行。

## 意图识别规则（按优先级排序）

### 1️⃣ 法律咨询（最常见）
**触发条件**：用户在描述情况、提出疑问、寻求建议时
- 关键词：怎么办、合理吗、合法吗、该怎么、能不能、如何、可以吗、有权吗
- 用户描述了一个问题或困境，但没有明确要求"生成文档"

**处理方式**：
- 首先**直接回答用户的问题**，用通俗易懂的语言解释法律规定
- 必要时调用 `legal_rag_search` 检索相关法规作为依据
- 给出具体可行的建议和步骤
- 语气要专业但有温度，让用户感到被理解

### 2️⃣ 文档生成
**触发条件**：用户**明确**要求生成/起草/写/给我一份文档时
- 关键词：帮我写、起草一份、生成、给我一份、要一个、写一份、拟一份
- 例如："帮我写一份租房合同"、"给我一份离职申请模板"

**处理方式**：
- 调用 `generate_legal_document` 工具
- `title`: 文档标题
- `content`: 完整的法律条款内容
- 用 [待定] 标记缺失的具体信息

### 3️⃣ 一般对话
**触发条件**：用户打招呼、闲聊、感谢等
**处理方式**：友好简洁地回应

## ⚠️ 重要提醒
- **不要**把"咨询问题"误判为"请求生成文档"
- 当用户问"怎么办"时，他们需要的是**解答和建议**，不是一份文档
- 只有当用户**明确说**"帮我写/生成/起草一份xxx"时，才生成文档
- 回答要有人情味，不要冷冰冰的

## 示例

❌ 错误：
用户："房东不退押金怎么办？" → 生成一份合同 （错！用户在咨询，不是要文档）

✅ 正确：
用户："房东不退押金怎么办？" → 解释押金退还的法律规定，告诉用户可以采取的维权步骤
用户："帮我写一份租房合同" → 调用 generate_legal_document 生成合同"""

def create_agent_graph():
    # Initialize LLM with tools
    settings = get_settings()
    llm = get_llm()
    llm_with_tools = llm.bind_tools(tools)
    
    print(f"INFO: Tools are ENABLED with model: {settings.LLM_MODEL}")
    print("  Available tools: OCR, Document Generation, RAG Search, Legal Info")

    # Define the chatbot node
    def chatbot(state: AgentState):
        messages = state["messages"]
        
        # 后处理：检查是否刚执行完文档生成工具
        last_msg = messages[-1] if messages else None
        # 检测中文和英文两种格式的文档生成输出
        if isinstance(last_msg, ToolMessage) and (
            "文档已生成完成" in last_msg.content or
            "点击下载" in last_msg.content or
            "Download link:" in last_msg.content or
            "[Download" in last_msg.content
        ):
            # 直接使用工具输出，跳过模型二次处理
            print(f"DEBUG: Post-processing - tool output: {last_msg.content}")
            return {"messages": [AIMessage(content=last_msg.content)]}
        
        # Ensure system prompt is present
        if not isinstance(messages[0], SystemMessage):
            messages.insert(0, SystemMessage(content=SYSTEM_PROMPT))
            
        response = llm_with_tools.invoke(messages)
        
        # Debug: Log tool calls
        if hasattr(response, 'tool_calls') and response.tool_calls:
            print(f"DEBUG: Tool calls detected: {response.tool_calls}")
        else:
            print(f"DEBUG: No tool calls. Content: {response.content[:100] if response.content else 'Empty'}")
        
        return {"messages": [response]}

    # Build the graph
    graph_builder = StateGraph(AgentState)
    
    graph_builder.add_node("chatbot", chatbot)
    graph_builder.add_node("tools", ToolNode(tools))
    
    graph_builder.set_entry_point("chatbot")
    
    graph_builder.add_conditional_edges(
        "chatbot",
        tools_condition,
    )
    
    graph_builder.add_edge("tools", "chatbot")
    
    return graph_builder.compile()

# Initialize the graph
agent_executor = create_agent_graph()
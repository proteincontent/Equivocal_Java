import os
import json
from typing import List, Dict, Any, TypedDict, Annotated, Sequence
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv

from langchain_openai import ChatOpenAI
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langgraph.graph import StateGraph, END

load_dotenv()

app = FastAPI()

# 配置 LongCat 模型 - 用于普通法律对话
llm = ChatOpenAI(
    model=os.getenv("LONGCAT_MODEL"),
    openai_api_key=os.getenv("LONGCAT_API_KEY"),
    openai_api_base=os.getenv("LONGCAT_BASE_URL"),
    streaming=True
)

# 配置视觉模型 - 用于文档/图片处理（未来扩展）
# vision_llm = ChatOpenAI(
#     model=os.getenv("VISION_MODEL"),
#     openai_api_key=os.getenv("MODELSCOPE_API_KEY"),
#     openai_api_base=os.getenv("MODELSCOPE_BASE_URL"),
#     streaming=True
# )

# 定义状态
class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], lambda x, y: x + y]
    service_type: str  # 法律咨询, 合同起草, 合规审查, 案例检索

# --- 节点实现 ---

def router_node(state: AgentState):
    """路由节点：基于关键词判断用户意图（不调用 LLM，避免限流）"""
    last_message = state["messages"][-1].content.lower()
    
    # 合同起草关键词
    draft_keywords = ["起草", "草拟", "写一份", "帮我写", "生成", "借条", "合同", "协议", "欠条", "声明", "授权书"]
    # 合规审查关键词
    check_keywords = ["审查", "审核", "检查", "风险", "问题", "合规", "霸王条款", "不公平"]
    # 案例检索关键词
    case_keywords = ["案例", "判例", "案件", "法院", "判决", "裁定"]
    
    service_type = "法律咨询"  # 默认
    
    for kw in draft_keywords:
        if kw in last_message:
            service_type = "合同起草"
            break
    
    if service_type == "法律咨询":
        for kw in check_keywords:
            if kw in last_message:
                service_type = "合规审查"
                break
    
    if service_type == "法律咨询":
        for kw in case_keywords:
            if kw in last_message:
                service_type = "案例检索"
                break
        
    return {"service_type": service_type}

async def generator_node(state: AgentState):
    """文书生成节点"""
    prompt = ChatPromptTemplate.from_messages([
        ("system", """你是一位专业且权威的法律文书处理专家。
你的任务是根据用户提供的具体信息，生成格式规范、要素完备的法律文书（如借条、房屋租赁合同、保密协议等）。

## 技能：生成法律文书
1. 若用户信息不全，主动询问具体要素（如借款人、金额、利息、还款日期等）。
2. 凭借深厚的法律知识积累，生成相应格式规范、要素齐全的法律文书，并在文书中清晰准确地标注所依据的法律条款。
3. 输出结果应条理清晰、准确无误。"""),
        MessagesPlaceholder(variable_name="messages"),
    ])
    chain = prompt | llm
    response = await llm.ainvoke(await prompt.ainvoke({"messages": state["messages"]}))
    return {"messages": [response]}

async def checker_node(state: AgentState):
    """合同审查节点"""
    prompt = ChatPromptTemplate.from_messages([
        ("system", """你是一位专业且权威的法律合同审查专家。
你的任务是对用户上传或输入的合同进行细致入微的审查，精准识别其中的问题条款。

## 技能：审查合同
1. 扫描合同内容，识别“霸王条款”、“不公平条款”或“风险点”。
2. 用醒目的高亮颜色或标注指出风险。
3. 针对每个风险点，从法律知识储备中获取依据，用通俗易懂的语言解释为什么对用户不利，并给出切实合理的修改建议。
4. 确保所引用的法律条款准确可靠。"""),
        MessagesPlaceholder(variable_name="messages"),
    ])
    chain = prompt | llm
    response = await llm.ainvoke(await prompt.ainvoke({"messages": state["messages"]}))
    return {"messages": [response]}

async def advisor_node(state: AgentState):
    """法律咨询/通用建议节点"""
    prompt = ChatPromptTemplate.from_messages([
        ("system", "你是一位专业的法律顾问。请根据用户的咨询提供专业的法律建议。"),
        MessagesPlaceholder(variable_name="messages"),
    ])
    chain = prompt | llm
    response = await llm.ainvoke(await prompt.ainvoke({"messages": state["messages"]}))
    return {"messages": [response]}

# --- 构建 LangGraph ---

workflow = StateGraph(AgentState)

workflow.add_node("router", router_node)
workflow.add_node("generator", generator_node)
workflow.add_node("checker", checker_node)
workflow.add_node("advisor", advisor_node)

workflow.set_entry_point("router")

def route_by_type(state: AgentState):
    if state["service_type"] == "合同起草":
        return "generator"
    elif state["service_type"] == "合规审查":
        return "checker"
    else:
        return "advisor"

workflow.add_conditional_edges(
    "router",
    route_by_type,
    {
        "generator": "generator",
        "checker": "checker",
        "advisor": "advisor"
    }
)

workflow.add_edge("generator", END)
workflow.add_edge("checker", END)
workflow.add_edge("advisor", END)

graph = workflow.compile()

# --- API 定义 ---

class ChatRequest(BaseModel):
    messages: List[Dict[str, Any]]  # 改为 Any 以容忍 Java 传来的 content_type 等字段
    stream: bool = True

async def stream_generator(messages):
    print(f"DEBUG: Received messages: {json.dumps(messages, ensure_ascii=False)}")
    # 转换消息格式
    langchain_messages = []
    for m in messages:
        if m["role"] == "user":
            langchain_messages.append(HumanMessage(content=m["content"]))
        elif m["role"] == "assistant":
            langchain_messages.append(AIMessage(content=m["content"]))
        else:
            langchain_messages.append(SystemMessage(content=m["content"]))

    # 初始状态
    inputs = {"messages": langchain_messages}
    
    # 使用 astream 处理流式输出
    # 注意：LangGraph 的 astream 返回的是节点更新。
    # 为了简化，我们直接调用具体的节点链进行流式处理，或者在这里简单处理。
    
    # 这里的实现为了兼容前端的 Coze 格式：
    # data: {"type": "content", "content": "..."}
    
    # 先发送一个 session 事件（模拟）
    yield f"data: {json.dumps({'type': 'session', 'sessionId': 'langgraph-session'})}\n\n"
    
    # 运行图并获取最终节点
    # 为了真正的流式，通常需要更细粒度的控制。
    # 这里我们先实现一个基础的流式逻辑
    
    # 使用 astream_events 实现真正的节点内流式输出
    # 这样用户可以立即看到路由结果和生成的文字
    try:
        async for event in graph.astream_events(inputs, version="v1"):
            kind = event["event"]
            
            # 捕获 LLM 产生的 token
            if kind == "on_chat_model_stream":
                content = event["data"]["chunk"].content
                if content:
                    yield f"data: {json.dumps({'type': 'content', 'content': content})}\n\n"
            
            # 捕获路由决策（用于调试日志）
            elif kind == "on_chain_end" and event["name"] == "router":
                service_type = event["data"]["output"].get("service_type")
                print(f"DEBUG: Routed to {service_type}")

    except Exception as e:
        print(f"ERROR during graph execution: {str(e)}")
        yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
            
    yield "data: [DONE]\n\n"

@app.post("/api/chat")
async def chat(request: ChatRequest):
    return StreamingResponse(
        stream_generator(request.messages),
        media_type="text/event-stream",
        headers={"Content-Type": "text/event-stream; charset=utf-8"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
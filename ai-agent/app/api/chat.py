from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from app.graph.agent import agent_executor
import json
import asyncio

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str
    content_type: Optional[str] = "text"

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    user_id: Optional[str] = None
    stream: bool = True

def format_sse(data: str, event: str = None) -> str:
    msg = f"data: {data}\n\n"
    if event:
        msg = f"event: {event}\n{msg}"
    return msg

@router.post("/completions")
async def chat_completions(request: ChatRequest):
    """
    Chat completion endpoint supporting streaming.
    Compatible with Coze-like message structure.
    """
    
    # Convert messages to LangChain format
    lc_messages = []
    for msg in request.messages:
        content = msg.content
        
        # Handle object_string content type (Coze format for files)
        if msg.content_type == "object_string":
            try:
                parts = json.loads(msg.content)
                text_parts = []
                file_parts = []
                
                for part in parts:
                    if part.get("type") == "text":
                        text_parts.append(part.get("text", ""))
                    elif part.get("type") in ["file", "image"]:
                        # Assuming file_id is the URL or we need to resolve it
                        file_id = part.get("file_id", "")
                        file_parts.append(f"[File/Image: {file_id}]")
                        
                # Combine text and file references
                combined_content = "\n".join(text_parts + file_parts)
                if combined_content:
                    content = combined_content
            except json.JSONDecodeError:
                # Fallback to raw content if parsing fails
                pass
                
        if msg.role == "user":
            lc_messages.append(HumanMessage(content=content))
        elif msg.role == "assistant":
            lc_messages.append(AIMessage(content=content))
        elif msg.role == "system":
            lc_messages.append(SystemMessage(content=content))
            
    inputs = {"messages": lc_messages}

    async def event_generator():
        try:
            print(f"DEBUG: Starting stream for inputs: {inputs}")
            # Stream events from the graph
            async for event in agent_executor.astream_events(inputs, version="v1"):
                kind = event["event"]
                # print(f"DEBUG: Event received: {kind} - Name: {event.get('name')}")
                
                # Stream LLM tokens
                if kind == "on_chat_model_stream":
                    content = event["data"]["chunk"].content
                    if content:
                        # Use "content" type to match Java backend expectations
                        payload = json.dumps({
                            "type": "content",
                            "content": content,
                            "role": "assistant"
                        }, ensure_ascii=False)
                        yield format_sse(payload)
                
                # IMPORTANT: Handle chain output (for tool results that are manually wrapped in AIMessage)
                # We need to catch the output of the 'chatbot' node specifically when it bypasses the LLM
                elif kind == "on_chain_end" and event.get("name") == "chatbot":
                    output = event["data"].get("output")
                    # Check if output is a dict with 'messages' key (AgentState)
                    if output and isinstance(output, dict) and "messages" in output:
                        messages = output["messages"]
                        if messages and isinstance(messages, list):
                            last_message = messages[-1]
                            # Check if it's an AIMessage with content that we haven't streamed yet
                            # This usually happens when we short-circuit the LLM in the chatbot node
                            # 检测中文和英文两种格式的文档生成输出
                            if hasattr(last_message, "content") and (
                                "文档已生成完成" in last_message.content or
                                "点击下载" in last_message.content or
                                "Download link:" in last_message.content or
                                "[Download" in last_message.content
                            ):
                                print(f"DEBUG: Found direct chatbot output: {last_message.content}")
                                payload = json.dumps({
                                    "type": "content",
                                    "content": last_message.content,
                                    "role": "assistant"
                                }, ensure_ascii=False)
                                yield format_sse(payload)

                # Notify tool usage (optional)
                elif kind == "on_tool_start":
                    tool_name = event["name"]
                    payload = json.dumps({
                        "type": "tool",
                        "content": f"正在调用工具: {tool_name}..."
                    }, ensure_ascii=False)
                    yield format_sse(payload)
                    
            # Send Done signal
            yield format_sse("[DONE]")
            
        except Exception as e:
            error_payload = json.dumps({
                "type": "error",
                "message": str(e)
            })
            yield format_sse(error_payload)

    if request.stream:
        return StreamingResponse(event_generator(), media_type="text/event-stream")
    else:
        # Non-streaming implementation
        result = await agent_executor.ainvoke(inputs)
        last_message = result["messages"][-1]
        return {
            "choices": [{
                "message": {
                    "role": "assistant",
                    "content": last_message.content
                }
            }]
        }
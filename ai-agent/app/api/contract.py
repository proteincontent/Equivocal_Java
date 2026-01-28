from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from app.services.llm import get_llm
import json
import re

router = APIRouter()

class ContractReviewRequest(BaseModel):
    text: str = Field(..., description="The full text of the contract to review")

class RiskPoint(BaseModel):
    id: str = Field(..., description="Unique identifier for the risk")
    level: str = Field(..., description="Risk level: 'high', 'medium', or 'safe'")
    title: str = Field(..., description="Short title of the risk")
    description: str = Field(..., description="Detailed explanation of the risk")
    originalText: str = Field(..., description="The exact text segment from the contract that contains the risk. MUST match exactly.")
    suggestion: Optional[str] = Field(None, description="Suggested modification")
    category: str = Field(..., description="Category of the risk (e.g., '违约责任', '管辖法院')")

class ContractReviewResponse(BaseModel):
    risks: List[RiskPoint]

def _extract_json_object(text: str) -> str:
    text = text.strip()
    if text.startswith("{") and text.endswith("}"):
        return text

    match = re.search(r"\{[\s\S]*\}", text)
    if not match:
        raise ValueError("No JSON object found in model output")
    return match.group(0)

def _validate_contract_review_response(payload: object) -> ContractReviewResponse:
    if hasattr(ContractReviewResponse, "model_validate"):
        return ContractReviewResponse.model_validate(payload)  # type: ignore[attr-defined]
    return ContractReviewResponse.parse_obj(payload)  # type: ignore[attr-defined]

@router.post("/review", response_model=ContractReviewResponse)
async def review_contract(request: ContractReviewRequest):
    """
    Review a contract and identify risks using LLM.
    Returns a structured JSON list of risks.
    """
    try:
        llm = get_llm(temperature=0.1) # Use low temperature for consistent output
        
        parser = JsonOutputParser(pydantic_object=ContractReviewResponse)
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """你是一位经验丰富的资深法律顾问，擅长审查各类合同风险。
你的任务是审查用户提供的合同文本，识别其中的风险点、不合理的条款以及值得保留的权益保障条款。

请严格按照以下 JSON 格式返回审查结果：
{{
    "risks": [
        {{
            "id": "r1",
            "level": "high" | "medium" | "safe",
            "title": "简短的风险标题",
            "description": "详细的风险解释，说明可能造成的后果",
            "originalText": "原文中完全一致的文本片段（非常重要，用于前端定位，必须完全匹配原文）",
            "suggestion": "具体的修改建议（如果是 safe 类型则可为空）",
            "category": "风险类别，如：期限约定、薪资福利、违约责任、解约条款、争议解决等"
        }}
    ]
}}

要求：
1. **originalText** 必须是合同原文中**连续的、完全一致**的字符串，不要缩写，不要修改标点符号。
2. 至少找出 3-5 个关键点，包含高风险（high）、中风险（medium）和权益保障（safe）。
3. "safe" 类型用于标注合同中对乙方（通常是弱势方）有利的条款，给予正面反馈。
4. 语言风格专业、客观、直击要害。

{format_instructions}
"""),
            ("user", "{text}")
        ])

        chain = prompt | llm | parser
        
        # Limit text length to avoid token limits if necessary
        # For now, we assume the text fits in the context window
        truncated_text = request.text[:15000]  # Simple truncation protection
        result = await chain.ainvoke({
            "text": truncated_text,
            "format_instructions": parser.get_format_instructions()
        })
        
        return result

    except Exception as e:
        # Fallback: some OpenAI-compatible providers return non-JSON text (markdown, extra prose, etc.).
        # We try one more time and parse/validate manually to reduce 500s.
        try:
            parser = JsonOutputParser(pydantic_object=ContractReviewResponse)
            llm_fallback = get_llm(temperature=0.0)
            prompt = ChatPromptTemplate.from_messages([
                ("system", """你是一位经验丰富的资深法律顾问，擅长审查各类合同风险。
你的任务是审查用户提供的合同文本，识别其中的风险点、不合理的条款以及值得保留的权益保障条款。

请严格按照 JSON 返回审查结果，不要输出 Markdown、解释性文字或多余字段，只输出一个 JSON 对象：
{format_instructions}
"""),
                ("user", "{text}")
            ])

            messages = prompt.format_messages(
                text=request.text[:15000],
                format_instructions=parser.get_format_instructions(),
            )
            raw = await llm_fallback.ainvoke(messages)
            content = raw.content if hasattr(raw, "content") else str(raw)

            json_text = _extract_json_object(content)
            payload = json.loads(json_text)
            validated = _validate_contract_review_response(payload)
            return validated
        except Exception as fallback_error:
            print(f"Error reviewing contract: {e}")
            raw_preview = ""
            try:
                raw_preview = str(fallback_error)[:600]
            except Exception:
                raw_preview = ""
            raise HTTPException(
                status_code=500,
                detail=f"{type(e).__name__}: {e}; fallback_failed={type(fallback_error).__name__}: {raw_preview}",
            )

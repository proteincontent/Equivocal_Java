# LLM API 兼容性问题报告

## 问题概述

用户提供的 LLM API (`https://newone.qqun.top/v1`) 存在严重的 OpenAI 兼容性问题，导致大部分功能无法正常运行。

## API 信息

- **Base URL**: `https://newone.qqun.top/v1`
- **模型**: `gemini-claude-opus-4-5-thinking(32768)`
- **声称兼容**: OpenAI API

## 测试结果

### ✅ 成功的请求

```bash
curl -X POST http://localhost:8100/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"你好"}],"stream":false}'
```

**结果**: 200 OK，正常返回响应

### ❌ 失败的请求

#### 1. 工具绑定（Tools Binding）

```python
llm.bind_tools(tools)  # 失败
```

**错误**: `400 - Request contains an invalid argument`

**原因**: API 不支持或不完全支持 OpenAI 的 Function Calling/Tools 格式

#### 2. 特定内容的请求

```bash
curl -X POST http://localhost:8100/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"什么是民法典"}],"stream":false}'
```

**错误**: `400 - Request contains an invalid argument`

**可能原因**:

- System Prompt 过长
- 对某些关键词敏感（内容审查）
- 请求参数格式问题

## 影响范围

### 🚫 **完全无法使用的功能**

1. **工具调用** - 核心功能受损
   - OCR 文本提取 (`extract_text_from_file`)
   - 文档生成 (`generate_legal_document`)
   - RAG 搜索 (`legal_rag_search`)
   - 知识库查询 (`legal_rag_info`)

2. **复杂对话** - 部分法律咨询可能触发敏感词检测

### ⚠️ **部分可用的功能**

1. **简单对话** - 基础问候和简单问题可以响应
2. **Java 后端集成** - 集成代码正确，问题在于 LLM API

## 当前状态

**系统已降级为"纯对话模式"**，所有工具调用功能被禁用。

```python
# ai-agent/app/graph/agent.py
use_tools = False  # 强制禁用工具
```

**启动时警告**:

```
WARNING: Tools are currently DISABLED due to LLM API incompatibility
  The system will run in chat-only mode without tool calling capabilities
  Tools affected: OCR, Document Generation, RAG Search
```

## 解决方案

### 方案 1: 更换 LLM API（推荐）

使用真正兼容 OpenAI 的 API 提供商：

| 提供商          | 兼容性  | 价格 | 备注                  |
| --------------- | ------- | ---- | --------------------- |
| OpenAI 官方     | ✅ 完美 | 较高 | 原生支持所有特性      |
| Azure OpenAI    | ✅ 完美 | 中等 | 企业级，稳定          |
| 智谱 AI (GLM-4) | ✅ 良好 | 低   | 支持 Function Calling |
| 通义千问        | ✅ 良好 | 低   | 支持工具调用          |
| DeepSeek        | ✅ 良好 | 极低 | 性价比高              |

**修改步骤**:

```bash
# 编辑 ai-agent/.env
LLM_API_BASE=https://api.openai.com/v1  # 或其他兼容API
LLM_MODEL=gpt-4-turbo
LLM_API_KEY=sk-xxxxx
```

### 方案 2: 实现 ReAct 模式（工作量大）

不依赖 API 的 Function Calling 特性，通过 Prompt Engineering 实现工具调用：

```python
# 伪代码示例
REACT_PROMPT = """
你可以使用以下工具：
1. search_law(query) - 搜索法律条文
2. generate_doc(type, data) - 生成文档

思考步骤：
1. Thought: 我需要做什么？
2. Action: 使用什么工具？
3. Action Input: 工具参数
4. Observation: 工具返回结果
5. Answer: 最终回复用户

示例：
User: 帮我查询民法典第一条
Thought: 需要搜索法律条文
Action: search_law
Action Input: {"query": "民法典第一条"}
...
"""
```

**工作量**: 需要重写 `agent.py`，实现完整的 ReAct 循环逻辑。

### 方案 3: 双 LLM 架构（妥协方案）

- **主对话 LLM**: 当前的 `newone.qqun.top`（仅用于简单对话）
- **工具调用 LLM**: 兼容的 API（用于需要工具的任务）

**实现**:

```python
def get_llm(use_tools: bool = False):
    if use_tools:
        # 使用兼容的 API
        return ChatOpenAI(
            api_key="sk-compat-api",
            base_url="https://api.compatible.com/v1",
            model="gpt-4"
        )
    else:
        # 使用用户提供的 API
        return ChatOpenAI(
            api_key=settings.LLM_API_KEY,
            base_url=settings.LLM_API_BASE,
            model=settings.LLM_MODEL
        )
```

## 测试日志

### 2025-12-25 20:26:23

```
✅ 请求: "你好"
✅ 结果: 200 OK
✅ System Prompt: 已包含（约 500 字）
```

### 2025-12-25 20:29:05

```
❌ 请求: "什么是民法典"
❌ 结果: 400 Bad Request
❌ 错误: Request contains an invalid argument
❌ System Prompt: 已包含（约 500 字）
```

## 结论

**当前 LLM API 不适合用于生产环境的法律智能助手系统**。建议：

1. **短期**: 使用方案 3（双 LLM），保持基础对话功能
2. **长期**: 更换为完全兼容的 LLM API（方案 1）
3. **备选**: 如果预算有限，考虑使用 DeepSeek API（极低成本，良好兼容性）

## 技术支持

如需启用完整功能，请提供以下信息：

- [ ] 新的 LLM API 密钥
- [ ] API 的 Base URL
- [ ] 模型名称
- [ ] API 文档链接（验证兼容性）

# 基于 LangGraph 的法律智能体系统设计与实现 —— 毕业设计开题答辩大纲

## 一、研究背景与意义

1.  **行业背景**：法律服务数字化转型加速，AI 大模型在法律领域的应用（Legal AI）成为热点。
2.  **现实痛点**：
    *   通用大模型（LLM）存在**法律幻觉**（Hallucination），回答缺乏法律依据。
    *   单轮对话模式无法处理**复杂法律推理**（如多步逻辑推演）。
    *   传统法律工具检索效率低，**可追溯性**差。
3.  **研究意义**：
    *   **理论意义**：探索 LangGraph 在垂直领域的图结构编排与状态记忆机制。
    *   **实践意义**：构建高准确率、可追溯的法律智能体，提升法律工作者效率。

## 二、国内外研究现状

1.  **国外研究**：ChatGPT、Claude 等通用大模型在法律咨询的应用；OpenAI Function Calling 机制。
2.  **国内研究**：法 Chat、秘塔等国产法律大模型；Coze 等智能体平台的发展。
3.  **现有不足**：
    *   多数依赖外部闭源 API，缺乏**自主可控**的智能体架构。
    *   缺乏针对**复杂法律任务**（如合同审查）的多步推理工作流。
    *   前端交互普遍缺乏**沉浸式工作台**体验。

## 三、研究目标与主要内容

### 3.1 研究目标

设计并实现一个**基于 LangGraph 的法律智能体系统**，具备以下能力：
*   **精准咨询**：基于 RAG 检索，提供带法律条文溯源的回答。
*   **合同审查**：利用 OCR 与智能体，自动识别合同风险点。
*   **意图识别**：根据用户输入，自动路由至"咨询"、"生成"或"审查"模块。

### 3.2 主要内容

1.  **法律知识库构建**：
    *   采集权威法规、司法解释数据。
    *   利用**智谱 AI Embedding** 模型进行向量化。
    *   存储于 **Cloudflare Vectorize** 向量数据库。
2.  **LangGraph 智能体核心**：
    *   构建 `StateGraph`，管理对话历史与上下文。
    *   实现**意图识别节点**（System Prompt 优化）。
    *   封装 `legal_rag_search`、`generate_legal_document` 等工具。
3.  **前端交互设计**：
    *   基于 **Next.js** 开发。
    *   实现**分屏合同审查界面**（左文右析）。
    *   集成 **Shadcn/UI** 组件库，保证现代化 UI。
4.  **后端架构**：
    *   **Java Spring Boot** 处理业务逻辑、用户认证（JWT）与 MySQL 数据持久化。
    *   **Python FastAPI/Flask** 作为 AI 网关，桥接 LangGraph 与前端。

## 四、技术路线

1.  **前端**：Next.js 14 + TypeScript + Tailwind CSS + Shadcn/UI
2.  **AI 核心**：Python + LangGraph + LangChain
3.  **向量检索**：Cloudflare Vectorize + 智谱 AI Embedding
4.  **后端**：Java Spring Boot 2.7 + MySQL + Spring Security (JWT)
5.  **部署**：Docker Compose（前后端分离部署）

## 五、特色与创新

1.  **自研 LangGraph 编排架构**：不依赖外部闭源 Agent 平台，实现了**自主可控**的智能体工作流。
2.  **意图驱动的动态路由**：在 `agent.py` 中实现规则引擎，精准区分用户意图，解决大模型"答非所问"问题。
3.  **沉浸式分屏审查 UI**：创新的"左文右析"界面设计，提升合同审查效率。
4.  **异构微服务架构**：Java 保障业务安全，Python 专注 AI 推理，发挥各自语言优势。

## 六、进度安排

1.  **第 1-2 周**：需求分析与文献调研
2.  **第 3-4 周**：环境搭建与知识库构建
3.  **第 5-7 周**：LangGraph 智能体核心开发
4.  **第 8-10 周**：前端界面与后端 API 开发
5.  **第 11-12 周**：系统集成与测试
6.  **第 13-14 周**：论文撰写与答辩准备

## 七、参考文献

1.  [LangGraph Documentation](https://python.langchain.com/docs/langgraph)
2.  Retrieval-Augmented Generation for Large Language Model-based Chatbots (RAG 综述)
3.  Cloudflare Vectorize Documentation
4.  Spring Boot 官方文档
5.  Next.js 官方文档
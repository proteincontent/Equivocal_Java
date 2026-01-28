<p align="right">
  <strong>简体中文</strong> | <a href="./README.md">English</a>
</p>

<div align="center">
  <img src="./public/placeholder-logo.png" alt="Equivocal logo" width="180" />
  <h1>Equivocal Legal 法律智能体</h1>
  <p>基于 LangGraph 的法律智能体系统，提供法律咨询、合同审查与文书生成服务。</p>
  <p>
    <a href="https://github.com/proteincontent/Equivocal/blob/main/LICENSE">
      <img src="https://img.shields.io/github/license/proteincontent/Equivocal?color=brightgreen" alt="license" />
    </a>
    <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fproteincontent%2FEquivocal&project-name=equivocal&repository-name=Equivocal">
      <img src="https://vercel.com/button" alt="Deploy with Vercel" />
    </a>
  </p>
</div>

## 项目亮点

- **LangGraph 智能体架构**：基于 LangGraph 构建可编排的对话与审查工作流，支持状态记忆与多工具调用。
- **RAG 检索增强**：集成 Cloudflare Vectorize 与智谱 AI Embedding，实现精准的法律条文检索与溯源。
- **沉浸式法律工作台**：提供流式对话与分屏合同审查功能（左文右析），兼顾美观与高效。
- **混合微服务架构**：Java Spring Boot 处理业务与安全，Python 承载 AI 核心能力，Next.js 构建现代化前端。
- **一键部署**：支持 Vercel 与 Docker 部署，默认集成可观测性支持。

## 目录

- [项目亮点](#项目亮点)
- [安装与配置](#安装与配置)
- [开发与调试](#开发与调试)
- [配置项参考](#配置项参考)
- [项目结构](#项目结构)
- [参与贡献](#参与贡献)
- [许可证](#许可证)

## 安装与配置

### 环境要求

- [Node.js](https://nodejs.org/) 18.18 及以上版本
- [pnpm](https://pnpm.io/) 8 及以上版本

### 安装步骤

```bash
git clone https://github.com/YOUR_USERNAME/Equivocal.git
cd Equivocal
pnpm install
```

### 环境变量

1. 复制模板文件：
   ```bash
   cp .env.local.example .env.local
   ```
2. 在 `.env.local` 中配置 LLM 与向量库密钥。
   - `LLM_MODEL`: 使用的 LLM 模型名称 (如 `glm-4`)
   - `LLM_API_KEY`: LLM API 密钥
   - `EMBEDDING_MODEL`: Embedding 模型名称
   - `EMBEDDING_API_KEY`: Embedding API 密钥
   - `CF_ACCOUNT_ID`, `CF_API_TOKEN`, `CF_VECTORIZE_INDEX`: Cloudflare Vectorize 配置
3. 修改服务端环境变量后请重启开发服务器。

## 开发与调试

```bash
pnpm dev
```

访问 `http://localhost:4000` 查看应用。如果没有在服务器端配置密钥，请在聊天页面右上角的 **Settings** 面板粘贴密钥以启用对话。

推荐的质量检查命令：

```bash
pnpm lint   # TypeScript + ESLint
pnpm build  # Next.js 生产构建
```

## 配置项参考

| 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `LLM_MODEL` | 大语言模型名称 | `glm-4` |
| `LLM_API_KEY` | 大语言模型 API 密钥 | _必须配置_ |
| `EMBEDDING_MODEL` | Embedding 模型名称 | `embedding-2` |
| `EMBEDDING_API_KEY` | Embedding API 密钥 | _必须配置_ |
| `CF_VECTORIZE_INDEX` | Cloudflare Vectorize 索引名 | `legal-knowledge-base` |

## 项目结构

```
app/                 # Next.js 前端应用
ai-agent/            # Python LangGraph 智能体核心 (RAG, Tools, Agent)
backend/             # Java Spring Boot 后端 (Auth, API Gateway, DB)
components/          # UI 组件 (Shadcn/UI, Legal Chat, Contract Review)
data/legal-services/ # 法律服务逻辑与配置
hooks/               # React Hooks (Auth, Config)
lib/                 # 工具函数
```

**关键流程**

- 智能体核心 (`ai-agent/app/graph/agent.py`)：基于 LangGraph 的对话状态机，编排 RAG 与工具调用。
- 向量检索 (`ai-agent/app/services/vector_store.py`)：调用智谱 Embedding 与 Cloudflare Vectorize。
- 后端网关 (`backend/src/main/java/com/equivocal/controller/ChatController.java`)：转发 AI 请求，管理 JWT 认证。
- 前端交互 (`app/chat/page.tsx`, `app/contract-review/page.tsx`)：提供对话与审查界面。

## 参与贡献

欢迎提交 PR！如计划大规模改动（新增落地页、重构数据模型等），请先创建 Issue 讨论方案。

1. Fork 本仓库。
2. 创建特性分支：`git checkout -b feature/my-update`。
3. 提交代码：`git commit -m "feat: 描述你的改动"`。
4. Push 并发起 Pull Request。

## 许可证

[MIT](./LICENSE)


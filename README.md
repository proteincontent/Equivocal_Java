<p align="right">
  <strong>English</strong> | <a href="./README_zh.md">简体中文</a>
</p>

<div align="center">
  <img src="./public/placeholder-logo.png" alt="Equivocal logo" width="180" />
  <h1>Equivocal Legal 法律智能体</h1>
  <p>A Legal Agent System based on LangGraph, providing legal consultation, contract review, and document generation.</p>
  <p>
    <a href="https://github.com/proteincontent/Equivocal/blob/main/LICENSE">
      <img src="https://img.shields.io/github/license/proteincontent/Equivocal?color=brightgreen" alt="license" />
    </a>
    <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fproteincontent%2FEquivocal&project-name=equivocal&repository-name=Equivocal">
      <img src="https://vercel.com/button" alt="Deploy with Vercel" />
    </a>
  </p>
</div>

## Highlights

- **LangGraph Agent Architecture**: Workflow orchestration with state memory and multi-tool support.
- **RAG Retrieval**: Cloudflare Vectorize & Zhipu AI Embedding for accurate legal text retrieval.
- **Immersive Legal Workspace**: Streaming chat and split-screen contract review.
- **Hybrid Microservices**: Java Spring Boot (Business/Security) + Python (AI Core) + Next.js (Frontend).
- **One-click Deploy**: Supports Vercel and Docker.

## Table of Contents

- [Highlights](#highlights)
- [Setup](#setup)
- [Usage](#usage)
- [Configuration Reference](#configuration-reference)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) 18.18 or later (LTS recommended)
- [pnpm](https://pnpm.io/) 8+ (or your package manager of choice)
- Python 3.10+ (for AI Agent)
- Java 8+ (for Backend)

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/Equivocal.git
cd Equivocal
pnpm install
```

### Environment variables

1. Copy the template and fill in required values:
   ```bash
   cp .env.local.example .env.local
   ```
2. Configure LLM and Vector Store keys in `.env.local`.
   - `LLM_MODEL`: LLM model name (e.g., `glm-4`)
   - `LLM_API_KEY`: LLM API Key
   - `EMBEDDING_MODEL`: Embedding model name
   - `EMBEDDING_API_KEY`: Embedding API Key
   - `CF_ACCOUNT_ID`, `CF_API_TOKEN`, `CF_VECTORIZE_INDEX`: Cloudflare Vectorize config
3. Restart the dev server after changing server-side environment variables.

## Usage

### Run locally

```bash
pnpm dev
```

Visit `http://localhost:4000` (see `package.json` for the configured port).

### Recommended checks

```bash
pnpm lint   # TypeScript + ESLint
pnpm build  # Next.js production build
```

## Configuration Reference

| Variable             | Description          | Default                |
| -------------------- | -------------------- | ---------------------- |
| `LLM_MODEL`          | LLM Model Name       | `glm-4`                |
| `LLM_API_KEY`        | LLM API Key          | _Required_             |
| `EMBEDDING_MODEL`    | Embedding Model Name | `embedding-2`          |
| `EMBEDDING_API_KEY`  | Embedding API Key    | _Required_             |
| `CF_VECTORIZE_INDEX` | Vectorize Index Name | `legal-knowledge-base` |

## Project Structure

```
app/                 # Next.js Frontend
ai-agent/            # Python LangGraph Core (RAG, Tools, Agent)
backend/             # Java Spring Boot Backend (Auth, API Gateway, DB)
components/          # UI Components (Shadcn/UI, Legal Chat, Contract Review)
data/legal-services/ # Legal Service Logic & Config
hooks/               # React Hooks (Auth, Config)
lib/                 # Utility Functions
```

_Notable flows_

- **Agent Core** (`ai-agent/app/graph/agent.py`): LangGraph-based state machine for conversation and tool orchestration.
- **Vector Search** (`ai-agent/app/services/vector_store.py`): Zhipu AI Embedding & Cloudflare Vectorize integration.
- **Backend Gateway** (`backend/src/main/java/com/equivocal/controller/ChatController.java`): Forwards AI requests, manages JWT auth.
- **Frontend** (`app/chat/page.tsx`, `app/contract-review/page.tsx`): Chat and Review interfaces.

## Contributing

Pull requests are welcome! If you plan major changes (new landing flows, data model updates, etc.), please open an issue first so we can coordinate.

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/my-update`.
3. Commit your work: `git commit -m "feat: describe my change"`.
4. Push and open a pull request.

## License

[MIT](./LICENSE)

<p align="right">
  <strong>English</strong> | <a href="./README_zh.md">简体中文</a>
</p>

<div align="center">
  <img src="./public/placeholder-logo.png" alt="Equivocal logo" width="180" />
  <h1>Equivocal MBTI Companion</h1>
  <p>A bring-your-own-key MBTI chatbot that mixes AI guidance with immersive, animated UI moments.</p>
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

- **AI-powered legal services** – intelligent legal consultation, contract review, and document generation powered by Coze AI.
- **Built-in Coze integration** – no API key configuration needed; Coze credentials are pre-configured on the server.
- **Immersive onboarding UI** – a new landing page plus animated chat surface, spotlight interactions, and 3D-friendly panels built with Next.js + Tailwind.
- **Extensible data model** – legal service types, prompts, and metadata (moved into typed modules) keep UI components focused on presentation.
- **Vercel ready** – zero-config deployment pipeline and analytics already wired up.

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
2. Configure Coze API credentials (`COZE_API_KEY`, `COZE_BOT_ID`) in `.env.local` or the backend configuration.
3. Restart the dev server after changing server-side environment variables.

> The Coze API credentials are pre-configured on the server. Users do not need to provide their own API keys.

## Usage

### Run locally

```bash
pnpm dev
```

Visit `http://localhost:4000` (see `package.json` for the configured port). Use the Settings dialog in the top-right corner of the chat view to paste your API key if you did not configure one on the server.

### Recommended checks

```bash
pnpm lint   # TypeScript + ESLint
pnpm build  # Next.js production build
```

## Configuration Reference

| Variable | Description | Default |
| --- | --- | --- |
| `COZE_API_KEY` | Coze API key for AI chat services. | _required_ |
| `COZE_BOT_ID` | Coze Bot ID for the legal assistant. | _required_ |
| `COZE_API_URL` | Coze API base URL. | `https://api.coze.cn` |

## Project Structure

```
app/                 # Next.js app router, landing page, chat route
backend/             # Java Spring Boot backend (authentication, Coze API, database)
components/          # UI primitives and feature surfaces (chat, animations)
data/legal-services/ # Legal service metadata and helpers
hooks/               # Client-side state (auth, config fetchers, etc.)
lib/                 # Utility functions and API helpers
public/              # Static assets (logo, placeholders, manifest)
```

_Notable flows_

- **Chat API** – Java backend (`backend/src/main/java/com/equivocal/controller/CozeChatController.java`) handles Coze AI requests.
- **Authentication** – Java backend (`backend/src/main/java/com/equivocal/service/AuthService.java`) manages user login/registration with JWT.
- **Config state** – `hooks/use-config.ts` stores configuration; `hooks/use-auth.ts` manages authentication state.

## Contributing

Pull requests are welcome! If you plan major changes (new landing flows, data model updates, etc.), please open an issue first so we can coordinate.

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/my-update`.
3. Commit your work: `git commit -m "feat: describe my change"`.
4. Push and open a pull request.

## License

[MIT](./LICENSE)


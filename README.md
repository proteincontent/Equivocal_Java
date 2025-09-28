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

- **MBTI-first conversations** – guide users through temperament overviews, strengths, and growth prompts tailored to each MBTI type.
- **Bring your own OpenAI key** – configure an OpenAI-compatible endpoint via `.env.local` or the in-app Settings drawer; nothing is stored on our servers.
- **Immersive onboarding UI** – a new landing page plus animated chat surface, spotlight interactions, and 3D-friendly panels built with Next.js + Tailwind.
- **Extensible data model** – personality copy, prompts, and group metadata (moved into typed modules) keep UI components focused on presentation.
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
2. Add `OPENAI_API_KEY` to `.env.local` (or configure provider-specific overrides such as `OPENAI_API_BASE_URL`).
3. Restart the dev server after changing server-side environment variables.

> Prefer not to store secrets on disk? Leave `.env.local` blank and paste your key into **Settings → API Key** at runtime. Keys are saved only to the current browser.

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
| `OPENAI_API_KEY` | Server-side key used when clients do not supply their own. | _required_ |
| `OPENAI_MODEL` | Default model for chat completions. | `gpt-4o-mini` |
| `OPENAI_API_BASE_URL` | Base URL for OpenAI-compatible providers. | `https://api.openai.com/v1` |
| `OPENAI_CHAT_COMPLETIONS_PATH` | Path appended to the base URL when constructing requests. | `chat/completions` |
| `OPENAI_CHAT_COMPLETIONS_URL` | Full override URL (skips base URL + path). | — |
| `OPENAI_API_KEY_HEADER` | Header name that carries the API key. | `Authorization` |
| `OPENAI_API_VERSION` | Optional API version header (for Azure/OpenAI). | — |
| `NEXT_PUBLIC_OPENAI_*` | Public overrides for client defaults (model, base URL, key header). | — |

## Project Structure

```
app/                 # Next.js app router, landing page, chat route, API endpoints
components/          # UI primitives and feature surfaces (chat, MBTI selector, animations)
data/mbti/           # Personality metadata, prompts, and helpers (extracted from UI components)
hooks/               # Client-side state (OpenAI config, server config fetchers, etc.)
public/              # Static assets (logo, placeholders, manifest)
tools/               # Scripts and tooling helpers
```

_Notable flows_

- **Chat API** – `app/api/chat/route.ts` forwards requests to OpenAI-compatible providers, detects missing API keys, and returns assistant messages + usage metrics.
- **OpenAI config state** – `hooks/use-config.ts` stores per-browser overrides; `hooks/use-server-config.ts` exposes server defaults to the UI.
- **Settings panel** – `components/ui/settings.tsx` surfaces key, model, base URL, and header controls with reset + documentation links.

## Contributing

Pull requests are welcome! If you plan major changes (new landing flows, data model updates, etc.), please open an issue first so we can coordinate.

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/my-update`.
3. Commit your work: `git commit -m "feat: describe my change"`.
4. Push and open a pull request.

## License

[MIT](./LICENSE)


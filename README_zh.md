<p align="right">
  <strong>简体中文</strong> | <a href="./README.md">English</a>
</p>

<div align="center">
  <img src="./public/placeholder-logo.png" alt="Equivocal logo" width="180" />
  <h1>Equivocal MBTI 助手</h1>
  <p>一款融合 AI 对话与沉浸式动画界面的 MBTI 聊天体验，支持自带 OpenAI 密钥。</p>
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

- **MBTI 核心体验**：针对 16 型人格提供性格概览、优势与成长建议，帮助用户快速建立自我画像。
- **自带密钥**：通过 `.env.local` 或界面内的设置面板配置 OpenAI 兼容服务，密钥仅保存在本地浏览器。
- **动效与 3D 交互**：全新落地页与聊天界面共同呈现动画、光影与 3D 效果，让对话过程更沉浸。
- **数据与展示分离**：MBTI 文案、分类、提示词抽离到独立模块，组件专注于交互展示。
- **一键部署**：默认集成 Vercel 分析，支持零配置上线。

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
2. 在 `.env.local` 中填入 `OPENAI_API_KEY`（或配置 `OPENAI_API_BASE_URL` 等兼容服务参数）。
3. 修改服务端环境变量后请重启开发服务器。

> 如果不想在磁盘上存储密钥，可在运行时打开设置面板填写。密钥仅保存于当前浏览器的本地存储。

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
| `OPENAI_API_KEY` | 服务端默认使用的 OpenAI 密钥 | _必须配置_ |
| `OPENAI_MODEL` | 默认使用的模型 | `gpt-4o-mini` |
| `OPENAI_API_BASE_URL` | OpenAI 兼容服务的基础地址 | `https://api.openai.com/v1` |
| `OPENAI_CHAT_COMPLETIONS_PATH` | Chat Completions 请求路径 | `chat/completions` |
| `OPENAI_CHAT_COMPLETIONS_URL` | 完整 URL 覆盖（优先级最高） | — |
| `OPENAI_API_KEY_HEADER` | 携带 API Key 的请求头名称 | `Authorization` |
| `OPENAI_API_VERSION` | 可选的 API 版本（Azure 等场景） | — |
| `NEXT_PUBLIC_OPENAI_*` | 客户端默认值的公开覆盖项（模型/地址/请求头） | — |

## 项目结构

```
app/                 # 应用路由、落地页、聊天页面、API 接口
components/          # UI 组件与功能模块（聊天界面、MBTI 选择器、动效等）
data/mbti/           # MBTI 人格文案、分类与工具函数（与界面解耦）
hooks/               # 客户端状态管理（OpenAI 配置、服务端默认值等）
public/              # 静态资源（Logo、占位图、manifest 等）
tools/               # 工具脚本
```

**关键流程**

- `app/api/chat/route.ts`：转发聊天请求，检查密钥配置并返回模型响应。
- `hooks/use-config.ts`：在浏览器端持久化模型、密钥、Base URL 等设置。
- `components/ui/settings.tsx`：提供密钥填写、默认值重置与文档入口。

## 参与贡献

欢迎提交 PR！如计划大规模改动（新增落地页、重构数据模型等），请先创建 Issue 讨论方案。

1. Fork 本仓库。
2. 创建特性分支：`git checkout -b feature/my-update`。
3. 提交代码：`git commit -m "feat: 描述你的改动"`。
4. Push 并发起 Pull Request。

## 许可证

[MIT](./LICENSE)


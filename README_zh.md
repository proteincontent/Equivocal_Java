<p align="right">
  <strong>简体中文</strong> | <a href="./README.md">English</a>
</p>

<div align="center">
  <img src="./public/placeholder-logo.png" alt="Equivocal logo" width="180" />
  <h1>Equivocal Legal 法律助手</h1>
  <p>一款融合 AI 对话与沉浸式动画界面的智能法律服务助手。</p>
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

- **智能法律服务**：提供法律咨询、合同审查、文书生成等多种法律服务，帮助用户快速解决法律问题。
- **AI 驱动**：集成 Coze AI 平台，提供智能化的法律问答和文书处理能力。
- **动效与 3D 交互**：全新落地页与聊天界面共同呈现动画、光影与 3D 效果，让对话过程更沉浸。
- **数据与展示分离**：法律服务类型、分类抽离到独立模块，组件专注于交互展示。
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
2. 在 `.env.local` 或后端配置中填入 Coze API 凭证（`COZE_API_KEY`、`COZE_BOT_ID`）。
3. 修改服务端环境变量后请重启开发服务器。

> Coze API 凭证已在服务器端预配置，用户无需提供自己的 API 密钥。

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
| `COZE_API_KEY` | Coze API 密钥 | _必须配置_ |
| `COZE_BOT_ID` | Coze 法律助手 Bot ID | _必须配置_ |
| `COZE_API_URL` | Coze API 基础地址 | `https://api.coze.cn` |

## 项目结构

```
app/                 # 应用路由、落地页、聊天页面
backend/             # Java Spring Boot 后端（认证、Coze API、数据库）
components/          # UI 组件与功能模块（聊天界面、动效等）
data/legal-services/ # 法律服务类型、分类与工具函数（与界面解耦）
hooks/               # 客户端状态管理（认证、配置等）
lib/                 # 工具函数和 API 辅助
public/              # 静态资源（Logo、占位图、manifest 等）
```

**关键流程**

- Java 后端 (`backend/src/main/java/com/equivocal/controller/CozeChatController.java`)：处理 Coze AI 聊天请求。
- Java 后端 (`backend/src/main/java/com/equivocal/service/AuthService.java`)：管理用户登录/注册和 JWT 认证。
- `hooks/use-config.ts`：在浏览器端持久化配置。
- `hooks/use-auth.ts`：管理用户认证状态。

## 参与贡献

欢迎提交 PR！如计划大规模改动（新增落地页、重构数据模型等），请先创建 Issue 讨论方案。

1. Fork 本仓库。
2. 创建特性分支：`git checkout -b feature/my-update`。
3. 提交代码：`git commit -m "feat: 描述你的改动"`。
4. Push 并发起 Pull Request。

## 许可证

[MIT](./LICENSE)


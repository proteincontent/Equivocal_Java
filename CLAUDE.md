# CLAUDE.md

## 项目信息

这是一个基于 Next.js 的 MBTI 个性测试和聊天应用，名为 Equivocal。

## 代码规范

- 使用 TypeScript 进行严格类型检查
- 使用 ESLint 和 Prettier 进行代码规范和格式化
- 遵循 React Hooks 规则

## 常用命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 代码检查
npm run lint

# 格式化检查
npm run format

# 格式化修复
npm run format:write

# 类型检查
npx tsc --noEmit
```

## 架构说明

- `/app` - Next.js 14 App Router 页面
- `/components` - React 组件
  - `/ui` - 基础UI组件
- `/hooks` - 自定义React Hooks
- `/lib` - 工具函数
- `/public` - 静态资源

## 技术栈

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS v4
- Framer Motion (动画)
- Radix UI (组件库)
- Zustand (状态管理)

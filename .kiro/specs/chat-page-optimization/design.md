# Design Document: Chat Page Optimization

## Overview

本设计文档描述聊天页面优化的技术实现方案，涵盖导航栏重构、侧边栏增强、3D 场景加载优化、CTA 按钮改进、动画性能优化和组件架构重构。

## Architecture

### 当前架构

```
LegalChatPage
├── DeveloperBackground (背景)
├── AuthModal (认证弹窗)
├── LegalChatToolbar (工具栏 - 绝对定位)
├── IntroScreen (首页)
│   ├── DeveloperBackground (重复)
│   └── SplineScene (3D 场景)
└── Chat Interface
    ├── ChatSidebar (侧边栏)
    └── AnimatedAIChat (聊天组件 - 1300+ 行)
```

### 目标架构

```
LegalChatPage
├── DeveloperBackground (背景 - 单一实例)
├── AuthModal (认证弹窗)
├── Navbar (新导航栏 - 固定定位)
│   ├── BrandLogo
│   ├── NavActions
│   └── UserMenu
├── IntroScreen (首页)
│   └── SplineSceneWithLoader (带加载状态的 3D 场景)
└── Chat Interface
    ├── ChatSidebar (增强版侧边栏)
    │   └── SessionItemWithTooltip
    └── Chat Components (拆分后)
        ├── ChatContainer
        ├── MessageList
        ├── MessageItem
        ├── ChatInput
        └── utils/
```

## Components and Interfaces

### 1. Navbar Component (新建)

```typescript
// components/ui/navbar.tsx
interface NavbarProps {
  user?: { userId: string; email: string } | null;
  onLogin?: () => void;
  onLogout?: () => void;
  onMobileMenuOpen?: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
}
```

**实现要点：**
- 使用 `fixed top-0 left-0 right-0 z-50` 固定定位
- 高度固定 64px (`h-16`)
- 左侧显示品牌 Logo
- 右侧显示用户操作区域
- 支持毛玻璃效果 `backdrop-blur-xl bg-black/80`

### 2. SplineSceneWithLoader Component (新建)

```typescript
// components/ui/spline-scene-loader.tsx
interface SplineSceneWithLoaderProps {
  scene: string;
  className?: string;
  fallbackImage?: string;
  loadingTimeout?: number; // 默认 10000ms
}
```

**实现要点：**
- 使用 `useState` 跟踪加载状态
- 骨架屏使用 `animate-pulse` 效果
- 加载超时后显示静态 fallback
- 加载完成后 fade-in 过渡

### 3. Enhanced ChatSidebar

```typescript
// 增强 Tooltip 支持
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// 折叠状态下的会话项
<Tooltip>
  <TooltipTrigger asChild>
    <div className="session-item">...</div>
  </TooltipTrigger>
  <TooltipContent side="right">
    {session.title}
  </TooltipContent>
</Tooltip>
```

### 4. Reduced Motion Hook

```typescript
// hooks/use-reduced-motion.ts
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return reducedMotion;
}
```

### 5. 拆分后的聊天组件结构

```
components/chat/
├── chat-container.tsx      # 主容器
├── message-list.tsx        # 消息列表
├── message-item.tsx        # 单条消息
├── chat-input.tsx          # 输入区域
├── typing-indicator.tsx    # 打字指示器
├── file-attachment.tsx     # 文件附件
└── utils/
    ├── message-parser.ts   # 消息解析
    └── file-helpers.ts     # 文件处理
```

## Data Models

### 无新增数据模型

本次优化主要涉及 UI 层面，不涉及数据模型变更。



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Fixed Navbar Positioning
*For any* viewport scroll position, the Navbar element should always have `position: fixed` and `top: 0` computed styles, ensuring it remains at the top of the viewport.
**Validates: Requirements 1.1, 1.3**

### Property 2: Sidebar Tooltip Content Consistency
*For any* chat session with a title, when the sidebar is collapsed and the user hovers over that session item, the tooltip should display the exact same title text as the session.
**Validates: Requirements 2.2**

### Property 3: Reduced Motion Animation Disabling
*For any* animated component in the Chat Page, when the user's system has `prefers-reduced-motion: reduce` enabled, the component should either have no animation or use instant transitions (duration ≤ 50ms).
**Validates: Requirements 5.1, 5.2**

## Error Handling

### 3D Scene Loading Errors
- **Timeout**: 10 秒超时后显示静态 fallback 图片
- **Network Error**: 捕获加载错误，显示 fallback 并记录错误日志
- **Graceful Degradation**: 即使 3D 场景加载失败，页面其他功能正常运行

### Component Rendering Errors
- 使用 React Error Boundary 包裹关键组件
- 错误时显示友好的错误提示，而非白屏

## Testing Strategy

### Unit Testing
使用 Vitest + React Testing Library 进行单元测试：

1. **Navbar 组件测试**
   - 验证 Logo 渲染
   - 验证用户菜单交互
   - 验证响应式布局

2. **SplineSceneWithLoader 测试**
   - 验证加载状态显示
   - 验证超时 fallback 逻辑
   - 验证加载完成过渡

3. **useReducedMotion Hook 测试**
   - 验证初始状态检测
   - 验证媒体查询变化响应

### Property-Based Testing
使用 **fast-check** 库进行属性测试：

1. **Property 1 测试**: 生成随机滚动位置，验证 Navbar 始终固定
2. **Property 2 测试**: 生成随机会话标题，验证 Tooltip 内容一致性
3. **Property 3 测试**: 遍历所有动画组件，验证 reduced motion 下动画禁用

每个属性测试配置运行 100 次迭代。

测试文件命名格式：`*.property.test.ts`

### Visual Regression Testing
- 使用 Playwright 截图对比，确保重构后视觉一致性

## Implementation Notes

### 性能考虑
1. **Navbar**: 使用 `will-change: transform` 优化固定定位性能
2. **Sidebar Tooltip**: 使用 Radix UI Tooltip，支持延迟显示避免闪烁
3. **3D Scene**: 使用 `loading="lazy"` 延迟加载，减少首屏阻塞
4. **动画**: 使用 CSS 变量控制动画时长，方便 reduced motion 切换

### 兼容性
- 支持 Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- 移动端支持 iOS 14+, Android 10+

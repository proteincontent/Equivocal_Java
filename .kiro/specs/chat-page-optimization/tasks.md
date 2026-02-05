# Implementation Plan

- [x] 1. 创建基础工具和 Hook
  - [x] 1.1 创建 useReducedMotion Hook
    - 在 `hooks/use-reduced-motion.ts` 创建 Hook
    - 监听 `prefers-reduced-motion` 媒体查询
    - 返回布尔值表示是否启用减少动画
    - _Requirements: 5.1, 5.2_

  - [x] 1.2 编写 useReducedMotion 属性测试
    - **Property 3: Reduced Motion Animation Disabling**
    - **Validates: Requirements 5.1, 5.2**

- [x] 2. 创建新的 Navbar 组件
  - [x] 2.1 创建 Navbar 组件文件
    - 在 `components/ui/navbar.tsx` 创建组件
    - 实现固定定位 `fixed top-0 left-0 right-0 z-50`
    - 高度 64px，毛玻璃背景效果
    - 左侧品牌 Logo，右侧用户操作区
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 2.2 实现响应式布局
    - 移动端显示汉堡菜单按钮
    - 桌面端显示完整导航
    - _Requirements: 1.5_

  - [x] 2.3 编写 Navbar 属性测试
    - **Property 1: Fixed Navbar Positioning**
    - **Validates: Requirements 1.1, 1.3**

  - [x] 2.4 编写 Navbar 单元测试
    - 测试 Logo 渲染
    - 测试用户菜单交互
    - 测试响应式布局

    - _Requirements: 1.1, 1.2, 1.5_

- [ ] 3. 优化侧边栏组件
  - [x] 3.1 调整侧边栏宽度
    - 展开状态宽度改为 280px
    - 更新 `chat-sidebar.tsx` 中的宽度配置
    - _Requirements: 2.1_

  - [ ] 3.2 添加 Tooltip 支持
    - 折叠状态下为会话项添加 Tooltip
    - 使用 Radix UI Tooltip 组件
    - Tooltip 显示完整会话标题
    - _Requirements: 2.2_
  - [x] 3.3 编写 Sidebar Tooltip 属性测试
    - **Property 2: Sidebar Tooltip Content Consistency**
    - **Validates: Requirements 2.2**

- [ ] 4. Checkpoint - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. 创建 3D 场景加载组件
  - [ ] 5.1 创建 SplineSceneWithLoader 组件
    - 在 `components/ui/spline-scene-loader.tsx` 创建组件
    - 实现加载状态跟踪
    - 显示骨架屏 shimmer 效果
    - _Requirements: 3.1, 3.4_
  - [ ] 5.2 实现加载完成过渡
    - 加载完成后 fade-in 过渡动画
    - _Requirements: 3.2_
  - [ ] 5.3 实现超时 fallback 逻辑
    - 10 秒超时后显示静态 fallback 图片
    - _Requirements: 3.3_
  - [ ] 5.4 编写 SplineSceneWithLoader 单元测试
    - 测试加载状态显示
    - 测试超时 fallback 逻辑
    - _Requirements: 3.1, 3.3_

- [ ] 6. 优化 CTA 按钮
  - [ ] 6.1 更新 IntroScreen CTA 按钮
    - 文案改为 "开始对话"
    - 更新图标为对话相关图标
    - _Requirements: 4.1, 4.3_

- [ ] 7. 集成 Reduced Motion 支持
  - [ ] 7.1 更新 DeveloperBackground 组件
    - 使用 useReducedMotion Hook
    - reduced motion 时禁用 blob 动画
    - _Requirements: 5.3_
  - [ ] 7.2 更新 AnimatedAIChat 动画
    - 使用 useReducedMotion Hook
    - reduced motion 时使用即时过渡
    - _Requirements: 5.1, 5.2_
  - [ ] 7.3 更新 IntroScreen 动画
    - 使用 useReducedMotion Hook
    - reduced motion 时简化动画
    - _Requirements: 5.1, 5.2_

- [ ] 8. Checkpoint - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. 重构 AnimatedAIChat 组件
  - [ ] 9.1 提取 MessageList 组件
    - 创建 `components/chat/message-list.tsx`
    - 移动消息列表渲染逻辑
    - _Requirements: 6.1, 6.2_
  - [ ] 9.2 提取 MessageItem 组件
    - 创建 `components/chat/message-item.tsx`
    - 移动单条消息渲染逻辑
    - _Requirements: 6.1, 6.2_
  - [ ] 9.3 提取 ChatInput 组件
    - 创建 `components/chat/chat-input.tsx`
    - 移动输入区域逻辑
    - _Requirements: 6.1, 6.2_
  - [ ] 9.4 提取工具函数
    - 创建 `components/chat/utils/message-parser.ts`
    - 创建 `components/chat/utils/file-helpers.ts`
    - 移动 extractMessageContent、renderMessageContent 等函数
    - _Requirements: 6.1_
  - [ ] 9.5 重构 AnimatedAIChat 主文件
    - 导入拆分后的组件
    - 保持原有功能和外观
    - 确保文件不超过 300 行
    - _Requirements: 6.2, 6.4_

- [ ] 10. 集成到主页面
  - [ ] 10.1 更新 LegalChatPage
    - 替换 LegalChatToolbar 为新的 Navbar
    - 移除 IntroScreen 中重复的 DeveloperBackground
    - 调整页面布局适配新导航栏
    - _Requirements: 1.1, 1.2_
  - [ ] 10.2 更新 IntroScreen
    - 使用 SplineSceneWithLoader 替换 SplineScene
    - _Requirements: 3.1, 3.2, 3.3_

- [ ] 11. Final Checkpoint - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.

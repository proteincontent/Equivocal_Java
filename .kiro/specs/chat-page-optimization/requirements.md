# Requirements Document

## Introduction

本文档定义了聊天页面的整体优化需求，包括导航栏改进、侧边栏体验提升、3D 场景加载优化、CTA 按钮文案调整、动画性能优化以及组件架构重构。目标是提升用户体验、页面性能和代码可维护性。

## Glossary

- **Chat Page**: 聊天页面，包含 `LegalChatPage`、`AnimatedAIChat`、`ChatSidebar` 等组件的整体页面
- **Toolbar**: 顶部工具栏组件 (`LegalChatToolbar`)，包含用户头像、设置按钮等
- **Sidebar**: 侧边栏组件 (`ChatSidebar`)，显示会话历史列表
- **IntroScreen**: 首页介绍屏幕，包含 3D 场景和 CTA 按钮
- **Spline Scene**: 3D 场景组件，使用 Spline 渲染
- **CTA Button**: Call-to-Action 按钮，引导用户开始聊天
- **Reduced Motion**: 用户系统设置中的"减少动画"偏好
- **Tooltip**: 鼠标悬停时显示的提示信息

## Requirements

### Requirement 1: 导航栏优化

**User Story:** As a user, I want a fixed navigation bar with brand logo, so that I can have a consistent navigation experience across the page.

#### Acceptance Criteria

1. WHEN the Chat Page loads, THE Toolbar SHALL display as a fixed position element at the top of the viewport
2. WHEN the Toolbar renders, THE Toolbar SHALL display the brand logo on the left side
3. WHEN the user scrolls the page, THE Toolbar SHALL remain visible at the top of the viewport
4. WHEN the Toolbar renders, THE Toolbar SHALL maintain a consistent height of 64 pixels
5. WHEN the Toolbar renders on mobile devices, THE Toolbar SHALL adapt to a responsive layout with hamburger menu

### Requirement 2: 侧边栏体验优化

**User Story:** As a user, I want an improved sidebar experience, so that I can navigate chat sessions more efficiently.

#### Acceptance Criteria

1. WHEN the Sidebar is in expanded state, THE Sidebar SHALL display with a width of 280 pixels
2. WHEN the Sidebar is in collapsed state and user hovers over a session item, THE Sidebar SHALL display a tooltip showing the full session title
3. WHEN the Sidebar transitions between collapsed and expanded states, THE Sidebar SHALL animate smoothly within 300 milliseconds
4. WHEN the Sidebar is in collapsed state, THE Sidebar SHALL display session icons centered within the 70-pixel width

### Requirement 3: 3D 场景加载优化

**User Story:** As a user, I want visual feedback during 3D scene loading, so that I know the content is being loaded.

#### Acceptance Criteria

1. WHILE the Spline Scene is loading, THE IntroScreen SHALL display a skeleton placeholder with animated shimmer effect
2. WHEN the Spline Scene finishes loading, THE IntroScreen SHALL transition from skeleton to the actual 3D scene with a fade animation
3. IF the Spline Scene fails to load within 10 seconds, THEN THE IntroScreen SHALL display a static fallback image
4. WHEN the Spline Scene is loading, THE IntroScreen SHALL display a loading progress indicator

### Requirement 4: CTA 按钮文案优化

**User Story:** As a user, I want friendly and localized button text, so that I can understand the action clearly.

#### Acceptance Criteria

1. WHEN the IntroScreen renders, THE CTA Button SHALL display "开始对话" as the primary text
2. WHEN the user hovers over the CTA Button, THE CTA Button SHALL display a subtle scale animation
3. WHEN the CTA Button renders, THE CTA Button SHALL include an appropriate icon alongside the text

### Requirement 5: 动画性能优化

**User Story:** As a user with motion sensitivity, I want reduced animations when my system preference is set, so that I can use the application comfortably.

#### Acceptance Criteria

1. WHEN the user's system has "reduce motion" preference enabled, THE Chat Page SHALL disable or minimize all non-essential animations
2. WHEN reduced motion is enabled, THE Chat Page SHALL use instant transitions instead of animated ones
3. WHEN reduced motion is enabled, THE background blob animations SHALL be disabled
4. WHEN reduced motion is not enabled, THE Chat Page SHALL display all animations as designed

### Requirement 6: 组件架构重构

**User Story:** As a developer, I want well-organized component structure, so that I can maintain and extend the codebase efficiently.

#### Acceptance Criteria

1. WHEN the AnimatedAIChat component is refactored, THE component SHALL be split into separate files for message list, input area, and utility functions
2. WHEN components are split, THE new components SHALL maintain the same visual appearance and functionality
3. WHEN components are split, THE new file structure SHALL follow a logical grouping pattern
4. WHEN components are split, THE total lines per component file SHALL not exceed 300 lines

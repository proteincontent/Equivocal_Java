# Rent Scam Gallery Masonry Refresh Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** 把“经典租房诈骗案例”区域从“空 + 灰 + 噪”的 Bento 固定网格改成更像素材墙的 Masonry，并同时降低卡片噪音、提升对比与可读性。

**Architecture:** 采用 CSS Columns 实现 Masonry（无需第三方库/重排），卡片通过 `aspect-*` 变体形成不规则高度；信息结构收敛为“主视觉 + 底部标题区 + 单个风险角标”。

**Tech Stack:** Next.js App Router + React + Tailwind CSS + next/image + lucide-react

---

### Task 1: 建立 Masonry 容器与卡片高度变体（Chat）

**Files:**

- Modify: `components/rent-scam-cases/chat-rent-scam-gallery.tsx`

**Step 1: 把 grid 改为 columns Masonry**

- 将卡片容器由 `grid ... auto-rows-*` 改为：
  - `columns-1 sm:columns-2 lg:columns-3 2xl:columns-4`
  - `gap-3 sm:gap-4`
- 每张卡外层增加 `break-inside-avoid mb-3 sm:mb-4`。

**Step 2: 引入 height/aspect 变体**

- 新增 `masonryAspects` 数组（按 index 轮换），例如：
  - `aspect-[16/10]`, `aspect-[4/3]`, `aspect-[3/4]`, `aspect-[9/16]`
- 让“墙感”更强，减少“所有卡同高导致空”。

**Step 3: 降噪**

- 删除卡片里的“法律案例”胶囊（保留在模块 Header）。
- 风险信息改为右上角更小的角标（点色 + 文案），不要占太大面积。

---

### Task 2: 统一 Masonry 风格到案例库页（/rent-scam-cases）

**Files:**

- Modify: `components/rent-scam-cases/rent-scam-cases-gallery.tsx`

**Step 1: grid → columns**

- 同 Task 1，把列表页也改为 Masonry columns。

**Step 2: 复用同一套卡片信息层级**

- 顶部只保留风险角标（可选保留，但必须缩小）。
- tags 数量限制为 `0~2`（更像墙）。

---

### Task 3: 提升“主图占比”与对比（两处共用规则）

**Files:**

- Modify: `components/rent-scam-cases/chat-rent-scam-gallery.tsx`
- Modify: `components/rent-scam-cases/rent-scam-cases-gallery.tsx`

**Step 1: 主图 padding 下调**

- `p-8` → `p-5 sm:p-6`，让 SVG 不再缩在中间。

**Step 2: light 模式提清透**

- 提高 glass 不透明度（例如 `bg-white/85` 量级），ring 更明确、阴影更干净，避免“洗白发灰”。

**Step 3: a11y 与动效**

- 保留 `focus-visible:ring-*`。
- 保留 `motion-reduce:*`，避免 reduce-motion 用户产生不适。

---

### Task 4: 验证

**Step 1: 安装依赖（如需要）**

- Run: `npm install`

**Step 2: 格式与 lint**

- 注意：本仓库当前 `npm run format` / `npm run lint` 会全量扫描，可能被既有文件的格式/规则问题阻断。
- 只验证本次改动文件即可：
  - Run: `npx prettier --check components/rent-scam-cases/chat-rent-scam-gallery.tsx components/rent-scam-cases/rent-scam-cases-gallery.tsx docs/plans/2026-01-30-rent-scam-gallery-design.md docs/plans/2026-01-31-rent-scam-gallery-masonry-plan.md`
  - Expected: `All matched files use Prettier code style!`
  - Run: `npx eslint components/rent-scam-cases/chat-rent-scam-gallery.tsx components/rent-scam-cases/rent-scam-cases-gallery.tsx`
  - Expected: `0 errors`

**Step 3: 类型检查**

- 可选：`npx tsc --noEmit`
- 注意：仓库目前可能存在与本改动无关的 `tsc` 报错；若阻断交付，以 `npm run build` 为准（Next 可能会跳过类型验证）。

**Step 4: 构建**

- Run: `npm run build`
- Expected: build 成功

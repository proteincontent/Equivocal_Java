# 经典租房诈骗案例：豆包式卡片流（Bento/Masonry）设计方案

日期：2026-01-30  
范围：`/chat` 空状态的案例区 + `/rent-scam-cases` 列表页  
目标：把“案例展示”做成更接近豆包/素材墙的“视觉驱动型卡片流”，同时保证可读性、层级、响应式与可访问性。

---

## 1. 成功标准（视觉 + 交互）

1. **第一眼像“素材墙/卡片流”而非“列表组件”**：主视觉是“图”，标题只做点题，不抢画面。
2. **层级干净**：标签/风险信息不喧宾夺主，卡片重复元素最少。
3. **可读性稳定**：任何背景上标题可读（WCAG AA 目标），CTA 清晰。
4. **可用性稳定**：窗口高度不足时可滚动，不出现“露一截/被裁剪”。
5. **动效克制**：悬浮只做轻微 lift/高光，不产生布局抖动；支持 `prefers-reduced-motion`。

---

## 2. 布局路线（已选）：A) 真·Masonry（CSS Columns）

你选了 A，我们就把目标彻底定为“第二张图那种图片墙/瀑布流”。

### 2.1 Masonry 实现（Tailwind）

容器：

- `columns-1 sm:columns-2 lg:columns-3 2xl:columns-4`
- `gap-3 sm:gap-4`

卡片：

- `break-inside-avoid mb-3 sm:mb-4`
- 外层 `cursor-pointer` + 轻 lift 阴影（禁止改变 border 厚度，避免抖动）

### 2.2 Masonry 的阅读顺序（重要取舍）

CSS Columns 的 DOM 阅读顺序是“按列填充”，不是严格“从左到右一行一行”。  
应对策略（不做过度工程）：

1. 列表页（`/rent-scam-cases`）允许这种顺序（用户是“刷墙”心智）；
2. 空状态（`/chat`）只展示 6~8 张，影响更小；
3. 键盘可达：每张卡是一个 `<Link>`，自然 tab 顺序仍按 DOM；确保 focus ring 明显。

---

## 3. 视觉语言（关键：去“雾”、提“清透”、降噪）

### 3.1 背景与容器（减少“洗白/发灰”）

- Section 容器：少用大面积强 blur；改为 **轻 blur + 更高不透明度**：`bg-white/85`（light）/`bg-slate-950/55`（dark）。
- 阴影：用 **双层阴影** 做“漂浮感”，避免单一大阴影显脏：
  - light：`shadow-[0_10px_40px_-18px_rgba(2,6,23,0.18)]` + `ring-1 ring-slate-200/60`
  - dark：`shadow-[0_18px_70px_-40px_rgba(0,0,0,0.9)]` + `ring-1 ring-white/10`

### 3.2 Masonry 卡片内容结构（少元素、强层级）

每张卡片只保留三层信息：

1. **主图**（填满，留足留白）
2. **底部渐变遮罩 + 标题/副标题**（可读性锁死）
3. **一个 CTA（右下角胶囊/按钮）**

**降噪策略**（强制执行）：

- “法律案例”胶囊在卡片里只出现一种：要么全局 header 里出现，要么卡片里出现；不要两处都反复出现。
- “风险”信息建议做成 **角标**（右上小胶囊）或 **仅用点色**（不再重复文字）。
- 卡片标签（tags）只显示 0~2 个，且放在底部标题区下方（小号），不要把卡片顶部塞满。

### 3.3 字体与排版（中文更精致）

- 标题：保持现有 serif 气质，但把字重与行高收紧（更像“海报题字”）。
- 说明文字：保持中灰但不发虚（light 模式不低于 `slate-600`）。

---

## 4. 交互与状态

### Hover / Focus

- Hover：`translate-y-0.5` + 高光层 `opacity`，不使用会引发布局变化的 border 宽度变化。
- Focus：所有可点元素都有 `focus-visible:ring-2 ring-blue-500/40`。

### 过滤标签栏

- 标签建议“更像豆包”：active 为深色胶囊；inactive 为白底描边；滚动条隐藏但保留可横滑。
- 增加“可达性”：标签按钮必须有 focus ring；active 状态可读性要足。

### 空状态页布局

- 空状态容器必须 `overflow-y-auto`，避免小高度屏幕裁剪内容。
- 让首屏“视觉中心”略偏上（`justify-start` + 合理 `pt`），留空间给卡片墙。

---

## 5. 数据与内容策略

现有 `cover` 是 SVG 线稿，容易显“占位/示意”。要更像第二张图的“视觉墙”，需要至少做一件事：

1. **给 SVG 统一加入“卡片背景层”**（渐变/轻噪点/微光），让画面更满；或
2. 替换为更丰富的插画（仍可 SVG，但要有底色与层次）。

---

## 6. 验收清单（上线前必过）

- [ ] light 模式：标题/按钮在任何卡面上可读（不发灰）
- [ ] 卡片顶部信息不超过 1~2 个小元素（降噪）
- [ ] Hover 不抖动（无 layout shift）
- [ ] `prefers-reduced-motion` 下动效关闭/弱化
- [ ] 320px 宽无横向滚动
- [ ] 空状态小高度可滚动，不裁剪案例区
- [ ] 键盘可达：TagButton / Card / “查看全部”均有 focus 可视

---

## 7. 实现映射（落地到代码）

### 7.1 影响的组件/页面

- 空状态案例区：`components/rent-scam-cases/chat-rent-scam-gallery.tsx`
  - 需求：支持 `limit`，Tag 筛选，Masonry 图片墙（不规则高度）
- 案例库列表页：`components/rent-scam-cases/rent-scam-cases-gallery.tsx`
  - 需求：全量列表 Masonry，信息更克制（更像“墙”而非“列表”）
- 空状态容器滚动（已做）：`components/ui/animated-ai-chat.tsx`

### 7.2 Masonry 容器（Tailwind）

建议统一抽成同一套 class（两处一致，避免“一个像墙一个像列表”）：

- `columns-1 sm:columns-2 lg:columns-3 2xl:columns-4`
- `gap-3 sm:gap-4`
- 让容器在小屏更“墙”：`[column-fill:_balance]`（可选）

### 7.3 卡片骨架（必须遵守：三层信息 + 降噪）

外层（每张卡包在 `<Link>` 外层或内层都行，但整张要可点）：

- `break-inside-avoid mb-3 sm:mb-4`
- `rounded-3xl overflow-hidden cursor-pointer`
- `ring-1 ring-slate-200/60 dark:ring-white/10`
- `shadow-[0_10px_40px_-18px_rgba(2,6,23,0.18)] dark:shadow-[0_18px_70px_-40px_rgba(0,0,0,0.9)]`
- hover：`transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5`
- focus：`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40`

内部三层：

1. 背景：轻光晕（radial）+ 风险渐变（不覆盖文字）
2. 主图：`next/image` + `object-contain` + `p-8`，动效只允许 `scale`（轻微）
3. 底部遮罩：固定高度渐变 + 标题/副标题 + 右下 CTA 胶囊

顶部信息（降噪规则）：

- 仅保留 1 个：风险角标（右上）= “颜色点 + 风险高/中/低”
- “法律案例”归到模块 header，不在卡片里重复
- tags 最多 0~2 个，放在底部标题区（小号胶囊）

### 7.4 关于 DOM 顺序（Masonry 的已知取舍）

CSS Columns 的视觉顺序按列填充：更像“刷墙”但不保证“从左到右逐行”。  
我们不做 JS Masonry（避免复杂度/性能/可访问性坑），用这三条兜底：

1. `/chat` 只展示少量卡片（影响极小）
2. `/rent-scam-cases` 用户心智是“浏览素材墙”
3. Tab 顺序仍按 DOM，focus ring 清晰即可

---

## 8. 变更范围（YAGNI）

明确不做：

- 不引入第三方 Masonry 库/重排引擎（保持简单稳定）
- 不做瀑布流无限加载（先把视觉打磨到位）
- 不做卡片内信息密度扩展（那会回到“列表组件”观感）

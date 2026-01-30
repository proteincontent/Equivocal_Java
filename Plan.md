# Equivocal Legal 开题答辩材料 Plan（Beamer + PPTX）

## README 标题纠正（2026-01-11）

### Gate 0：任务说明（可复述）

目标：将仓库对外说明中的项目标题统一为“法律智能体”，修正 `README.md` 中错误的 “MBTI” 标题，避免对项目定位造成误导。

非目标（本次不做）：

- 不重写 README 的其余段落（例如 Highlights/Setup/Usage），仅做标题层面的纠偏。
- 不改动业务代码与功能实现。

验收标准（成功判据）：

- [x] `README.md` 的主标题不再包含 “MBTI”，并改为“法律智能体”。
- [x] `README_zh.md` 的主标题同步改为“法律智能体”。

### Gate A：步骤拆分（每步产出物 / 验证 / DoD）

1. 更新 `Plan.md` 并获得用户确认
   - 产出物：本节计划文本
   - 验证：用户确认无误
   - DoD：用户明确回复“确认/可以/OK”

2. 修改 README 标题（中英同步）
   - 产出物：`README.md`、`README_zh.md` 标题更新
   - 验证：打开两份 README，主标题均为“法律智能体”，且不再出现 “MBTI”
   - DoD：满足本节“验收标准”清单

### Gate G：回写与结项

- 已完成：`README.md`、`README_zh.md` 标题统一为“法律智能体”，并移除 README 英文描述中的 “MBTI” 字样。

### 文件清单（预计）

**修改**

- `README.md`
- `README_zh.md`

### 风险与后续（已知不一致）

- 当前 `README.md` 的正文仍包含与 “MBTI” 相关的描述；本次按“非目标”先不改，后续若需要可单独开一小步对齐整份 README 文案与项目实际。

## 当前焦点（2026-01-12）

本文件目前包含两条相互独立的工作线：`Beamer (LaTeX)` 与 `PPTX`。为避免“重叠/冲突”，**本次开题答辩以 `PPTX（Apple Monochrome Minimal · CURRENT）` 为唯一执行版本**；Beamer 线标记为“（归档/可回退）”，用于追溯历史与复用文案结构。

- 当前主线：`pptx-tools/`（pptxgenjs 生成，Apple Keynote-like Monochrome Minimal）
- 当前目标产物：`Equivocal_Legal_开题答辩_final.pptx`（10 页，16:9，中文）
- 归档参考：`湖州学院_开题答辩_Beamer/`（LuaLaTeX + metropolis，AI-Native Minimal）

## Next.js 前端构建错误修复（Turbopack：CommonJS/ESM 冲突）（2026-01-14）

### Gate 0：任务说明（可复述）

目标：修复 Next.js（Turbopack）构建/开发时出现的 `Specified module format (CommonJs) is not matching ... (EcmaScript Modules)` 报错，恢复 `pnpm build` 与 `pnpm dev` 正常运行（不再 500）。

非目标（本次不做）：

- 不改动页面/组件业务逻辑与 UI（只做构建配置层面的最小修复）。
- 不引入额外依赖或重构目录结构。

关键观察（已复现）：

- 触发条件：根 `package.json` 目前为 `"type": "commonjs"`，而项目源码（`.ts/.tsx`、`tailwind.config.ts` 等）使用 ESM `import/export`；Turbopack 将其判定为模块格式冲突并报错（多文件连锁）。

方案（首选）：

- 将根 `package.json` 的 `"type"` 从 `"commonjs"` 调整为 `"module"`，使“包级默认模块语义”与源码 ESM 写法一致。
- 风险控制：仓库内若存在需要 `require()` 的脚本，统一使用 `.cjs` 后缀（当前 `pptx-tools/*.cjs` 已符合，不受影响）。

验收标准（成功判据）：

- [ ] `pnpm build` 通过，且不再出现上述 “module format” 报错。
- [ ] `pnpm dev` 打开 `/` 不再返回 500（至少能正常编译并渲染首页）。

### Gate A：步骤拆分（每步产出物 / 验证 / DoD）

1. 更新 `Plan.md` 并获得用户确认（本节）
   - 产出物：本小节计划文本
   - 验证：用户确认无误
   - DoD：用户明确回复“确认/可以/OK”

2. 调整包级模块类型为 ESM
   - 产出物：`package.json` 将 `"type": "commonjs"` 改为 `"type": "module"`
   - 验证：本地执行 `pnpm -s build` 不再报 “module format” 错误
   - DoD：满足本节“验收标准”的第 1 条

3. 运行开发模式做端到端确认
   - 产出物：无（运行态验证）
   - 验证：`pnpm -s dev --port 31000` 后访问 `http://localhost:31000/` 不再 500
   - DoD：满足本节“验收标准”的第 2 条

### 文件清单（预计）

**修改**

- `package.json`

### 静态检查清单（用户可复现）

- `pnpm -s build`
- `pnpm -s dev --port 31000`（随后访问 `http://localhost:31000/`）

## 合同审查：AI 审查服务 HTTP 500（前端上传 .docx）（2026-01-14）

### Gate 0：任务说明（可复述）

目标：修复“合同审查”页面上传 `.docx` 后出现的 `AI 审查服务调用失败（HTTP 500）`，至少做到：

- 前端不再只显示“HTTP 500”这种不可诊断信息，而能展示后端返回的具体 `detail`。
- 调用路径不再硬编码 `http://localhost:8000/...`（避免生产环境/跨域问题），改为同源 `/api/...` 并由 Next.js 统一转发到 AI Agent 服务。
- 尽量降低 AI Agent 端因模型输出不规范导致的 500（JSON 解析失败等）。

非目标（本次不做）：

- 不重做合同审查业务流程与 UI。
- 不更换 LLM 供应商/模型（仅在现有配置下提升健壮性与可观测性）。

关键观察（已定位）：

- 前端 `app/contract-review/components/upload-zone.tsx` 当前直接从浏览器请求 `http://localhost:8000/v1/contract/review`。
- AI Agent（FastAPI）在 `ai-agent/app/api/contract.py` 里捕获所有异常并统一抛 `HTTP 500`，导致前端看不到真实错误原因。

验收标准（成功判据）：

- [ ] 上传 `.docx` 时，前端调用走 `/api/contract/review`（不再硬编码 `localhost:8000`）。
- [ ] 若 AI Agent 出错，前端错误提示包含后端 `detail`（便于定位具体失败原因）。
- [ ] 常见合同文本可正常返回 `risks`（至少 1 条），不再频繁 500（无法完全消除时需降级返回可用错误信息）。

### Gate A：步骤拆分（每步产出物 / 验证 / DoD）

1. 更新 `Plan.md` 并获得用户确认（本节）
   - 产出物：本小节计划文本
   - 验证：用户确认无误
   - DoD：用户明确回复“确认/可以/OK”

2. 前端：改为同源 API + 展示后端 detail
   - 产出物：`app/contract-review/components/upload-zone.tsx`
   - 变更：`fetch("/api/contract/review", ...)`；`!response.ok` 时解析 `response.text()`/JSON 并拼到错误信息中
   - 验证：上传失败时错误信息可定位（包含 `detail`）；成功时正常渲染风险点
   - DoD：满足验收标准第 1/2 条

3. Next.js：增加精确转发规则到 AI Agent（避免被 `/api/:path* -> 8080` 覆盖）
   - 产出物：`next.config.mjs`（新增 `/api/contract/review` rewrite，优先于通配 `/api/:path*`）
   - 验证：浏览器 Network 显示请求 URL 为 `/api/contract/review`，且服务端实际转发到 AI Agent
   - DoD：满足验收标准第 1 条

4. AI Agent：增强输出解析与错误信息（降低 500 概率）
   - 产出物：`ai-agent/app/api/contract.py`
   - 变更：对“模型输出非 JSON / JSON 不符合 schema”做兜底解析与一次重试修复；异常信息保留关键上下文
   - 验证：同一输入下更稳定返回结构化 `risks`；失败时 `detail` 更具体
   - DoD：满足验收标准第 3 条（尽力达成）

### 文件清单（预计）

**修改**

- `app/contract-review/components/upload-zone.tsx`
- `next.config.mjs`
- `ai-agent/app/api/contract.py`

### 验收命令/步骤（用户可复现）

- 启动 AI Agent：`cd ai-agent; python main.py`
- 启动前端：`pnpm -s dev --port 31000`
- 打开 `http://localhost:31000/contract-review` 上传任意 `.docx`：
  - 成功：出现风险点列表与高亮
  - 失败：提示信息包含后端 `detail`（不再只有 HTTP 状态码）

## 湖州学院\_开题答辩\_Beamer（AI-Native Minimal · 归档/可回退）（2026-01-12）

### Gate 0：任务说明（可复述）

目标：以本仓库（Equivocal Legal）为唯一事实来源，完成一套可直接用于开题答辩的 Beamer 幻灯片：主题为“基于 LangGraph 的法律智能体系统（自建 LangGraph + RAG）”，视觉统一为 **AI-Native Minimal**（中性底色 + 单一强调色 + pills/cards 组件语言），并保证 `LuaLaTeX` 可稳定编译（本地/Overleaf 皆可）。

非目标（本次不做）：

- 不修改 Web/Java/Python 项目的业务代码与 UI（只改 `湖州学院_开题答辩_Beamer/`）。
- 不引入 `shell-escape` / minted 等编译额外依赖。
- 不引入校徽图片资产（右上角仅保留 `HZU` 文本 pill）。

### 关键约束 / 假设（统一口径）

- 编译：`LuaLaTeX`（允许 Overleaf；本地优先）。不依赖系统字体，保持 “IfFontExists + fallback”。
- 主题：`metropolis`（已确认）。
- 比例：16:9（`aspectratio=169`）。
- 组件语言：`pills / cards / bento / hairline`，全局强调色 `accent = #6366F1`。
- 右上角：保留 `HZU` pill，不做 Logo（避免资源缺失与版权/格式风险）。

### 当前状态（2026-01-12）

- 已实现：全局 token（`bg/bgsoft/ink/slate/muted/line/accent`）+ 组件（`\pill/\pillaccent/\framepills/\aicard`），并应用到 `sections/00`–`07`。
- 已生成：`湖州学院_开题答辩_Beamer/output_local/main.pdf` 与 `output_local/preview-01.png`～`preview-12.png`。
- 已知“冲突来源”（文档层面）：旧的 Apple/Keynote 方向、Overleaf 修复计划与 AI-Native Minimal 方案混排在同一份 `Plan.md`；本节作为 Beamer 归档口径，PPTX 线为当前执行版本。

### 待办（小步可验收，逐项清空）

1. 视觉小问题（若你也认同）
   - [ ] 封面标题下的 `accent` 线条出现“被卡片遮挡/只露一小截”的观感（见 `preview-01.png` 左侧短竖线）；修复方式以 `00-cover.tex` 为准（不影响右上角 `HZU` pill）。
   - [ ] 封面个人信息卡片去“阴影/浮起感”（保持圆角与信息分组，但去掉任何阴影效果；优先方案：卡片仅保留 `fill=bgsoft`，不使用额外阴影样式；边框是否保留按你审美再确认）。
2. 版式告警（非致命但建议清零）
   - [ ] `lualatex` 日志的 `Overfull \\vbox`（目前出现在 `sections/03-methodology.tex`、`sections/04-experiments.tex`、`sections/05-conclusion.tex`）。
3. 引用链路（最终验收必备）
   - [ ] 本地/Overleaf 均能跑通 `biblatex + biber`：References 页可见，文中引用编号正常。

### 验收标准（成功判据）

- [ ] `LuaLaTeX` 编译通过（无 Errors），并生成 `output_local/main.pdf`。
- [ ] 前 8 页视觉一致：同一强调色/圆角/边线/卡片语言；无明显溢出/遮挡。
- [ ] References 页可见，且至少 3 条文献；文中至少 2 处 `\cite{...}` 可正常解析。

### 文件清单（执行版）

**修改**

- `湖州学院_开题答辩_Beamer/main.tex`
- `湖州学院_开题答辩_Beamer/sections/00-cover.tex`
- `湖州学院_开题答辩_Beamer/sections/01-toc.tex`
- `湖州学院_开题答辩_Beamer/sections/02-background.tex`
- `湖州学院_开题答辩_Beamer/sections/03-methodology.tex`
- `湖州学院_开题答辩_Beamer/sections/04-experiments.tex`
- `湖州学院_开题答辩_Beamer/sections/05-conclusion.tex`
- `湖州学院_开题答辩_Beamer/sections/06-acknowledgements.tex`
- `湖州学院_开题答辩_Beamer/sections/07-references.tex`
- `湖州学院_开题答辩_Beamer/refs.bib`

**产物（本地生成）**

- `湖州学院_开题答辩_Beamer/output_local/main.pdf`
- `湖州学院_开题答辩_Beamer/output_local/preview-01.png` ～ `preview-12.png`

### 本地复现命令（推荐）

- 仅编译（快速）：`lualatex -interaction=nonstopmode -halt-on-error -output-directory=output_local main.tex`
- 含参考文献（最终验收）：
  - `lualatex -interaction=nonstopmode -halt-on-error -output-directory=output_local main.tex`
  - `biber output_local/main`
  - `lualatex -interaction=nonstopmode -halt-on-error -output-directory=output_local main.tex`
  - `lualatex -interaction=nonstopmode -halt-on-error -output-directory=output_local main.tex`
- 导出预览（建议用 `pdftocairo`，兼容性更好）：
  - `pdftocairo -png -f 1 -l 12 output_local/main.pdf output_local/preview`

### 风险与备选方案

- 字体不可用（Overleaf/本地差异）：坚持 “存在性判断 + fallback”，必要时回退到 `Latin Modern Sans` + `ctex` 的 `fandol`。
- biber 未触发：Overleaf 使用 `Recompile from scratch`；本地按“含参考文献”命令链路执行。

## （归档）湖州学院\_开题答辩\_Beamer（Apple Light · LangGraph 法律智能体）改版计划（2026-01-11）

### Gate 0：任务说明（可复述）

目标：以本仓库（Equivocal Legal）为唯一事实来源，把 `湖州学院_开题答辩_Beamer/` 的内容改写为“基于 LangGraph 的法律智能体系统（自建 LangGraph + RAG，不使用 Coze）”的开题答辩，并将视觉升级到 Apple Keynote 风格（Strict Light / Monochrome Minimal：高对比、大标题、强留白、少量系统蓝强调），同时保持 Overleaf `LuaLaTeX` 稳定可编译。

### 已对齐的关键约束 / 假设

- 技术路线：自建 `LangGraph + RAG`（不出现 Coze 相关叙述）。
- 画面风格：Apple Light（黑白灰为主，少量蓝色强调；避免花哨渐变与重阴影）。
- 编译：Overleaf `LuaLaTeX`；不引入 `shell-escape` 依赖（不使用 minted）。
- 字体：不强依赖系统字体（不要求 SF Pro）；保持“存在性判断 + fallback”，确保可移植。
- 比例：16:9（`aspectratio=169`）。

### 范围 / 非目标

**范围（本次要做）**

- 视觉：统一 `frametitle`、页脚（页码/节奏）、列表/Block/表格/代码块样式，提升投影可读性（尤其是灰度对比）。
- 节奏：移除“每个 section 自动插入章节标题页/空白页”的问题（避免出现你当前 PDF 里“目录空白页”这类断节）。
- 内容：将 `main.tex` 标题信息与 `sections/*.tex` 全部改写为法律智能体开题答辩内容，并与仓库的真实实现保持一致（Next.js 前端、Java 后端、Python FastAPI + LangGraph、Cloudflare Vectorize/R2、Embedding）。
- 参考文献：将 `refs.bib` 更新为 LangGraph / RAG / Legal AI / 可靠性与审计相关文献，并保证 `biblatex + biber` 可生成 References 页。

**非目标（本次不做）**

- 不改动 Web/Java/Python 项目本身的功能与 UI（只做答辩 Beamer）。
- 不引入学校强制格式模板之外的复杂主题重写（优先在 `metropolis` 上做 Apple 化）。
- 不在 Beamer 中展示或硬编码任何密钥/Token/私有 URL。

### 验收标准（成功判据）

- [ ] Overleaf 选择 `LuaLaTeX` 可成功编译并生成 PDF（无 Errors）。
- [ ] 全套页面视觉一致：标题层级清晰、留白稳定、灰度可读、强调色克制；无“章节空白页”。
- [ ] 内容准确：明确为“基于 LangGraph 的法律智能体系统（自建 LangGraph + RAG）”，并与仓库的模块/能力一致。
- [ ] References 页可见，且至少包含 5 条与本课题相关的参考文献；文中至少 2 处引用可正常解析。

### 子任务：封面第一页排版修复（标题手动断行 + 表单线条统一）（2026-01-11）

#### Gate 0：任务说明（可复述）

目标：修复 `output_local/main.pdf` 第 1 页封面排版“看起来乱”的问题，重点解决：

- 标题中文自动断行不理想（如把“智能体”拆开）。
- 个人信息区域的占位线风格不统一/过重，视觉不干净。

非目标（本次不做）：

- 不改动非封面页面内容与布局（只动封面相关宏/样式）。
- 不引入新编译依赖（保持 LuaLaTeX + metropolis + TikZ，避免 minted/shell-escape）。

关键决策（已对齐）：

- 标题断行采用手动控制：将标题写成 `...法律智能体\\系统设计与实现`（避免在“智能体”等词内部断行）。
- 学号/专业/导师等“表单项”保留空行，但将占位线改为浅灰 `\rule`，整体更像表单、更克制。

验收标准（成功判据）：

- [ ] 封面标题的换行位置符合预期：不拆“智能体”等词，且无重叠/溢出。
- [ ] 姓名/学号/学院专业/指导教师四行排版对齐稳定，占位线条为浅灰（与 `line` 色系一致），投影可读但不抢眼。
- [ ] 本地或 Overleaf（LuaLaTeX）可稳定编译通过。

补充优化（视觉洁净度，已获用户授权直接执行）：

- 现状：标题区域的“蓝色短线 + 灰色长线”在视觉上容易与下方表单区产生误读（像压到姓名区）。
- 决策：保留蓝色短线作为主视觉锚点，移除灰色长线（更克制、更像 Keynote）。
- 验收：封面标题下方不再出现贯穿全宽的灰色分隔线；信息区更清爽且层级更清晰。

补充微调（蓝线不“压姓名”，已获用户确认 OK）：

- 原因：蓝线以 `title_node.south` 定位（且向下偏移），而 `title_node` 包含了副标题，导致蓝线整体偏低，视觉上贴近信息区。
- 决策：将蓝线整体上移（减小向下偏移量），让其明确归属于标题区。
- 验收：蓝线与“姓名”区域之间留出明显空隙，不再产生“压着姓名”的观感。

### 子任务：更“Apple/Keynote”风格（本地编译优先，不再考虑 Overleaf）（2026-01-11）

#### Gate 0：任务说明（可复述）

目标：在不大改版式结构的前提下，让封面与全局排版更接近 Apple Keynote 的“克制极简”观感（字体气质、字距、灰度层级、留白节奏）。

关键约束 / 假设：

- 用户明确表示不会迁移到 Overleaf，本轮以本地编译为准。
- 仍保持“可回退”的字体策略：存在则使用系统字体（更 Apple），不存在则自动回退到当前可用字体（保证能编译）。

非目标（本次不做）：

- 不重写全套主题与所有页面布局（先聚焦封面与全局字体气质）。
- 不引入需要额外安装的复杂构建链（例如必须依赖 Perl 的 `latexmk`）。

#### Gate A：步骤拆分（每步产出物 / 验证 / DoD）

1. 更新 `Plan.md` 并获得用户确认（本节）
   - 产出物：本小节计划文本
   - 验证：用户确认无误
   - DoD：用户明确回复“确认/可以/OK”

2. 字体与字距：启用更 Apple 的本机字体链（可用则用，不可用回退）
   - 产出物：`湖州学院_开题答辩_Beamer/main.tex`
   - 方案：英文优先尝试 `SF Pro Display/Text` → `Inter` → `Segoe UI` → 现有 TeX 字体；中文优先尝试 `PingFang SC` → `Source Han Sans SC / Noto Sans CJK SC` → `Microsoft YaHei` → 现有 Fandol。
   - 验证：标题/正文的字形更“Apple”，且本地 `lualatex` 编译通过
   - DoD：封面与正文的字体风格明显更现代、克制（用户主观认可）

3. 封面细节：去“代码感”，增强 Keynote 气质
   - 产出物：`湖州学院_开题答辩_Beamer/sections/00-cover.tex`
   - 方案：
     - 顶部 meta 从 `\ttfamily` 改为更轻的 sans（可加少量 letter spacing），并将 `EQUIVOCAL_LEGAL // ...` 改为更 Keynote 的分隔符（如 `·`/`—`），减少“终端/代码”气质。
     - 细调标题字号/行距/留白，保持强层级但不过重。
   - 验证：`output_local/preview-01.png` 观感更像 Keynote（更轻、更干净、更有呼吸感）
   - DoD：封面“Apple 味”主观提升明显

4. 生成与验收（本地）
   - 产出物：更新后的 `湖州学院_开题答辩_Beamer/output_local/main.pdf` 与 `.../preview-01.png`
   - 验证：本地编译命令可复现；封面与至少 1 个正文页字体一致且不突兀
   - DoD：通过本节验收

#### 文件清单（预计）

**修改**

- `湖州学院_开题答辩_Beamer/main.tex`
- `湖州学院_开题答辩_Beamer/sections/00-cover.tex`

#### 验证命令（用户可复现）

- 在 `湖州学院_开题答辩_Beamer/` 下运行：`lualatex -interaction=nonstopmode -halt-on-error -output-directory=output_local main.tex`
- 生成封面预览：`pdftoppm -png -f 1 -l 1 -singlefile output_local/main.pdf output_local/preview-01`

### 子任务：AI‑Native Minimal 全套重构（本地编译优先）（2026-01-11）

> 用户选择方案 3（AI‑Native Minimal）：更像现代 AI 产品发布稿；通过“中性底色 + 单一强调色 + 标签/卡片组件语言”把整套 deck 的组件语言统一起来（不仅是封面）。

#### Gate 0：任务说明（可复述）

目标：将 Beamer 的视觉语言从“Apple Light / 代码感 meta”调整为 **AI‑Native Minimal**：

- 更强的组件语言：标签（pills）、信息卡片（cards）、轻分割线、柔和背景块。
- 更克制的排版层级：标题依旧大，但去掉“过黑过重”的压迫感；更强调留白与模块化。
- 强调色从“Apple 蓝”迁移为更“AI”气质的单一强调色（默认 `#6366F1`），其余保持中性灰阶。

范围（本次要做）：

- **整套重构**：`sections/00-cover.tex` 到 `sections/07-references.tex` 全部统一到 AI‑Native 组件语言（pills / cards / bento grid / 轻分割线）。
- 全局 token 一次到位：颜色/字体/块样式/列表/表格/代码块，保证“每一页都是同一套系统”。

非目标（本次不做）：

- 不重排所有章节内容与图表（除非出现明显“风格冲突”）。
- 不引入额外依赖（仍用 LuaLaTeX + TikZ，继续本地编译）。

#### 关键设计决策（已定，除非用户否决）

- 强调色：`accent` → `#6366F1`（AI Indigo）；`success` 可选 `#10B981`；其余保持当前灰阶。
- 组件语言：
  - 封面副标题下新增一行 **pills**：例如 `LangGraph` / `RAG` / `Legal AI`（圆角、浅底、细边）。
  - 个人信息区做成“轻卡片”：浅背景 `bgsoft` + 细边 `line` + 更紧凑的行距。
- 顶部 meta：去掉 `\ttfamily` “终端感”，改成小号 sans + 更轻的灰度（更像产品页页眉）。

#### 验收标准（成功判据）

- [ ] `output_local/preview-01.png` 到 `output_local/preview-08.png`（或至少前 6 页）视觉语言一致：同一强调色、同一圆角/边线/卡片语言。
- [ ] 目录页/正文页/图示页都不再“散”：每页遵循同一网格与组件（pills/cards），信息密度稳定。
- [ ] 本地 `lualatex` 可稳定编译通过；生成 `output_local/main.pdf` 与 `output_local/preview-*.png`。

#### Gate A：步骤拆分（每步产出物 / 验证 / DoD）

1. 更新 `Plan.md` 并获得用户确认（本节）
   - 产出物：本小节计划文本（含 token/pills/cards 方案）
   - 验证：用户确认无误
   - DoD：用户明确回复“确认/可以/OK”

2. 全局 token：调整强调色与组件默认样式
   - 产出物：`湖州学院_开题答辩_Beamer/main.tex`
   - 验证：色板一致（accent 改为 AI Indigo），block/list/footline/表格/代码块在投影下对比清晰
   - DoD：编译通过且“全局看起来是一套系统”

3. 全套页面重构：统一网格与组件语言
   - 产出物：`湖州学院_开题答辩_Beamer/sections/00-cover.tex` ~ `07-references.tex`
   - 方案：每页采用固定模板（标题区 + pills/标签区 + 主内容 cards/bento grid），避免“有的页像论文、有的页像海报”
   - 验证：`preview-01.png`~`preview-08.png` 变化明显且一致
   - DoD：通过本节验收标准

4. 生成与自检（本地）
   - 产出物：`湖州学院_开题答辩_Beamer/output_local/main.pdf`、`.../preview-01.png`
   - 验证：运行命令可复现
   - DoD：用户主观认可“更不丑/更像 AI 产品”

#### 文件清单（预计）

**修改**

- `湖州学院_开题答辩_Beamer/main.tex`
- `湖州学院_开题答辩_Beamer/sections/00-cover.tex`
- `湖州学院_开题答辩_Beamer/sections/01-toc.tex`
- `湖州学院_开题答辩_Beamer/sections/02-background.tex`
- `湖州学院_开题答辩_Beamer/sections/03-methodology.tex`
- `湖州学院_开题答辩_Beamer/sections/04-experiments.tex`
- `湖州学院_开题答辩_Beamer/sections/05-conclusion.tex`
- `湖州学院_开题答辩_Beamer/sections/06-acknowledgements.tex`
- `湖州学院_开题答辩_Beamer/sections/07-references.tex`

#### 验证命令（用户可复现）

- 编译：`lualatex -interaction=nonstopmode -halt-on-error -output-directory=output_local main.tex`
- 预览：`pdftoppm -png -f 1 -l 1 -singlefile output_local/main.pdf output_local/preview-01`

#### 实施进度（2026-01-12）

- 已实现：`accent` 切换到 `#6366F1`，新增 `\pill/\pillaccent/\framepills/\aicard` 组件；`sections/00`–`07` 全部改为“标题 + pills + cards/bento”结构。
- 已生成：`output_local/main.pdf`（当前 12 页）与 `output_local/preview-01.png` ~ `output_local/preview-12.png`（包含 01–08）。
- 待你验收：优先看 `output_local/preview-01.png` ~ `output_local/preview-08.png` 是否“同一套系统”；你确认后我再回写本节验收勾选与结项记录。

**完整本地复现（含参考文献）**

- `lualatex -interaction=nonstopmode -halt-on-error -output-directory=output_local main.tex`
- `biber output_local/main`
- `lualatex -interaction=nonstopmode -halt-on-error -output-directory=output_local main.tex`
- `lualatex -interaction=nonstopmode -halt-on-error -output-directory=output_local main.tex`
- 生成预览（PowerShell）：`1..12 | % { $n = "{0:D2}" -f $_; pdftoppm -png -r 160 -f $_ -l $_ -singlefile output_local/main.pdf ("output_local/preview-$n") }`

#### Gate A：步骤拆分（每步产出物 / 验证 / DoD）

1. 更新 `Plan.md` 并获得用户确认（本节）
   - 产出物：本小节计划文本（含“关键决策/验收标准/文件清单/验证命令”）
   - 验证：用户确认无误
   - DoD：用户明确回复“确认/可以/OK”

2. 实现：标题手动断行 + PDF 元信息兼容
   - 产出物：`湖州学院_开题答辩_Beamer/main.tex`（标题使用 `\\`，并提供不含换行的 short title 用于 PDF metadata / 导航）
   - 验证：封面标题换行位置稳定；PDF 信息/书签不出现奇怪换行符
   - DoD：满足本节“验收标准”第 1 条

3. 实现：表单占位线统一为浅灰 `\rule`
   - 产出物：`湖州学院_开题答辩_Beamer/main.tex`（新增占位线宏，如 `\formline{3.2cm}`）与 `湖州学院_开题答辩_Beamer/sections/00-cover.tex`（使用该宏）
   - 验证：占位线颜色/粗细一致，基线对齐自然（必要时 `\raisebox` 微调）；不影响其他页面
   - DoD：满足本节“验收标准”第 2 条

4. 生成与自检（本地）
   - 产出物：`湖州学院_开题答辩_Beamer/output_local/main.pdf`（更新后的封面）
   - 验证：生成 `output_local/preview-01.png` 或直接打开 PDF 对比封面
   - DoD：满足本节“验收标准”第 3 条

#### 文件清单（预计）

**修改**

- `湖州学院_开题答辩_Beamer/main.tex`
- `湖州学院_开题答辩_Beamer/sections/00-cover.tex`

#### 验证命令（用户可复现）

- 本地编译（建议）：在 `湖州学院_开题答辩_Beamer/` 下运行  
  `latexmk -lualatex -interaction=nonstopmode -halt-on-error -outdir=output_local main.tex`

#### 风险与备选方案

- `\\` 进入 PDF 元信息导致书签换行：通过 `\title[short]{long-with-\\}` 提供 short title 规避；必要时使用 `\texorpdfstring`。
- `\rule` 的垂直对齐略显“沉”：通过 `\raisebox` 微调基线或调整 rule 高度（保持投影清晰）。

### Gate A：步骤拆分（每步产出物 / 验证 / DoD）

1. **定稿 Beamer 大纲与信息架构（10–12 页）**
   - 产出物：页级大纲（每页 1 句结论标题 + 3–5 条要点），来源于仓库事实：`README_zh.md`、`ai-agent/TEST_REPORT.md`、`ai-agent/SETUP.md`、`data/legal-services/index.ts`。
   - 验证：大纲中不出现 Coze；架构组件与仓库一致。
   - DoD：大纲写入本节，且可逐页映射到 `sections/*.tex`。

2. **实现 Apple Light 视觉系统（在 metropolis 上“苹果化”）**
   - 产出物：统一的颜色/字号/间距规则；在 `main.tex` 中落地（`frametitle`、footline、block、itemize、table、listings）。
   - 验证：生成 PDF 预览图（封面/目录/正文各 1 页）肉眼可见一致性提升。
   - DoD：去除多余章节标题页；页脚节奏稳定；灰度对比达标（投影友好）。

3. **内容改写：从“图像识别”迁移到“法律智能体（LangGraph + RAG）”**
   - 产出物：更新 `main.tex` 的 `\title/\subtitle/\author/\institute`；逐文件改写 `sections/*.tex` 文案与图示（架构/流程/里程碑/指标/风险与对策）。
   - 验证：PDF 中每页出现的关键词、模块名与仓库一致（例如：LangGraph、FastAPI、Vectorize、R2、RAG、审计/traceId）。
   - DoD：全套页面内容无“占位符式空话”，且可直接用于答辩讲述。

4. **参考文献与引用**
   - 产出物：更新 `refs.bib`；在正文页加入 2 处以上 `\cite{...}`。
   - 验证：Overleaf 编译后 References 页有条目，且引用编号可显示。
   - DoD：References 页不少于 5 条；引用可追溯到具体来源。

5. **生成与验收（本地/Overleaf）**
   - 产出物：`output_local/main.pdf`（或 Overleaf 导出 PDF）。
   - 验证：本地 `latexmk -lualatex ...`（或 Overleaf）编译通过；导出前 6 页缩略图对比。
   - DoD：通过本节“验收标准”清单。

### 文件清单（预计）

**修改**

- `湖州学院_开题答辩_Beamer/main.tex`
- `湖州学院_开题答辩_Beamer/sections/00-cover.tex`
- `湖州学院_开题答辩_Beamer/sections/01-toc.tex`
- `湖州学院_开题答辩_Beamer/sections/02-background.tex`
- `湖州学院_开题答辩_Beamer/sections/03-methodology.tex`
- `湖州学院_开题答辩_Beamer/sections/04-experiments.tex`
- `湖州学院_开题答辩_Beamer/sections/05-conclusion.tex`
- `湖州学院_开题答辩_Beamer/sections/06-acknowledgements.tex`
- `湖州学院_开题答辩_Beamer/sections/07-references.tex`
- `湖州学院_开题答辩_Beamer/refs.bib`

**可选新增**

- `湖州学院_开题答辩_Beamer/assets/hzu-logo.png`（如提供校徽；否则保持更美观的占位方案）

### 验证命令（用户可复现）

- 本地编译（建议）：`latexmk -lualatex -interaction=nonstopmode -halt-on-error -outdir=output_local main.tex`
- 若 References 不更新：确保 biber 被触发（Overleaf 可尝试 `Recompile from scratch`），或本地跑 `biber output_local/main` 后再编译 1 次。

### 风险与备选方案

- 字体不可用（Overleaf/本地差异）：坚持“存在性判断 + fallback”，必要时回退到 `Latin Modern Sans` + `ctex` 的 `fandol`。
- 灰度投影发虚：减少 `graymedium` 使用范围；正文最小对比度提高到接近 `#334155`（slate）。
- 参考文献链路不稳定（biber 未触发）：保留“无引用也可通过”的临时降级（但验收标准仍要求最终引用可用）。

## （归档）湖州学院\_开题答辩\_Beamer（LuaLaTeX + metropolis）修复计划（2026-01-11）

### Gate 0：任务说明（可复述）

目标：修复 `湖州学院_开题答辩_Beamer/` 在 Overleaf 的编译问题（包括“编译超时/无 PDF”、以及字体/参考文献相关报错），并切换到 `LuaLaTeX` 作为默认编译引擎；同时在不牺牲稳定性的前提下，保持/提升 `metropolis` 的现代极简观感（留白、层级、克制配色、统一组件）。

### 当前复现（Overleaf LuaLaTeX）

- 复现方式：Overleaf 设置编译器为 `LuaLaTeX`，点击 `Recompile`；建议 `Menu -> Recompile from scratch`（清缓存后重编译）以确保日志与中间文件一致。
- 关键错误（会直接中断编译）
  - `湖州学院_开题答辩_Beamer/sections/03-methodology.tex`：`\end{lstlisting}` 前有缩进（不在行首），导致 `lstlisting` 无法正确结束，触发 `Paragraph ended before \lst@next was complete` 并最终 `Emergency stop`。
  - `湖州学院_开题答辩_Beamer/sections/01-toc.tex`：在 `tikzpicture` 的 `\node{...}` 参数里使用 `\begin{spacing}...\end{spacing}`，触发分组错乱，报 `Too many }'s` / `\begin{document} ended by \end{beamer@frameslide}`。
- 注意：上述两处已在仓库内修复；若 Overleaf 仍报相同错误，通常意味着 Overleaf 项目未同步到最新文件，或未执行 `Recompile from scratch` 导致缓存沿用旧中间文件。
- 非致命告警（不阻断编译，先不作为本轮硬性目标）
  - `xeCJK Warning: Unknown CJK family \CJKttdefault`（代码块基本为英文，通常可忽略；若后续需要再补 `\setCJKmonofont` 策略）。

### 关键约束 / 假设

- 默认使用 Overleaf `LuaLaTeX` 编译；若误用 `pdfLaTeX`，需要在 `main.tex` 里给出明确的引擎守卫提示。
- 主题允许使用 `metropolis`（已确认）。
- 参考文献保留 `biblatex + biber`（除非模板强制依赖 `bibtex/natbib`，则在方案讨论后再切换）。
- 变更尽量小：优先修改 `湖州学院_开题答辩_Beamer/main.tex` 与 `湖州学院_开题答辩_Beamer/sections/00-cover.tex`；若章节页存在确定的 TikZ 节点错误（如致谢页），在不改内容的前提下同步修复对应 `sections/*.tex`。

### 范围 / 非目标

**范围（本次要做）**

- 让项目在 Overleaf Free 计划下可完成编译并生成 PDF（无错误）。
- 修复封面 TikZ 布局中的节点命名/引用错误（避免 `No shape named ... is known`）。
- 将页脚/进度条实现切换为 `metropolis` 官方配置（避免手写长度算术导致卡死/超时）。
- 字体策略加上“存在性判断 + fallback”，保证 Overleaf 环境稳定可编译。

**非目标（本次不做）**

- 不重写各章节内容，不做大幅度视觉重构（只做必要的样式与稳定性修复）。
- 不引入需要 `shell-escape` 的依赖（如 minted）。

### 验收标准（成功判据）

- [ ] Overleaf 选择 `LuaLaTeX` 后可成功编译并生成 PDF（无 Errors）。
- [ ] 封面页渲染正常，且不再出现 TikZ/pgf “No shape named ...”。
- [ ] 编译不再出现 “编译超时/无 PDF”（在正常网络与 Overleaf Free 时限内）。
- [ ] 引用与参考文献可正常生成（至少 2 处引用、References frame 正常显示）。

### Gate A：步骤拆分（每步产出物 / 验证 / DoD）

1. **复现并定位编译错误（日志驱动）**
   - 产出物：锁定阻断编译的最小错误集合（文件 + 行号 + 触发机制）。
   - 验证：本地 `lualatex` 可稳定复现（`-halt-on-error`）。
   - DoD：形成可执行的最小修复清单，且写入本节。

2. **修复 `lstlisting` 结束行缩进（sections/03-methodology.tex）**
   - 产出物：确保 `\end{lstlisting}` 必须在行首（无前导空格），避免 listings 误判环境未结束。
   - 验证：`lualatex ...` 不再出现 `\lst@next` 相关 runaway/abort。
   - DoD：该页 frame 可正常结束，编译继续推进。

3. **修复目录页 `spacing` 在 TikZ node 内的分组问题（sections/01-toc.tex）**
   - 产出物：移除/替代 `\begin{spacing}...\end{spacing}`（改用 `\arraystretch` 或 `minipage` 方案），避免 `Too many }'s` / `\end{beamer@frameslide}`。
   - 验证：`lualatex ...` 不再在 `sections/01-toc.tex:28` 附近报错。

### 本地编译（Windows 11 + MiKTeX，安装到 D 盘）

- 安装位置：`D:\MiKTeX`
- 推荐命令（自动跑 biber）：`latexmk -lualatex -interaction=nonstopmode -halt-on-error -outdir=output main.tex`
  - DoD：目录页 frame 进出栈正确，无分组错乱。

4. **预修复实验页的潜在后续错误（sections/04-experiments.tex + main.tex）**
   - 产出物：
     - 将 `\begin{columns}[onlywidth]` 更正为 `\begin{columns}[onlytextwidth]`（避免 beamer columns 选项解析异常）。
     - 启用 `\rowcolor` 支持（通过加载 `colortbl` 或为 `xcolor` 传入 `table` 选项），避免实验结果表格处 `\rowcolor` 未定义。
   - 验证：Overleaf 编译推进到“实验与结果”页时不再因 `columns` 或 `\rowcolor` 报错中断。
   - DoD：实验结果页可正常渲染（含高亮行）。

5. **跑通完整编译流水线（含 biber）**
   - 产出物：可生成最终 PDF。
   - 验证：Overleaf `LuaLaTeX` 编译成功且无 Errors；References frame 正常渲染（参考文献列表可见）。如 Overleaf 未自动跑 biber，则触发二次编译或 `Recompile from scratch`。
   - DoD：References frame 正常渲染（参考文献列表可见）。

6. **验收与回写**
   - 产出物：给出 Overleaf 侧的复现实验步骤（编译器设置、biber 触发、清缓存等）。
   - 验证：用户在 Overleaf 编译确认通过。
   - DoD：将最终决策/踩坑点回写本节。

## 当前执行版本（2026-01-12）：毕设开题答辩 PPTX（Apple Monochrome Minimal · CURRENT）

### 设计原则

1. **绝对可读**：全篇 Light Mode，确保在任何投影仪上清晰可读。
2. **结论即标题**：拒绝描述性标题，标题必须是核心论点。
3. **Bento Grid 布局**：保留信息模块化逻辑，但去除装饰性外壳，利用留白（Whitespace）作为唯一的分隔。
4. **细节暴政**：0.5pt 线条、12px 工业圆角、1.6 倍黄金行高。
5. **静态叙事**：放弃 PPTX 生成不稳定的 Morph，通过页内层级（Hierarchy）引导视线。
6. **零风险字体**：回归系统默认字体，通过字重（Bold/Regular）建立秩序。

### Gate 0：任务说明（可复述）

目标：生成《法律智能体项目》毕设开题答辩 `.pptx`（16:9 / 10 页 / 中文），风格为 **Apple 黑白极简（Keynote 质感）**，重点提升：对比度、排版层级、留白节奏、全局一致的组件语言（卡片/标签/流程），并输出一个可直接用于答辩的最终文件。

非目标（本次不做）：

- 不套用学校强制模板（用户无模板约束）。
- 不做复杂动画/转场（降低现场风险）。
- 不追求“信息塞满”，优先保证投影可读与节奏稳定。

### 关键约束 / 假设

- 时长：8–10 分钟 → **10 页**（已确认）
- 环境：偏亮投影 → 必须 Light Mode、高对比度正文
- 受众：毕业设计开题答辩（系统工程实现主线）→ "酷"来自秩序感与现代科技感，而不是花哨特效
- 无学校模板约束（无 Logo/固定配色要求）
- **字体策略**：脚本生成使用系统字体，**嵌入作为生成后的人工步骤**（PowerPoint -> 选项 -> 保存 -> 嵌入字体）。
- 封面个人信息：默认使用占位符（后续由用户自行替换，避免隐私与错误信息）。

### Deck 大纲（10 页）

1. 封面（题目 + 项目名 + 基本信息占位符）
2. 一句话概览（问题 → 方法 → 价值）
3. 研究背景与痛点（法律场景、效率/一致性/可追溯）
4. 研究目标与研究内容（做什么/不做什么）
5. 需求与约束（合规/安全/可解释/审计）
6. 总体架构（RAG + Agent + Tools + Memory + Observability）
7. 核心模块设计（检索、工具调用、工作流编排、引用链）
8. 数据与知识库（来源、清洗、向量化、版本/更新）
9. 评测与实验设计（正确性/引用准确/鲁棒性/效率）
10. 计划与预期成果（里程碑 + 风险与预案）

### Gate A：步骤拆分（每步产出物 / 验证 / DoD）

1. 同步 `Plan.md` 并获得用户确认
   - 产出物：本节（PPTX CURRENT）计划文本更新
   - 验证：用户回复“确认/OK”
   - DoD：允许进入实现（生成脚本与 PPTX）
2. 更新生成脚本与内容（按 10 页大纲落地）
   - 产出物：`pptx-tools/generate-proposal-defense-apple.cjs`（内容/版式/输出文件名）
   - 验证：本地可执行生成脚本
   - DoD：生成 `.pptx` 且无明显溢出/遮挡
3. 生成最终 PPTX 并做静态自检
   - 产出物：`Equivocal_Legal_开题答辩_final.pptx`
   - 验证：PowerPoint 可正常打开；逐页检查对齐/字号/溢出
   - DoD：满足本节“验收标准”
4. 导出预览图（可选但推荐）
   - 产出物：幻灯片 JPG + 缩略图网格（用于快速审美验收）
   - 验证：3 米法则（手机/投影距离）可读
   - DoD：用户确认“够美观好看”
5. 回写与结项
   - 产出物：在 `Plan.md` 记录最终输出文件、关键决策与踩坑点
   - 验证：用户确认通过
   - DoD：本节标记完成

### 文件清单（预计）

**修改**

- `Plan.md`
- `pptx-tools/generate-proposal-defense-apple.cjs`

**新增/生成（产物）**

- `Equivocal_Legal_开题答辩_final.pptx`

### 验证方式（可复现）

- 生成：`cd pptx-tools; npm run build:proposal:apple`
- 打开检查：PowerPoint（逐页检查溢出/对齐/字体回退）
- 可选预览：`tools/pptx_export_slides.ps1` + `tools/pptx_make_grid.py`

### 当前状态（2026-01-12）

- 已生成最终 PPTX：`Equivocal_Legal_开题答辩_final.pptx`
- 已导出预览图：`equivocal_pptx_renders/开题答辩_final/slide-01.jpg` … `slide-10.jpg`
- 已生成缩略图网格：`equivocal_pptx_renders/开题答辩_final_grid.jpg`

### 范围 / 非目标

**范围（本次要做）**

- 输出 10 页 deck（16:9），形成统一的视觉系统（颜色、字体层级、网格、卡片/标签/流程组件）。
- 将"架构 / 流程 / 计划"至少 2 页做成**主视觉冲击页**（更像产品发布会）。
- 清理"模板感"：弱化雾化毛玻璃与低对比背景，提升可读性与对齐一致性。
- 生成新文件：`Equivocal_Legal_开题答辩_final.pptx`（最终交付）。

**非目标（本次不做）**

- 不追求满屏复杂动画（开题答辩场景收益低、风险高）。
- 不做深度内容重写（只做必要的合并/去重/标题句式优化，以配合 8 分钟节奏）。

### 验收标准（成功判据）

- [x] 输出文件已生成：`Equivocal_Legal_开题答辩_final.pptx`
- [ ] 10 页结构稳定（不再成对重复同页风格）
- [ ] 正文色与背景对比度 ≥ 7:1（WCAG AA 标准）
- [ ] 每页标题 ≤ 15 字，且包含动词或结论
- [ ] 主视觉页信息模块 ≤ 5 个
- [x] 已导出 JPG 预览：`equivocal_pptx_renders/开题答辩_final/slide-01.jpg` … `slide-10.jpg`
- [ ] 3 米外能读清标题（3 米法则）
- [ ] 全局一致的视觉语言：同类页面（封面/章节/内容/图示/收尾）样式一致
- [ ] 字体已嵌入，在无字体机器上打开不变形

---

## 视觉方案（Apple Monochrome Minimal）

### 风格关键词（用于锁定风格）

Light mode, Apple Keynote-like minimalism, warm white canvas, strong typographic hierarchy, generous whitespace, strict alignment rhythm, strict monochrome palette, hairline dividers, restrained chips, calm diagrams, bright-projector readable.

### 色彩系统（Strict Monochrome + Risk Red）

| 用途            | 色值      | 说明                                   |
| --------------- | --------- | -------------------------------------- |
| 背景            | `#FBFBFD` | Apple Web Background（暖白，投影友好） |
| 卡片/分区       | `#F5F5F7` | Apple System Gray 6（极淡灰卡片）      |
| 主文字          | `#1D1D1F` | Primary Label（高对比、易读）          |
| 次文字          | `#86868B` | Secondary Label（辅助信息）            |
| 线条 (Hairline) | `#D2D2D7` | Separator（0.5pt 细分割线）            |
| 强调色          | `#1D1D1F` | 强调靠字重/字号，而非彩色              |
| 风险/警告       | `#DC2626` | System Red（少量使用，突出边界/风险）  |

### 字体系统（Windows Safe）

**字体选择（兼容性优先）**

- 中文：`Microsoft YaHei`（标题 Bold，正文 Regular）
- 英文/数字：`Arial`（最安全的无衬线体）
- **回退机制**：若 YaHei 不可用，回退至 `SimHei (黑体)`

**字号层级表**

| 层级    | 用途          | 字号 | 字重    | 行高 |
| ------- | ------------- | ---- | ------- | ---- |
| H1      | 封面大标题    | 48pt | Bold    | 1.2  |
| H2      | 章节/结论标题 | 32pt | Bold    | 1.2  |
| H3      | 模块/卡片标题 | 24pt | Bold    | 1.3  |
| Body    | 核心正文      | 20pt | Regular | 1.5  |
| Caption | 注释/脚注     | 14pt | Regular | 1.4  |
| Micro   | 页脚系统信息  | 10pt | Regular | 1.2  |

### 版式与尺寸

**画布**

- 比例：16:9（PowerPoint 默认宽屏）
- 尺寸：33.87cm × 19.05cm

**安全边距**

- 左右：2cm
- 顶部：1.5cm
- 底部：1.2cm

**网格系统（修正版）**

- 6 列网格
- 列宽：4.5cm
- 列间距：0.5cm
- 左右边距：2.18cm (自动居中)

### 组件语言

**背景（Background System）**

- 默认内容页：`#FFFFFF` 纯白底（确保最大对比度）
- 分区：用 `#F9F9F9` 的轻底色块划分信息区域（避免重边框）

**标题区（Header System）**

- 标题采用"结论句"写法（例如：`系统拆分为四层，保证可追溯与可运维`）
- 章节信息做成极简小字（10pt），作为"信息锚点"，但不抢视觉

**卡片（Card System / Bento Grid）**

- 背景色：`#F9F9F9` (极淡灰，区分于白底)
- 分割线：`#E5E5E5`，**0.5pt**
- 阴影：**无阴影** (Flat)，彻底消除廉价感风险
- 圆角：**0.32cm (12px)**
- 逻辑：采用非对称网格，通过卡片大小表达信息权重

**标签（Tag / Chip）**

- 背景：`#E5E5E5` (匹配 Hairline)
- 文字：`#525252` (匹配次文字)
- 风险标签：文字改为 `#DC2626`
- 用途固定：`章节` / `模块名` / `验收指标` / `风险`（四类足够）

**图示与数据（Diagram & Data System）**

- 主线条：1pt，颜色 `#000000`
- 辅助线：0.5pt，颜色 `#E5E5E5`
- 架构图：以"分层栈 + 模块卡片 + 连接关系"表达，避免图标堆叠。
- 流程图：以"编号 Step + 主路径实线 + 失败/降级虚线"表达。
- **数据图表**：严禁直接粘贴 Excel/Matplotlib 截图。必须重绘为 Apple Health 风格（圆角柱状图、平滑曲线、极简坐标轴）。
- **界面展示 (Mockup)**：所有系统截图必须套入 **MacBook Pro 16" (Space Gray)** 样机外壳，严禁裸图直出。

**页脚（可选，增强发布会感）**

- 位置：左下角
- 内容：`EQUIVOCAL LEGAL // VERSION: apple_v1`
- 字号：10pt
- 颜色：`#000000`，透明度 30%

### 动效策略（Static）

- **全静态**：不做任何页面切换动画，依靠页面排版节奏引导。
- **理由**：pptxgenjs 生成稳定性优先，避免现场演示卡顿。

### 执行红线（绝对不可触碰）

1.  **严禁使用任何阴影**：全篇采用 Flat 风格。如果觉得层次不够，那是排版问题，不要试图用阴影掩盖。
2.  **严禁使用默认文本框边距**：PPT 默认文本框内边距是 0.25cm，必须改为 **0**，依靠外部对齐来控制留白。
3.  **严禁拉伸图片**：任何图片变形 1%，直接废弃。

---

## 内容大纲（10 页，8 分钟）

| 页码     | 内容                                     | 类型       | 时长       | 信息密度 |
| -------- | ---------------------------------------- | ---------- | ---------- | -------- |
| 1        | 封面：项目名 + 副标题 + 汇报人/导师/日期 | 封面       | 15s        | 低       |
| 2        | 背景与痛点：3 点（成本/风险/检索）       | 内容       | 60s        | 中       |
| 3        | 目标与范围：目标 3 条 + 非目标 2 条      | 内容       | 45s        | 中       |
| 4        | 方案概览：一句话方案 + 核心价值          | 内容       | 45s        | 低       |
| 5        | 系统总体架构（主视觉）：四层架构         | **主视觉** | 90s        | 高       |
| 6        | 工程实现要点：API/鉴权/日志/数据         | 内容       | 60s        | 中       |
| 7        | 关键流程（主视觉）：用户→系统→模型→输出  | **主视觉** | 60s        | 高       |
| 8        | 计划与里程碑（主视觉）：时间轴 + 交付物  | **主视觉** | 45s        | 中       |
| 9        | 风险与对策：3 个主要风险 + 应对          | 内容       | 30s        | 中       |
| 10       | 预期成果 + Q&A：验收指标 + 开放提问      | 收尾       | 30s        | 低       |
| **合计** |                                          |            | **8 分钟** |          |

**内容节奏说明**：

- 第 5 页（架构）是信息高峰，之后第 6 页适当降低密度
- 第 7 页（流程）是第二个高峰，用图示而非文字
- 第 8-10 页逐渐收尾，信息密度递减

---

## 实现方案

### 已确定：路线 A（重建新 deck）

选择理由：

- 更容易彻底统一风格与去模板感
- 避免历史元素干扰
- 风险更低，可控性更强

### 执行步骤

0. **Repo 清理（仅删废弃物）**：删除旧生成脚本、渲染产物、设计废弃文件、临时文档与废弃图片（见下方清单）；避免误用旧脚本/旧渲染结果干扰当前路线 A。
1. **样稿阶段**：先做 3 页样稿（封面 / 系统架构 / 计划里程碑）
2. **确认阶段**：产出缩略图网格，确认"发布会酷感"是否到位
3. **铺满阶段**：确认后铺满全部 10 页
4. **验收阶段**：导出 JPG，3 米法则测试，字体嵌入检查

### 文件清单

**修改**

- `Plan.md`（本文件）

**计划删除（已确认废弃 / 非产物文件）**

- 生成脚本：`generate_bg.js` `generate_final.js` `generate-masterpiece.cjs` `html2pptx.js` `test_anim.js` `PresentationPreview.jsx`
- 渲染产物目录：`_render/` `equivocal_pptx_renders/` `_unpacked/`
- 设计废弃目录/文档：`_design/` `Equivocal_Precision_Philosophy.md` `_analysis_masterpiece.md`
- 临时文档：`1.tex` `database_tables.tex` `er_diagram.tex` `system_structure.tex` `tech_architecture.tex` `use_case_diagram.tex` `TEST_REPORT_2025_12_26.md`
- 废弃图片：`background_mesh.png` `background.png` `Equivocal_Legal_Identity.png` `equivocal_thumb_grid_apple_v1.jpg` `equivocal_thumb_grid.jpg`
- 旧 PowerPoint COM 生成脚本：`tools/build_ideal_deck.ps1`（依赖 `_design/`，已同步删除）

**预计新增**

- `pptx-tools/generate-proposal-defense-apple.cjs`（Apple 黑白极简版生成脚本）
- `pptx-tools/package.json`（新增 npm script：`build:proposal:apple`）

---

## Repo 清理（2026-01-11）

### 目标 / 非目标

- 目标：把已废弃的脚本、渲染产物、临时文档、废弃图片从工作区移除，降低误用与噪音。
- 非目标：不删除任何当前路线 A 必要的源码/资源；不改动 PPT 生成逻辑与设计规范本身。

### 风险与回滚

- 风险：若仍有地方引用这些文件，会导致脚本/文档链接失效。
- 回滚：若处于 git 管理下，可通过 `git restore <path>` 或 `git checkout -- <path>` 恢复；否则需从备份恢复。

### 验收方式（DoD）

- 删除清单中的文件/目录后，`git status` 只出现预期的删除项。
- `package.json` 不再引用已删除的 `generate_final.js`（避免 Node tooling 误指向）。
- `rg -n "generate_bg\\.js|generate_final\\.js|generate-masterpiece\\.cjs|html2pptx\\.js|PresentationPreview\\.jsx|_render/|equivocal_pptx_renders/|_unpacked/|_design/"` 在仓库内无有效引用（允许历史/说明性文本按需保留）。
- `Equivocal_Legal_开题答辩_final.pptx`（最终成品）

**可选工具**

- `tools/pptx_export_slides.ps1`（导出幻灯片 JPG）
- `tools/pptx_make_grid.py`（拼接缩略图网格）

---

## 验证方式

### 视觉验收（推荐）

1. 导出所有幻灯片为 JPG
2. 拼成缩略图网格
3. 检查：节奏/一致性/可读性

### 3 米法则测试

1. 导出 JPG 到手机
2. 把手机放在 3 米外
3. 检查：能否读清每页标题

### 人工检查清单

- [ ] 标题是否清晰（≤ 15 字，包含结论）
- [ ] 正文是否可读（≥ 20pt）
- [ ] 是否存在文字溢出/遮挡
- [ ] 对齐是否统一
- [ ] 字体是否已嵌入

---

## 风险与备选方案

| 风险         | 影响                | 备选方案                                                                    |
| ------------ | ------------------- | --------------------------------------------------------------------------- |
| 字体未嵌入   | 答辩机上排版错乱    | PowerPoint 手动嵌入字体；若环境不支持嵌入则回退至 `SimHei/Arial` 并复检版式 |
| 投影仪色差   | 颜色偏黄/偏蓝       | 提前到答辩教室测试，必要时调整色彩                                          |
| 亮环境导致灰 | 次文字看不清        | 放弃次文字灰，全篇强制使用 `#000000` 纯黑                                   |
| 主视觉页太乱 | 架构/流程图难以理解 | 严格网格，减少形状种类，用颜色语法表达层级                                  |
| 时间超限     | 8 分钟讲不完        | 准备 6 分钟精简版，砍掉第 6 页或第 9 页                                     |

---

## 已确认事项（Gate D）

- [x] 页数：10 页
- [x] 风格倾向：Apple Monochrome Minimal (Strict Light Mode)
- [x] 封面保留大字：`EQUIVOCAL LEGAL`
- [x] 输出文件：`Equivocal_Legal_开题答辩_final.pptx`
- [x] 实现路线：路线 A（重建新 deck）
- [x] 字体策略：Microsoft YaHei + Arial (Windows Safe)

---

## 参考案例

1. [Apple Keynote 2023 - iPhone 15 发布会](https://www.apple.com/apple-events/)
   - 参考：极简排版、大标题、留白节奏
2. [Stripe Press 演示文稿风格](https://press.stripe.com/)
   - 参考：黑白极简、信息层级、图表语言
3. [Linear 产品发布会](https://linear.app/)
   - 参考：现代科技感、克制的动效

---

## 历史版本（归档）

### Aurora Minimal Tech（2026-01-10）

> 归档说明：从 Aurora 切换到 Apple 黑白极简，但 Aurora 方案保留可回退。
>
> - 输出文件：`Equivocal_Legal_Masterpiece_opening_v2.pptx`
> - 生成脚本：`pptx-tools/generate-proposal-defense-aurora.cjs`
> - 风格特点：深色背景、极光渐变、赛博科技感

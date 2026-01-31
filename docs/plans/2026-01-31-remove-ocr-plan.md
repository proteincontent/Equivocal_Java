# Remove OCR Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** 彻底删除 AI Agent 的 OCR 能力：移除 OCR 工具、代码与依赖，保证服务可正常启动与聊天 API 可用。

**Architecture:** 从 LangGraph tools 列表中移除 `extract_text_from_file`，删除 `ai-agent/app/tools/ocr.py`，并移除 `requirements.txt` 中 OCR 相关依赖（`easyocr`, `opencv-python-headless`，以及仅 OCR 使用的依赖若无其它引用也一并删除）。

**Tech Stack:** FastAPI + Uvicorn + LangGraph/LangChain

---

### Task 1: 删除 OCR 工具代码与导入

**Files:**
- Delete: `ai-agent/app/tools/ocr.py`
- Modify: `ai-agent/app/graph/agent.py`

**Step 1: 移除工具导入与 tools 列表项**
- 删除 `from app.tools.ocr import extract_text_from_file`
- 从 `tools = [...]` 中删除 `extract_text_from_file`
- 更新启动日志 `Available tools:`，不再提 OCR

**Step 2: 启动导入验证**
- 前置：若 `ai-agent/.env` 不存在（通常被 gitignore），先创建一个仅用于本地启动的占位 `.env`（不要提交）：
  - `LLM_API_KEY=dummy`
  - `LLM_API_BASE=http://example.invalid/v1`
  - `LLM_MODEL=dummy`
  - `EMBEDDING_API_KEY=dummy`
  - `CF_ACCOUNT_ID=dummy`
  - `CF_API_TOKEN=dummy`
  - `R2_ACCESS_KEY_ID=dummy`
  - `R2_SECRET_ACCESS_KEY=dummy`
  - `R2_ENDPOINT_URL=http://example.invalid`
  - `R2_BUCKET_NAME=dummy`
  - `R2_PUBLIC_URL=http://example.invalid`
- Run: `cd ai-agent; python -c "import app.graph.agent"`
- Expected: exit code 0

**Step 3: Commit**
- Run: `git add -A`
- Run: `git commit -m "refactor(ai-agent): remove ocr tool"`

---

### Task 2: 移除 OCR 依赖

**Files:**
- Modify: `ai-agent/requirements.txt`

**Step 1: 删除依赖行**
- 删除 `easyocr>=...`
- 删除 `opencv-python-headless>=...`
- 若 `numpy` 仅 OCR 使用且仓库其他地方没有 `import numpy`，则也移除；否则保留。

**Step 2: 依赖一致性检查（轻量）**
- Run: `python -m pip install -r ai-agent/requirements.txt --dry-run`
- Expected: 不再拉取 easyocr/torch/torchvision/opencv

**Step 3: Commit**
- Run: `git add ai-agent/requirements.txt`
- Run: `git commit -m "chore(ai-agent): drop ocr dependencies"`

---

### Task 3: 更新文档/兼容性说明

**Files:**
- Modify: `ai-agent/SETUP.md`
- Modify: `ai-agent/TEST_REPORT.md`
- Modify: `ai-agent/API_COMPATIBILITY_ISSUES.md`

**Step 1: 移除 OCR 相关描述**
- 删除或改写“工具列表/能力列表”中与 OCR 相关的条目，保持描述准确。

**Step 2: Commit**
- Run: `git add ai-agent/SETUP.md ai-agent/TEST_REPORT.md ai-agent/API_COMPATIBILITY_ISSUES.md`
- Run: `git commit -m "docs(ai-agent): remove ocr references"`

---

### Task 4: 端到端启动验证

**Step 1: 启动服务（短时）**
- Run: `cd ai-agent; python main.py`
- Expected: 看到 `Uvicorn running on http://127.0.0.1:8100`

**Step 2: 端点探活**
- Run: `powershell -c \"try { (Invoke-WebRequest http://127.0.0.1:8100/ -UseBasicParsing).StatusCode } catch { $_.Exception.Message }\"`
- Expected: `200`

**Step 3: 停止服务**
- 手动 `Ctrl+C` 或 `taskkill` 结束进程（避免占用端口）

---

### Task 5: 合并与清理

**Step 1: 合并回 main**
- Run (from repo root): `git checkout main`
- Run: `git merge remove-ocr`

**Step 2: 清理 worktree**
- Run: `git worktree remove --force <worktree-path>`
- Run: `git branch -d remove-ocr`

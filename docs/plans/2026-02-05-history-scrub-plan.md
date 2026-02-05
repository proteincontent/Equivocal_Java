# Git History Secrets Scrub Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** 在“仓库已推到远端/可能被他人 clone”的前提下，把历史提交中出现过的敏感信息按泄露处置：先轮换/作废，再重写 Git 历史清除痕迹，并用 CI 全历史扫描验证。

**Architecture:** 两条线并行：A) 运营侧先轮换所有可能暴露的凭据；B) 代码侧用独立镜像仓库在本地做历史重写（不在主工作目录直接操作），完成后强制推送覆盖远端历史。最后触发 gitleaks 全历史扫描做证据闭环。

**Tech Stack:** Git (Windows), `git filter-branch`, GitHub Actions gitleaks workflow (`.github/workflows/secrets-scan.yml`).

---

### Task 1: 立即轮换/作废所有受影响凭据（必须）

**Files:**
- N/A（运维/平台操作）

**Step 1: 轮换/作废清单**
- 数据库：重置历史中出现过的账号密码；推荐新建最小权限账号并替换部署变量
- JWT：轮换 `JWT_SECRET`（旧 token 全失效是预期行为）
- 第三方：轮换 `RESEND_API_KEY`（以及任何其它 key）

**Step 2: 验证旧值已不可用**
- 以最小权限方式验证（不要把明文写进仓库/终端历史）

---

### Task 2: 记录“泄露证据”但不打印明文（用于复盘）

**Files:**
- N/A

**Step 1: 定位出现/修复的提交（不会输出匹配内容）**

Run:
- `git log --all --oneline -S "tidbcloud.com" -- backend/src/main/resources/application.yml`
- `git log --all --oneline -S "gateway01." -- backend/src/main/resources/application.yml`
- `git log --all --oneline -G "SPRING_DATASOURCE_PASSWORD:[^}]" -- backend/src/main/resources/application.yml`

Expected: 输出包含相关提交摘要（仅 SHA+message）

---

### Task 3: 在独立目录创建 scrub 仓库（避免污染工作区）

**Files:**
- N/A（本地临时目录，不能提交）

**Step 1: 获取远端地址**

Run: `git remote get-url origin`

**Step 2: 创建 scrub 仓库（非 bare，方便脚本操作）**

Run:
- `cd ..`
- `git clone <REMOTE_URL> Equivocal_Java-scrub`
- `cd Equivocal_Java-scrub`

**Step 3: 可选备份 tag（仅本地）**

Run: `git tag pre-history-scrub-2026-02-05`

---

### Task 4: 重写历史：把敏感文件在所有提交中替换为安全版本

**Files:**
- Rewrite: `backend/src/main/resources/application.yml`（所有历史提交）

**Step 1: 准备“安全内容”文件（来自当前 main 的安全版本）**

Run:
- `git show origin/main:backend/src/main/resources/application.yml > .scrub-application.yml`

> 注意：这个文件应当已经是不含敏感默认值的安全版本；不要用旧 commit 导出。

**Step 2: 运行 filter-branch（index-filter：不依赖工作区、不打印内容）**

Run (Git Bash / sh 环境更稳；Windows 下 Git 自带 sh 通常可用):

```bash
SAFE_BLOB=$(git hash-object -w .scrub-application.yml)
git filter-branch -f --index-filter "
  git rm --cached --ignore-unmatch backend/src/main/resources/application.yml >/dev/null 2>&1
  git update-index --add --cacheinfo 100644,$SAFE_BLOB,backend/src/main/resources/application.yml
" --tag-name-filter cat -- --all
```

**Step 3: 清理残留引用**

Run:
- `rm -rf .git/refs/original`
- `git reflog expire --expire=now --all`
- `git gc --prune=now --aggressive`

Expected: 本地仓库历史已被重写

---

### Task 5: 本地验证“历史中不再包含泄露指纹”

**Files:**
- N/A

**Step 1: 验证关键指纹不再出现在历史**

Run:
- `git log --all --oneline -S "tidbcloud.com" -- backend/src/main/resources/application.yml`
- `git log --all --oneline -S "gateway01." -- backend/src/main/resources/application.yml`
- `git log --all --oneline -G "SPRING_DATASOURCE_PASSWORD:[^}]" -- backend/src/main/resources/application.yml`

Expected: 无输出（exit 0 但为空）

---

### Task 6: 强制推送覆盖远端历史（高风险，需要确认）

**Files:**
- N/A

**Step 1: 推送（force-with-lease）**

Run:
- `git push --force-with-lease origin --all`
- `git push --force-with-lease origin --tags`

**Step 2: 协作者同步指引**
- 要求所有人重新 clone，或 `fetch` + `reset --hard` 对齐

---

### Task 7: 远端全历史扫描闭环（证据）

**Files:**
- Uses: `.github/workflows/secrets-scan.yml`

**Step 1: 在 GitHub Actions 手动触发**
- 触发 `.github/workflows/secrets-scan.yml` 的 `workflow_dispatch`
- 勾选 `scan_history=true`

Expected: gitleaks detect 通过（无泄露）


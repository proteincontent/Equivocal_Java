# Backend CI (GitHub Actions) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** 在 GitHub 上为 `backend` 增加持续集成（CI），确保每次 push/PR 都会自动执行 `backend` 的测试，减少回归风险。

**Architecture:** 只新增 GitHub Actions workflow，不改业务逻辑；优先匹配现有 Windows + Maven Wrapper (`mvnw.cmd`) 的本地习惯，避免环境差异；触发条件使用 `paths` 限定在 `backend/**` 或 workflow 变更时才跑，节省 CI 时间。

**Tech Stack:** GitHub Actions, Windows runner, Java 8, Maven Wrapper (`backend/mvnw.cmd`)

---

### Task 1: 添加 GitHub Actions workflow（backend CI）

**Files:**
- Create: `.github/workflows/backend-ci.yml`

**Step 1: 写 workflow（先不改业务代码）**
- Job: `backend-tests`
- Runner: `windows-latest`
- JDK: 8 (Temurin)
- Working dir: `backend`
- Command: `.\\mvnw.cmd -B test`
- 缓存：`actions/setup-java@v4` 的 `cache: maven`

**Step 2: 本地验证（确保项目仍可测试）**

Run: `cd backend; .\\mvnw.cmd test`
Expected: `BUILD SUCCESS`（0 failures）

**Step 3: 提交并走 PR**

```powershell
git checkout -b backend-ci-YYYY-MM-DD
git add .github/workflows/backend-ci.yml docs/plans/2026-02-05-backend-ci-plan.md
git commit -m "CI: add backend test workflow"
git push -u origin backend-ci-YYYY-MM-DD
gh pr create --base main --head backend-ci-YYYY-MM-DD --title "CI: backend tests" --body "<summary + test plan>"
```

**Step 4: 合并后复验**

Run: `git checkout main; git pull`
Run: `cd backend; .\\mvnw.cmd test`
Expected: `BUILD SUCCESS`


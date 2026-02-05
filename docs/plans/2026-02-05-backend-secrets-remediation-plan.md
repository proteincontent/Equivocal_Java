# Backend Secrets Remediation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** 移除仓库中已提交的敏感信息默认值（数据库凭据 / API key / token），并加上自动化扫描，防止再次把密钥提交进 Git。

**Architecture:** 用“测试先行 + 配置最小化”的方式：先新增一个会失败的单测，确保 `backend/src/main/resources/application.yml` 不包含远程数据库/非空密码/非空 API key 默认值；再最小化修改配置使其通过；最后在 CI 中加入 secrets 扫描（与现有后端 CI 互补）。

**Tech Stack:** Maven Wrapper (`backend/mvnw.cmd`), JUnit 5, GitHub Actions, (可选) gitleaks.

---

### Task 1: 新增“资源文件不含密钥默认值”的回归测试（RED）

**Files:**
- Create: `backend/src/test/java/com/equivocal/NoSecretsInResourcesTest.java`

**Step 1: 写 failing test**
- 读取类路径资源 `application.yml`
- 断言：
  - `spring.datasource.url` 的默认值只允许指向 `localhost`/`127.0.0.1`（禁止远程域名默认值）
  - `spring.datasource.password` 默认值必须为空（例如 `${SPRING_DATASOURCE_PASSWORD:}`）
  - `resend.api-key` 默认值必须为空（例如 `${RESEND_API_KEY:}`）
  - 禁止出现明显 token 形态前缀（如 `eyJ`、`pat_`、`sk-`）

**Step 2: Run test to verify it fails**

Run: `cd backend; .\\mvnw.cmd -q -Dtest=NoSecretsInResourcesTest test`

Expected: FAIL（当前 `application.yml` 含远程数据库/非空默认值）

---

### Task 2: 清理 `application.yml` 的敏感默认值（GREEN）

**Files:**
- Modify: `backend/src/main/resources/application.yml`

**Step 1: 最小修改配置**
- 将以下配置改成“本地安全默认值 + 仅靠环境变量注入敏感项”：
  - `spring.datasource.url` 默认值改为 `jdbc:mysql://localhost:3306/equivocal?...`
  - `spring.datasource.username` 默认值改为 `root`（或空）
  - `spring.datasource.password` 默认值改为空
  - `resend.api-key` 默认值改为空
- 保持其他现有参数结构不变（避免影响运行时行为）

**Step 2: Run test to verify it passes**

Run: `cd backend; .\\mvnw.cmd -q -Dtest=NoSecretsInResourcesTest test`

Expected: PASS

---

### Task 3: 增加 secrets 扫描到 CI（防回归）

**Files:**
- Create: `.github/workflows/secrets-scan.yml`
- (Optional) Create: `.gitleaks.toml`

**Step 1: 写 workflow**
- 触发：`push` / `pull_request`
- `paths`：至少包含 `backend/**`, `.github/workflows/**`, `docs/plans/**`
- 扫描工具（任选其一）：
  - **gitleaks**（推荐）
  - 或 GitHub 官方 secret scanning（若仓库启用 Advanced Security）

**Step 2: 本地快速验证（只验证后端不受影响）**

Run: `cd backend; .\\mvnw.cmd -q test`

Expected: `BUILD SUCCESS`

---

### Task 4: 处理“历史提交已泄露”的现实（操作性步骤）

**Files:**
- N/A（这是运维/仓库操作）

**Step 1: 立刻轮换/作废所有已暴露凭据**
- 数据库：`SPRING_DATASOURCE_PASSWORD` 对应账号的密码（必要时新建只读/最小权限账号）
- JWT：`JWT_SECRET`
- Resend：`RESEND_API_KEY`
- 任何曾出现在提交里的 token（即使“现在不用了”，也应作废）

**Step 2: 判断是否需要重写 Git 历史**
- 如果仓库曾推送到远端 / 多人可见 / 公开：建议用 `git filter-repo` 或 BFG 清理历史，然后 `force push`（需全员配合重新拉取/重置）。

> 注：历史清理命令与策略依赖你希望保留/删除哪些路径；执行前务必备份，并在单独分支/镜像仓库演练。

---

### Task 5: Fresh 验证（必须）

**Step 1: 运行全量后端测试**

Run: `cd backend; .\\mvnw.cmd test`

Expected: `BUILD SUCCESS`（0 failures）

**Step 2: repo 全局搜索明显 token 形态**

Run: `rg -n \"(eyJhbGci|\\bpat_|\\bsk-|BEGIN( RSA)? PRIVATE KEY)\" -S --glob \"!docs/**\" --glob \"!backend/src/test/**\" --glob \"!node_modules/**\" --glob \"!backend/target/**\"`

Expected: `backend/src/main/**` / `backend/src/main/resources/**` 无匹配（文档/测试中的示例字符串不计）


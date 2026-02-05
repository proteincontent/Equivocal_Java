# 2026-02-05 Secrets Remediation Runbook

**背景：** 本仓库历史中曾提交过敏感配置（例如远程数据库连接信息/非空默认密码）。即使当前版本已清理，也必须按“已泄露”处理并做密钥轮换；否则攻击者仍可能从历史提交获取。

## 1) 先确认“是否出现在历史里”（不打印密钥）

只用 `git log -S/-G` 这类不会输出匹配内容的命令：

```bash
# 例：定位远程 DB host 出现/消失的提交（仅显示提交摘要）
git log --all --oneline -S "tidbcloud.com" -- backend/src/main/resources/application.yml

# 例：定位某个已知字符串（如果你手头有）出现/消失的提交
git log --all --oneline -S "<SUSPECTED_VALUE>" -- backend/src/main/resources/application.yml

# 例：查找是否有把 env placeholder 写成了“非空默认值”
git log --all --oneline -G "SPRING_DATASOURCE_PASSWORD:[^}]" -- backend/src/main/resources/application.yml
git log --all --oneline -G "RESEND_API_KEY:[^}]" -- backend/src/main/resources/application.yml backend/src/main/resources/application.yml.example
git log --all --oneline -G "JWT_SECRET:[^}]" -- backend/src/main/resources/application.yml backend/src/main/resources/application.yml.example
```

## 2) 立刻做密钥轮换/作废（必须）

按“已经泄露”处理，优先级从高到低：

1. **数据库账号密码**
   - 给 `SPRING_DATASOURCE_USERNAME` 对应账号重置密码，或直接新建最小权限账号（推荐）。
   - 生产/测试/开发如果共用同一套凭据：全部轮换。
2. **JWT 密钥**
   - 轮换 `JWT_SECRET`。
   - 注意：轮换后，旧 token 会全部失效（这是预期的安全行为）。
3. **邮件/第三方服务 API key**
   - 轮换 `RESEND_API_KEY`（以及任何其他第三方 key）。
4. **任何曾经提交过的 token**
   - 即使“现在不用了”，也要作废：历史可被复原，泄露不可逆。

> 轮换完成后，务必检查部署平台/CI 中是否还保留旧值（Secrets、环境变量、配置中心）。

## 3) 是否要清理 Git 历史（建议）

即使轮换完成，**历史仍然暴露**：任何拿到旧 commit 的人都能看到当时的内容。

### 选项 A：只轮换（最快）

适合：仓库从未推送远端、只有你自己可见、且能保证旧历史从未外泄。

### 选项 B：轮换 + 历史清理（推荐）

适合：仓库曾推送远端 / 多人协作 / 任何形式公开或可见。

下面给一个**不会把密钥打印到终端**的最小历史清理方案：把敏感文件从所有历史提交中移除（当前 HEAD 再提交安全版本）。

> 注意：历史重写会改变 commit SHA，需要全员配合；执行前务必备份，并在镜像仓库演练。

#### B1) 在镜像仓库里重写（推荐流程）

```bash
# 1) 创建 mirror（本地目录示例：../repo-scrub.git）
git clone --mirror <REMOTE_URL> ../repo-scrub.git
cd ../repo-scrub.git

# 2) 从所有历史提交移除敏感路径（示例：application.yml）
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/src/main/resources/application.yml" \
  --prune-empty --tag-name-filter cat -- --all

# 3) 清理残留引用
rm -rf refs/original
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

PowerShell 等价清理（可选）：

```powershell
Remove-Item -Recurse -Force refs/original
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

#### B2) 推送清理后的历史（需要谨慎）

```bash
# 把 mirror 推回远端（会覆盖历史！）
git push --force --mirror
```

#### B3) 全员同步指引（必须）

所有协作者需要：

```bash
# 备份自己的改动，然后重新 clone（最省事）
git clone <REMOTE_URL>

# 或者强制对齐（有风险，需确保本地无重要未推送提交）
git fetch --all
git reset --hard origin/main
```

## 4) 历史清理后验证

- CI：运行 `.github/workflows/secrets-scan.yml` 的 **workflow_dispatch**，把 `scan_history=true` 打开，做一次全历史扫描。
- 本地：跑后端测试并做 token 形态搜索：

```bash
cd backend
./mvnw test

rg -n "(eyJhbGci|\\bpat_|\\bsk-|BEGIN( RSA)? PRIVATE KEY)" -S
```

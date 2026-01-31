# AI Agent 配置指南

## 已完成的工作

✅ Cloudflare Vectorize Index 已创建：`legal-knowledge-base` (1024维)  
✅ Account ID 已获取：`b462dd81de6c81987e7b9f5cd0fab6c2`  
✅ LLM 和 Embedding 配置已更新

## 需要您完成的配置

### 1. 获取 Cloudflare API Token

⚠️ **此步骤必须在 Dashboard 完成**（Wrangler 无法创建 API Token）

1. 访问 [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. 点击 **"Create Token"**
3. 选择 **"Create Custom Token"**
4. 配置：
   - **Token name**: `AI-Agent-Token`
   - **Permissions**:
     - `Account` → `Vectorize` → `Edit`
     - `Account` → `R2` → `Edit`
   - **Account Resources**: Include → Your Account
5. 点击 **"Continue to summary"** → **"Create Token"**
6. **复制 Token**（只显示一次！）
7. 更新 `ai-agent/.env`:
   ```env
   CF_API_TOKEN=你复制的Token
   ```

### 2. 创建 R2 Bucket

✅ **使用 Wrangler CLI（推荐）**

```bash
# 创建 bucket
wrangler r2 bucket create legal-agent-files

# 验证创建成功
wrangler r2 bucket list
```

**或使用 Dashboard**:

1. 访问 [R2 Overview](https://dash.cloudflare.com/?to=/:account/r2)
2. Create bucket → 名称: `legal-agent-files` → Create

### 3. 获取 R2 API 凭证

⚠️ **此步骤必须在 Dashboard 完成**（Wrangler 无相关命令）

1. 在 [R2 Overview](https://dash.cloudflare.com/?to=/:account/r2) 页面
2. 右侧点击 **"Manage R2 API Tokens"**
3. 点击 **"Create API Token"**
4. 配置：
   - **Token name**: `AI-Agent-R2-Token`
   - **Permissions**: `Admin Read & Write`
   - **TTL**: 选择有效期（建议 Forever）
5. 点击 **"Create API Token"**
6. **复制凭证**（只显示一次！）:
   - `Access Key ID`
   - `Secret Access Key`
   - `Endpoint URL`

### 4. 更新 `.env` 文件

将上面获取的 R2 凭证填入：

```env
# R2 存储配置
R2_ACCESS_KEY_ID=你的_Access_Key_ID
R2_SECRET_ACCESS_KEY=你的_Secret_Access_Key
R2_ENDPOINT_URL=https://b462dd81de6c81987e7b9f5cd0fab6c2.r2.cloudflarestorage.com
R2_BUCKET_NAME=legal-agent-files
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev  # 如启用了 Public Access
```

### 5. 初始化知识库

所有配置完成后，运行：

```bash
python ai-agent/scripts/init_knowledge_base.py
```

### 6. 启动服务

```bash
# 方式 1：使用启动脚本（Windows）
ai-agent\start.bat

# 方式 2：直接运行
cd ai-agent
python main.py
```

服务默认将在 `http://localhost:8100` 启动（可通过 `AGENT_PORT`/`PORT` 覆盖）。

### 7. 启动 Java 后端

```bash
cd backend
./start.cmd
```

## 快速配置检查清单

- [ ] Cloudflare API Token 已创建并填入 `.env`
- [ ] R2 Bucket `legal-agent-files` 已创建（运行 `wrangler r2 bucket list` 验证）
- [ ] R2 API Token 已创建并填入 `.env`
- [ ] 智谱 AI Embedding API Key 已填入
- [ ] 自定义 LLM API Key 已填入
- [ ] 知识库已初始化
- [ ] Python Agent 成功启动
- [ ] Java Backend 成功启动

## 验证配置

访问以下 URL 确认服务正常：

- Python Agent: http://localhost:8100/
- Python API 文档: http://localhost:8100/docs
- Java Backend: http://localhost:8080/

## 命令速查

```bash
# Wrangler 常用命令
wrangler whoami                              # 查看当前账户
wrangler r2 bucket list                      # 列出所有 R2 buckets
wrangler vectorize list                      # 列出所有 Vectorize indexes
wrangler vectorize get legal-knowledge-base  # 查看 Index 详情

# Python 服务
cd ai-agent && python main.py                # 启动 AI Agent
python scripts/init_knowledge_base.py        # 初始化知识库

# Java 服务
cd backend && ./start.cmd                    # 启动后端
```

## 故障排查

### Vectorize 连接失败

- 确认 `CF_API_TOKEN` 有正确的权限
- 确认 `CF_ACCOUNT_ID` 正确

### R2 上传失败

- 确认 R2 凭证正确
- 确认 Bucket 名称匹配

### Embedding 生成失败

- 确认智谱 AI `EMBEDDING_API_KEY` 有效
- 检查网络连接

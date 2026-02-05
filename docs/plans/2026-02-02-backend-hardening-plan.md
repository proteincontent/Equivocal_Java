# Backend Hardening (Security/Stability) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** 修复后端高风险安全问题（越权/密钥泄露/后门管理员），并补齐关键回归测试，保证 `backend` 在本地无外部依赖的情况下可稳定跑测试。

**Architecture:** 以“最小行为变更 + 明确安全边界 + TDD 回归用例”为原则：先写会失败的测试复现风险点，再做最小修复；日志统一降噪并做敏感信息脱敏；对外 API 尽量保持兼容（必要时仅新增更合理的 HTTP 状态码）。

**Tech Stack:** Spring Boot 2.7.x, Spring Security, JPA, JUnit 5, Mockito, WebMvcTest/MockMvc, Maven Wrapper.

---

### Task 1: 移除硬编码管理员后门（`admin@example.com`）

**Files:**
- Modify: `backend/src/main/java/com/equivocal/service/AuthService.java`
- Create: `backend/src/test/java/com/equivocal/AuthServiceAdminBackdoorTest.java`

**Step 1: 写 failing test（回归用例）**
- 目标：注册/登录 `admin@example.com` 不应自动获得管理员权限。
- Run: `cd backend; .\\mvnw.cmd -q -Dtest=AuthServiceAdminBackdoorTest test`
- Expected: FAIL（当前逻辑会把 role 提升到 10）。

**Step 2: 最小实现修复**
- 删除基于邮箱自动赋权的逻辑（注册时 role=1；登录不再“自动修复”管理员）。

**Step 3: 再跑测试**
- Run: `cd backend; .\\mvnw.cmd -q -Dtest=AuthServiceAdminBackdoorTest test`
- Expected: PASS

---

### Task 2: 修复 Chat SSE 端点的会话越权（sessionId 不属于当前用户）

**Files:**
- Modify: `backend/src/main/java/com/equivocal/controller/ChatController.java`
- Create: `backend/src/test/java/com/equivocal/ChatControllerSessionOwnershipTest.java`

**Step 1: 写 failing test（复现越权）**
- 场景：已登录 userA，传入 sessionId=属于 userB 的会话；期望服务端不读取/写入 userB 的会话数据。
- 推荐行为：服务端创建新会话并返回新 `sessionId`（避免泄露/枚举）。
- Run: `cd backend; .\\mvnw.cmd -q -Dtest=ChatControllerSessionOwnershipTest test`
- Expected: FAIL

**Step 2: 最小实现修复**
- 当 `sessionId` 存在但 `session.userId != currentUser.id` 时：忽略该 sessionId，创建新会话；并确保保存消息/加载历史都使用新会话。
- 日志：不要打印用户消息正文、不要 `info` 级打印 JWT 解析过程。

**Step 3: 再跑测试**
- Run: `cd backend; .\\mvnw.cmd -q -Dtest=ChatControllerSessionOwnershipTest test`
- Expected: PASS

---

### Task 3: 邮件验证码与 Resend 配置安全（脱敏日志 + SecureRandom）

**Files:**
- Modify: `backend/src/main/java/com/equivocal/service/EmailService.java`
- Modify: `backend/src/main/java/com/equivocal/service/VerificationService.java`
- Create: `backend/src/test/java/com/equivocal/EmailServiceLogRedactionTest.java`

**Step 1: 写 failing test**
- 目标：EmailService 不应在任何日志中输出 Resend API Key 的前缀/长度（至少在 `info`）。
- Run: `cd backend; .\\mvnw.cmd -q -Dtest=EmailServiceLogRedactionTest test`
- Expected: FAIL（当前会打印前 10 位）。

**Step 2: 最小实现修复**
- 移除/降级“调试信息”日志：API key 一律不打印（必要时仅输出 `configured=true/false`）。
- 验证码生成使用 `SecureRandom`（替代 `Random`）。

**Step 3: 再跑测试**
- Run: `cd backend; .\\mvnw.cmd -q -Dtest=EmailServiceLogRedactionTest test`
- Expected: PASS

---

### Task 4: JWT 密钥校验（禁止短密钥“补零”）

**Files:**
- Modify: `backend/src/main/java/com/equivocal/security/JwtService.java`
- Create: `backend/src/test/java/com/equivocal/JwtServiceSecretValidationTest.java`

**Step 1: 写 failing test**
- 目标：当 `jwt.secret` 长度 < 32 字节时，`init()` 应直接失败（抛异常）。
- Run: `cd backend; .\\mvnw.cmd -q -Dtest=JwtServiceSecretValidationTest test`
- Expected: FAIL（当前会补零通过）。

**Step 2: 最小实现修复**
- 删除补零逻辑；改为抛出 `IllegalStateException`，并在错误信息中提示最小长度。

**Step 3: 再跑测试**
- Run: `cd backend; .\\mvnw.cmd -q -Dtest=JwtServiceSecretValidationTest test`
- Expected: PASS

---

### Task 5: 小修复（CORS 解析健壮性 + 上传日志/栈打印）

**Files:**
- Modify: `backend/src/main/java/com/equivocal/config/CorsConfig.java`
- Modify: `backend/src/main/java/com/equivocal/controller/UploadController.java`

**Step 1: CORS origins split 后 trim + 过滤空值**
- 避免 `allowed-origins` 里有空格导致匹配失败。

**Step 2: UploadController 移除 `printStackTrace`，并降低敏感日志**
- 失败用 `log.error(..., e)` 即可；避免把 agent 原始响应打到 info（改为 debug 或不打）。

---

### Task 6: Fresh 验证（必须）

**Step 1: 后端测试**
- Run: `cd backend; .\\mvnw.cmd test`
- Expected: BUILD SUCCESS（0 failures）


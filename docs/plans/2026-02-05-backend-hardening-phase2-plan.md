# Backend Hardening Phase 2 (Stability/Privacy) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** 继续加固后端：避免异常信息泄露、为认证/验证码加基础防刷、修复删除用户遗留消息、加固上传校验，并补齐对应回归测试。

**Architecture:** 以“最小可控行为变更”为原则：新增小而独立的组件（如内存限流器），并在现有 Controller/Service 上做局部接入；所有行为变更都先写 failing test，再做最小实现；最后跑 `backend` 全量测试。

**Tech Stack:** Spring Boot 2.7.x, Spring Security, JPA, JUnit 5, Mockito, Maven Wrapper.

---

### Task 1: 统一对外错误信息（避免 `e.getMessage()` 泄露）

**Files:**
- Modify: `backend/src/main/java/com/equivocal/controller/AuthController.java`
- Modify: `backend/src/main/java/com/equivocal/controller/AdminUserController.java`
- Modify: `backend/src/main/java/com/equivocal/controller/AdminChatController.java`
- Modify: `backend/src/main/java/com/equivocal/controller/ChatSessionController.java`
- Modify: `backend/src/main/java/com/equivocal/controller/ChatController.java`
- Create: `backend/src/test/java/com/equivocal/AuthControllerErrorSanitizationTest.java`

**Step 1: 写 failing test**
- 目标：当 `AuthService` 抛异常时，`/api/auth/login` 的响应 body 不应包含异常 message。
- Test：直接 new `AuthController(mockAuthService)` 调用 `authenticate(...)`，mock 抛 `RuntimeException("db down")`，断言返回的 `AuthResponse.error` 不包含 `db down`。
- Run: `cd backend; .\\mvnw.cmd -q -Dtest=AuthControllerErrorSanitizationTest test`
- Expected: FAIL

**Step 2: 最小实现修复**
- 将返回给前端的错误统一改为固定文案（如 `"服务端内部错误"`）；详细信息只写入日志 `log.error(..., e)`。
- Admin/ChatSession 等控制器 catch 分支的 `error.put("error", e.getMessage())` 同步改为固定文案。

**Step 3: 再跑测试**
- Run: `cd backend; .\\mvnw.cmd -q -Dtest=AuthControllerErrorSanitizationTest test`
- Expected: PASS

---

### Task 2: 给登录/发送验证码加基础防刷（内存限流，无外部依赖）

**Files:**
- Create: `backend/src/main/java/com/equivocal/security/InMemoryRateLimiter.java`
- Modify: `backend/src/main/java/com/equivocal/service/VerificationService.java`
- Modify: `backend/src/main/java/com/equivocal/service/AuthService.java`
- Create: `backend/src/test/java/com/equivocal/InMemoryRateLimiterTest.java`

**Step 1: 写 failing test**
- 目标：同一 key 在窗口期内超过阈值会被拒绝。
- 用可注入 `Clock`/`Supplier<Long>` 的方式可测试时间窗口滚动。
- Run: `cd backend; .\\mvnw.cmd -q -Dtest=InMemoryRateLimiterTest test`
- Expected: FAIL

**Step 2: 最小实现**
- 实现 `allow(String key)`：在 `windowMs` 内最多 `maxRequests` 次；超过返回 false。
- `VerificationService.sendVerificationCode(email)` 调用前先 `allow("sendCode:"+email)`，不允许则直接返回 false 并打 warn（不泄露内部细节）。
- `AuthService.authenticate` 入口处对 `email` 做 `allow("auth:"+email)`，超过阈值返回 `AuthResponse.error("请求过于频繁，请稍后再试")`。

**Step 3: 再跑测试**
- Run: `cd backend; .\\mvnw.cmd -q -Dtest=InMemoryRateLimiterTest test`
- Expected: PASS

---

### Task 3: 删除用户时级联清理 chat_messages（避免隐私/空间遗留）

**Files:**
- Modify: `backend/src/main/java/com/equivocal/repository/ChatMessageRepository.java`
- Modify: `backend/src/main/java/com/equivocal/controller/AdminUserController.java`
- Create: `backend/src/test/java/com/equivocal/AdminUserControllerDeleteCascadeTest.java`

**Step 1: 写 failing test**
- 目标：删除用户时会先删除该用户所有 session 的 messages，再删除 sessions，再删除 user。
- 用 Mockito mock repositories，断言调用顺序与参数正确（sessionId 列表来自 `findByUserId...`）。
- Run: `cd backend; .\\mvnw.cmd -q -Dtest=AdminUserControllerDeleteCascadeTest test`
- Expected: FAIL

**Step 2: 最小实现**
- 给 `ChatMessageRepository` 新增 `void deleteBySessionIdIn(List<String> sessionIds)`。
- `AdminUserController.deleteUser`：先查 sessions → 批量删 messages → 删 sessions → 删 user。

**Step 3: 再跑测试**
- Run: `cd backend; .\\mvnw.cmd -q -Dtest=AdminUserControllerDeleteCascadeTest test`
- Expected: PASS

---

### Task 4: 上传端点加基础类型校验（降低误用/攻击面）

**Files:**
- Modify: `backend/src/main/java/com/equivocal/controller/UploadController.java`
- Create: `backend/src/test/java/com/equivocal/UploadControllerValidationTest.java`

**Step 1: 写 failing test**
- 目标：不允许的 content-type（如 `application/x-msdownload`）返回 400。
- Run: `cd backend; .\\mvnw.cmd -q -Dtest=UploadControllerValidationTest test`
- Expected: FAIL

**Step 2: 最小实现**
- 在 `UploadController.uploadFile` 增加允许类型白名单（先内置：`application/pdf`, `image/*`, `text/plain`；后续可扩展）。
- 不符合则 `badRequest` 返回 `success=false` + 明确提示。

**Step 3: 再跑测试**
- Run: `cd backend; .\\mvnw.cmd -q -Dtest=UploadControllerValidationTest test`
- Expected: PASS

---

### Task 5: 生成的 user/session id 改为 UUID（避免可预测）

**Files:**
- Modify: `backend/src/main/java/com/equivocal/service/AuthService.java`
- Modify: `backend/src/main/java/com/equivocal/controller/ChatController.java`
- Modify: `backend/src/main/java/com/equivocal/controller/ChatSessionController.java`
- Modify: `backend/src/main/java/com/equivocal/controller/AdminUserController.java`

**Step 1: 最小实现**
- 将 `System.currentTimeMillis()+Math.random()` 替换为 `UUID.randomUUID()`，保持前缀 `user_` / `session_` 不变。

---

### Task 6: Fresh 验证（必须）

**Step 1: 后端测试**
- Run: `cd backend; .\\mvnw.cmd test`
- Expected: BUILD SUCCESS（0 failures）


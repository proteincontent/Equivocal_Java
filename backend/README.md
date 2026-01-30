# Equivocal Legal - Java Spring Boot 后端

这是 Equivocal Legal 法律服务项目的 Java Spring Boot 后端，从原有的 Node.js/Next.js API Routes 迁移而来。

## 技术栈

- **Java 17+**
- **Spring Boot 3.2.0**
- **Spring Security** - JWT 认证
- **Spring Data JPA** - 数据库访问
- **MySQL/TiDB** - 数据库
- **WebFlux/WebClient** - 异步 HTTP 客户端
- **Lombok** - 减少样板代码
- **BCrypt** - 密码加密

## 项目结构

```
backend/
├── src/main/java/com/equivocal/
│   ├── EquivocalApplication.java    # 主入口
│   ├── config/                       # 配置类
│   │   ├── SecurityConfig.java      # Spring Security 配置
│   │   ├── CorsConfig.java          # CORS 配置
│   │   └── WebClientConfig.java     # WebClient 配置
│   ├── controller/                   # REST 控制器
│   │   ├── AuthController.java      # 认证 API
│   │   ├── VerificationController.java # 验证码 API
│   │   ├── CozeChatController.java  # Coze 聊天 API
│   │   ├── CozeUploadController.java # Coze 文件上传
│   │   ├── AdminUserController.java # 用户管理
│   │   ├── AdminStatsController.java # 统计 API
│   │   └── ConfigController.java    # 配置 API
│   ├── dto/                          # 数据传输对象
│   │   ├── AuthRequest.java
│   │   └── AuthResponse.java
│   ├── entity/                       # JPA 实体
│   │   ├── User.java
│   │   ├── ChatSession.java
│   │   ├── ChatMessage.java
│   │   └── VerificationCode.java
│   ├── repository/                   # JPA 仓库
│   │   ├── UserRepository.java
│   │   ├── ChatSessionRepository.java
│   │   ├── ChatMessageRepository.java
│   │   └── VerificationCodeRepository.java
│   ├── security/                     # 安全模块
│   │   ├── PasswordService.java     # 密码加密
│   │   ├── JwtService.java          # JWT 服务
│   │   └── JwtAuthFilter.java       # JWT 过滤器
│   └── service/                      # 业务服务
│       ├── AuthService.java         # 认证服务
│       ├── EmailService.java        # 邮件服务
│       ├── VerificationService.java # 验证码服务
│       └── CozeService.java         # Coze API 服务
├── src/main/resources/
│   └── application.yml              # 应用配置
├── pom.xml                          # Maven 配置
└── mvnw.cmd                         # Maven Wrapper
```

## 快速开始

### 前置要求

- JDK 17 或更高版本
- 无需安装 Maven（使用 Maven Wrapper）

### 配置

本项目使用环境变量管理敏感配置，**请勿将真实密钥提交到版本控制系统**。

#### 方法一：使用 .env 文件（推荐用于本地开发）

1. 复制环境变量模板：

```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，填入真实的配置值。

3. 在启动前加载环境变量（Windows 可使用 `start.cmd`）。

#### 方法二：直接设置环境变量

**Windows (CMD):**

```cmd
set SPRING_DATASOURCE_URL=jdbc:mysql://your-host:4000/your-database
set SPRING_DATASOURCE_USERNAME=your-username
set SPRING_DATASOURCE_PASSWORD=your-password
set JWT_SECRET=your-jwt-secret-key
set RESEND_API_KEY=your-resend-api-key
set COZE_API_KEY=your-coze-api-key
set COZE_BOT_ID=your-bot-id
```

**Windows (PowerShell):**

```powershell
$env:SPRING_DATASOURCE_URL="jdbc:mysql://your-host:4000/your-database"
$env:SPRING_DATASOURCE_USERNAME="your-username"
$env:SPRING_DATASOURCE_PASSWORD="your-password"
$env:JWT_SECRET="your-jwt-secret-key"
$env:RESEND_API_KEY="your-resend-api-key"
$env:COZE_API_KEY="your-coze-api-key"
$env:COZE_BOT_ID="your-bot-id"
```

**Linux/Mac:**

```bash
export SPRING_DATASOURCE_URL=jdbc:mysql://your-host:4000/your-database
export SPRING_DATASOURCE_USERNAME=your-username
export SPRING_DATASOURCE_PASSWORD=your-password
export JWT_SECRET=your-jwt-secret-key
export RESEND_API_KEY=your-resend-api-key
export COZE_API_KEY=your-coze-api-key
export COZE_BOT_ID=your-bot-id
```

#### 环境变量列表

| 变量名                       | 说明                        | 默认值                                  |
| ---------------------------- | --------------------------- | --------------------------------------- |
| `SERVER_PORT`                | 服务端口                    | `8080`                                  |
| `SPRING_DATASOURCE_URL`      | 数据库 JDBC URL             | `jdbc:mysql://localhost:3306/equivocal` |
| `SPRING_DATASOURCE_USERNAME` | 数据库用户名                | `root`                                  |
| `SPRING_DATASOURCE_PASSWORD` | 数据库密码                  | _(空)_                                  |
| `JWT_SECRET`                 | JWT 签名密钥（至少 256 位） | _(需要设置)_                            |
| `JWT_EXPIRATION`             | JWT 过期时间（毫秒）        | `86400000` (24小时)                     |
| `RESEND_API_KEY`             | Resend 邮件服务 API 密钥    | _(需要设置)_                            |
| `RESEND_FROM_EMAIL`          | 发件人邮箱                  | `noreply@example.com`                   |
| `COZE_API_URL`               | Coze API 地址               | `https://api.coze.com`                  |
| `COZE_API_KEY`               | Coze API 密钥               | _(需要设置)_                            |
| `COZE_TITLE_TOKEN`           | Coze Title Token            | _(可选)_                                |
| `COZE_BOT_ID`                | Coze Bot ID                 | _(需要设置)_                            |
| `COZE_PROJECT_ID`            | Coze Project ID             | _(可选)_                                |
| `APP_CORS_ALLOWED_ORIGINS`   | 允许的 CORS 来源            | `http://localhost:3000,...`             |

### 启动

```bash
# Windows
cd backend
mvnw.cmd spring-boot:run

# Linux/Mac
cd backend
./mvnw spring-boot:run
```

服务将在 `http://localhost:8080` 启动。

## API 端点

### 认证

- `POST /api/auth/login` - 登录/注册（通过 `action=login|register` 区分）
- `POST /api/auth/send-code` - 发送验证码
- `POST /api/auth/verify-code` - 验证验证码

### 聊天

- `POST /api/coze-chat` - Coze 聊天
- `POST /api/coze-upload` - Coze 文件上传

### 管理

- `GET /api/admin/users` - 获取用户列表
- `GET /api/admin/users/{id}` - 获取用户详情
- `PUT /api/admin/users/{id}` - 更新用户
- `DELETE /api/admin/users/{id}` - 删除用户
- `GET /api/admin/stats` - 获取统计信息

### 配置

- `GET /api/config` - 获取前端配置

## 与前端集成

1. 在项目根目录创建或修改 `.env.local`：

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
# 可选：前端请求超时（毫秒），避免网络异常时一直“加载中”
# NEXT_PUBLIC_API_TIMEOUT_MS=15000
```

2. 启动前端：

```bash
pnpm dev
```

## 密码兼容性

后端支持从旧版简单哈希密码自动迁移到 BCrypt：

- 登录时检测旧版密码格式
- 验证成功后自动升级为 BCrypt 格式
- 新用户直接使用 BCrypt

## 开发说明

### 添加新的 API 端点

1. 在 `controller/` 创建新的控制器类
2. 使用 `@RestController` 和 `@RequestMapping` 注解
3. 在 `SecurityConfig.java` 中配置访问权限

### 数据库迁移

JPA 配置为 `ddl-auto: update`，会自动同步实体类到数据库表结构。

## 许可证

MIT License

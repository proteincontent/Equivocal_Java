# Requirements Document

## Introduction

本文档定义了 Equivocal MBTI 聊天应用的用户认证系统需求。当前项目的用户注册/登录功能使用内存 Map 存储，服务器重启后数据丢失，密码明文存储，且缺乏完整的用户会话管理。需要实现一个持久化、安全的用户认证系统。

## Glossary

- **Auth_System**: 负责用户注册、登录、会话管理的认证模块
- **User_Store**: 持久化存储用户数据的存储层（使用 localStorage 或文件系统）
- **Password_Hash**: 使用加密算法处理后的密码值，不可逆向还原
- **Session_Token**: 用于标识已登录用户的唯一令牌
- **Auth_State**: 客户端存储的用户认证状态

## Requirements

### Requirement 1

**User Story:** As a user, I want to register an account with email and password, so that I can have a persistent identity in the application.

#### Acceptance Criteria

1. WHEN a user submits registration with valid email and password THEN the Auth_System SHALL create a new user record and return a success response with userId
2. WHEN a user submits registration with an already registered email THEN the Auth_System SHALL reject the request and return an error message indicating the email is taken
3. WHEN a user submits registration with an empty email or password THEN the Auth_System SHALL reject the request and return a validation error
4. WHEN a user submits registration with an invalid email format THEN the Auth_System SHALL reject the request and return a format error
5. WHEN a user submits registration with a password shorter than 6 characters THEN the Auth_System SHALL reject the request and return a password length error

### Requirement 2

**User Story:** As a user, I want my account data to persist across server restarts, so that I don't lose my registration.

#### Acceptance Criteria

1. WHEN the Auth_System creates a new user THEN the User_Store SHALL persist the user data to a JSON file on the server
2. WHEN the Auth_System starts THEN the User_Store SHALL load existing user data from the JSON file
3. WHEN the user data file does not exist THEN the User_Store SHALL create an empty user data file
4. WHEN the Auth_System queries for a user THEN the User_Store SHALL return the user data from the persisted storage

### Requirement 3

**User Story:** As a user, I want my password to be stored securely, so that my credentials are protected.

#### Acceptance Criteria

1. WHEN the Auth_System stores a password THEN the Auth_System SHALL hash the password using bcrypt or similar algorithm before storage
2. WHEN the Auth_System verifies a password THEN the Auth_System SHALL compare the provided password against the stored hash
3. THE User_Store SHALL never store plaintext passwords
4. THE Auth_System SHALL never return or log password values in any response

### Requirement 4

**User Story:** As a user, I want to log in with my email and password, so that I can access my account.

#### Acceptance Criteria

1. WHEN a user submits login with correct email and password THEN the Auth_System SHALL return a success response with userId and session token
2. WHEN a user submits login with incorrect password THEN the Auth_System SHALL return an authentication error without revealing whether the email exists
3. WHEN a user submits login with non-existent email THEN the Auth_System SHALL return the same authentication error as incorrect password
4. WHEN a user submits login with empty credentials THEN the Auth_System SHALL return a validation error

### Requirement 5

**User Story:** As a user, I want to stay logged in after closing the browser, so that I don't have to log in every time.

#### Acceptance Criteria

1. WHEN a user logs in successfully THEN the Auth_State SHALL store the session token in localStorage
2. WHEN the application loads THEN the Auth_State SHALL check localStorage for an existing session token
3. WHEN a valid session token exists THEN the Auth_State SHALL restore the logged-in state automatically
4. WHEN a user logs out THEN the Auth_State SHALL remove the session token from localStorage

### Requirement 6

**User Story:** As a user, I want to see my login status in the UI, so that I know whether I'm logged in.

#### Acceptance Criteria

1. WHEN a user is logged in THEN the UI SHALL display the user's email or a logged-in indicator
2. WHEN a user is not logged in THEN the UI SHALL display login and register buttons
3. WHEN a user clicks logout THEN the UI SHALL update to show the logged-out state immediately
4. WHEN a login or registration fails THEN the UI SHALL display the error message to the user

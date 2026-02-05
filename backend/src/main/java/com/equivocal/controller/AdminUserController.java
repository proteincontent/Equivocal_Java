package com.equivocal.controller;

import com.equivocal.entity.ChatMessage;
import com.equivocal.entity.ChatSession;
import com.equivocal.entity.User;
import com.equivocal.repository.ChatMessageRepository;
import com.equivocal.repository.ChatSessionRepository;
import com.equivocal.repository.UserRepository;
import com.equivocal.security.PasswordService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@Slf4j
public class AdminUserController {
    
    private final UserRepository userRepository;
    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final PasswordService passwordService;
    
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody CreateUserRequest request) {
        try {
            log.info("[AdminUserController] Creating user: email={}, role={}", request.getEmail(), request.getRole());
            
            if (userRepository.existsByEmail(request.getEmail())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "邮箱已被注册");
                return ResponseEntity.badRequest().body(error);
            }
            
            if (request.getPassword() == null || request.getPassword().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "密码不能为空");
                return ResponseEntity.badRequest().body(error);
            }

            // 生成用户 ID
            String userId = "user_" + UUID.randomUUID().toString().replace("-", "");
            
            String hashedPassword = passwordService.hashPassword(request.getPassword());
            
            User user = User.builder()
                    .id(userId)
                    .email(request.getEmail())
                    .password(hashedPassword)
                    .role(request.getRole() != null ? request.getRole() : 1)
                    .emailVerified(true) // 管理员创建的用户默认已验证
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            
            userRepository.save(user);
            
            log.info("[AdminUserController] User created: id={}", userId);
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "用户创建成功");
            result.put("data", sanitizeUser(user));
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("[AdminUserController] Failed to create user: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "服务端内部错误");
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @GetMapping
    public ResponseEntity<?> getUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role) {
        try {
            long startTime = System.currentTimeMillis();
            log.info("[AdminUserController] Getting users: page={}, limit={}, search={}, role={}", page, limit, search, role);
            
            Pageable pageable = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
            
            Page<User> userPage;
            
            long queryStartTime = System.currentTimeMillis();
            if (search != null && !search.isEmpty()) {
                if (role != null && !role.isEmpty()) {
                    // 同时有搜索词和角色筛选
                    // role=10 表示管理员（role >= 10），其他表示普通用户（role < 10）
                    if ("10".equals(role)) {
                        userPage = userRepository.searchAdminUsers(search, pageable);
                    } else {
                        userPage = userRepository.searchRegularUsers(search, pageable);
                    }
                } else {
                    // 只有搜索词
                    userPage = userRepository.searchUsers(search, pageable);
                }
            } else {
                if (role != null && !role.isEmpty()) {
                    // 只有角色筛选
                    // role=10 表示管理员（role >= 10），其他表示普通用户（role < 10）
                    if ("10".equals(role)) {
                        userPage = userRepository.findAdminUsers(pageable);
                    } else {
                        userPage = userRepository.findRegularUsers(pageable);
                    }
                } else {
                    // 无筛选
                    userPage = userRepository.findAll(pageable);
                }
            }
            long queryEndTime = System.currentTimeMillis();
            log.info("[PERF] 用户分页查询耗时: {}ms", queryEndTime - queryStartTime);
            
            List<Map<String, Object>> users = userPage.getContent().stream()
                    .map(this::sanitizeUser)
                    .collect(Collectors.toList());
            
            // 统计数据已由 /api/admin/stats 端点提供，这里不再重复查询
            // 这样可以减少 3 次数据库查询，提升性能
            
            Map<String, Object> result = new HashMap<String, Object>();
            result.put("users", users);
            result.put("total", userPage.getTotalElements());
            result.put("page", page);
            result.put("limit", limit);
            result.put("totalPages", userPage.getTotalPages());
            
            long endTime = System.currentTimeMillis();
            log.info("[PERF] getUsers() 总耗时: {}ms", endTime - startTime);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("[AdminUserController] Failed to get users: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<String, String>();
            error.put("error", "服务端内部错误");
            return ResponseEntity.internalServerError().body(error);
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable String id) {
        try {
            log.info("[AdminUserController] Getting user: id={}", id);
            
            Optional<User> userOpt = userRepository.findById(id);
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(sanitizeUser(userOpt.get()));
        } catch (Exception e) {
            log.error("[AdminUserController] Failed to get user: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<String, String>();
            error.put("error", "服务端内部错误");
            return ResponseEntity.internalServerError().body(error);
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody UpdateUserRequest request) {
        try {
            log.info("[AdminUserController] Updating user: id={}", id);
            
            Optional<User> userOpt = userRepository.findById(id);
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            User user = userOpt.get();
            
            if (request.getRole() != null) {
                user.setRole(request.getRole());
            }
            if (request.getEmailVerified() != null) {
                user.setEmailVerified(request.getEmailVerified());
            }
            
            if (request.getNewPassword() != null && !request.getNewPassword().isEmpty()) {
                String hashedPassword = passwordService.hashPassword(request.getNewPassword());
                user.setPassword(hashedPassword);
                log.info("[AdminUserController] Password reset for user: id={}", id);
            }
            
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
            
            log.info("[AdminUserController] User updated: id={}", id);
            return ResponseEntity.ok(sanitizeUser(user));
        } catch (Exception e) {
            log.error("[AdminUserController] Failed to update user: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<String, String>();
            error.put("error", "服务端内部错误");
            return ResponseEntity.internalServerError().body(error);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        try {
            log.info("[AdminUserController] Deleting user: id={}", id);
            
            if (!userRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }

            List<ChatSession> sessions = chatSessionRepository.findByUserIdOrderByUpdatedAtDesc(id);
            List<String> sessionIds = sessions.stream().map(ChatSession::getId).collect(Collectors.toList());
            if (!sessionIds.isEmpty()) {
                chatMessageRepository.deleteBySessionIdIn(sessionIds);
            }

            // 再删除用户的所有会话
            chatSessionRepository.deleteByUserId(id);
            
            userRepository.deleteById(id);
            
            log.info("[AdminUserController] User deleted: id={}", id);
            Map<String, Object> result = new HashMap<String, Object>();
            result.put("success", true);
            result.put("message", "User deleted");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("[AdminUserController] Failed to delete user: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<String, String>();
            error.put("error", "服务端内部错误");
            return ResponseEntity.internalServerError().body(error);
        }
    }
    
    /**
     * 获取用户的聊天会话列表（管理员功能）
     */
    @GetMapping("/{id}/chat-sessions")
    public ResponseEntity<?> getUserChatSessions(@PathVariable String id) {
        try {
            log.info("[AdminUserController] Getting chat sessions for user: {}", id);
            
            if (!userRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            
            List<ChatSession> sessions = chatSessionRepository.findByUserIdOrderByUpdatedAtDesc(id);
            
            List<Map<String, Object>> sessionList = sessions.stream()
                    .map(session -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", session.getId());
                        map.put("userId", session.getUserId());
                        map.put("title", session.getTitle());
                        map.put("createdAt", session.getCreatedAt());
                        map.put("updatedAt", session.getUpdatedAt());
                        
                        // 获取消息数量
                        List<ChatMessage> messages = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(session.getId());
                        map.put("messageCount", messages.size());
                        
                        return map;
                    })
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(sessionList);
        } catch (Exception e) {
            log.error("[AdminUserController] Failed to get user chat sessions: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<String, String>();
            error.put("error", "服务端内部错误");
            return ResponseEntity.internalServerError().body(error);
        }
    }
    
    private Map<String, Object> sanitizeUser(User user) {
        Map<String, Object> result = new HashMap<String, Object>();
        result.put("id", user.getId());
        result.put("email", user.getEmail());
        result.put("role", user.getRole());
        result.put("emailVerified", user.getEmailVerified());
        result.put("createdAt", user.getCreatedAt());
        result.put("updatedAt", user.getUpdatedAt());
        return result;
    }
    
    public static class UpdateUserRequest {
        private Integer role;
        private Boolean emailVerified;
        private String newPassword;
        
        public UpdateUserRequest() {}
        
        public Integer getRole() { return role; }
        public void setRole(Integer role) { this.role = role; }
        public Boolean getEmailVerified() { return emailVerified; }
        public void setEmailVerified(Boolean emailVerified) { this.emailVerified = emailVerified; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    public static class CreateUserRequest {
        private String email;
        private String password;
        private Integer role;

        public CreateUserRequest() {}

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public Integer getRole() { return role; }
        public void setRole(Integer role) { this.role = role; }
    }
}

package com.equivocal.controller;

import com.equivocal.entity.ChatMessage;
import com.equivocal.entity.ChatSession;
import com.equivocal.entity.User;
import com.equivocal.repository.ChatMessageRepository;
import com.equivocal.repository.ChatSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat/sessions")
@RequiredArgsConstructor
@Slf4j
public class ChatSessionController {
    
    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    
    /**
     * 获取当前用户的所有会话列表
     */
    @GetMapping
    public ResponseEntity<?> getUserSessions(@AuthenticationPrincipal User user) {
        try {
            if (user == null) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "未授权");
                return ResponseEntity.status(401).body(response);
            }
            
            log.info("[ChatSessionController] Getting sessions for user: {}", user.getId());

            // 只返回有消息的会话（使用 EXISTS 子查询，避免 N+1）
            List<ChatSession> sessions = chatSessionRepository.findWithMessagesByUserIdOrderByUpdatedAtDesc(user.getId());

            List<Map<String, Object>> sessionList = sessions.stream()
                    .map(this::mapSession)
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("sessions", sessionList);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("[ChatSessionController] Failed to get sessions: {}", e.getMessage(), e);
            Map<String, String> response = new HashMap<>();
            response.put("error", "服务端内部错误");
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * 获取单个会话详情 (包含消息列表)
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getSession(@PathVariable String id, @AuthenticationPrincipal User user) {
        try {
            if (user == null) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "未授权");
                return ResponseEntity.status(401).body(response);
            }
            
            log.info("[ChatSessionController] Getting session: {}", id);
            
            Optional<ChatSession> sessionOpt = chatSessionRepository.findById(id);
            if (!sessionOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            ChatSession session = sessionOpt.get();
            
            // 验证会话属于当前用户
            if (!session.getUserId().equals(user.getId())) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "无权访问此会话");
                return ResponseEntity.status(403).body(response);
            }
            
            Map<String, Object> result = mapSession(session);
            
            // 获取会话消息
            List<ChatMessage> messages = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(id);
            List<Map<String, Object>> messageList = messages.stream()
                    .map(this::mapMessage)
                    .collect(Collectors.toList());
            
            result.put("messages", messageList);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("[ChatSessionController] Failed to get session: {}", e.getMessage(), e);
            Map<String, String> response = new HashMap<>();
            response.put("error", "服务端内部错误");
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * 获取会话的所有消息
     */
    @GetMapping("/{id}/messages")
    public ResponseEntity<?> getSessionMessages(@PathVariable String id, @AuthenticationPrincipal User user) {
        try {
            if (user == null) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "未授权");
                return ResponseEntity.status(401).body(response);
            }
            
            log.info("[ChatSessionController] Getting messages for session: {}", id);
            
            Optional<ChatSession> sessionOpt = chatSessionRepository.findById(id);
            if (!sessionOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            ChatSession session = sessionOpt.get();
            
            // 验证会话属于当前用户
            if (!session.getUserId().equals(user.getId())) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "无权访问此会话");
                return ResponseEntity.status(403).body(response);
            }
            
            List<ChatMessage> messages = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(id);
            
            List<Map<String, Object>> messageList = messages.stream()
                    .map(this::mapMessage)
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("messages", messageList);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("[ChatSessionController] Failed to get messages: {}", e.getMessage(), e);
            Map<String, String> response = new HashMap<>();
            response.put("error", "服务端内部错误");
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * 创建新会话
     */
    @PostMapping
    public ResponseEntity<?> createSession(@RequestBody(required = false) Map<String, String> request,
                                          @AuthenticationPrincipal User user) {
        try {
            if (user == null) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "未授权");
                return ResponseEntity.status(401).body(response);
            }
            
            String title = request != null ? request.getOrDefault("title", "新对话") : "新对话";
            
            // 生成会话 ID
            String sessionId = "session_" + UUID.randomUUID().toString().replace("-", "");
            
            ChatSession session = ChatSession.builder()
                    .id(sessionId)
                    .userId(user.getId())
                    .title(title)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            
            session = chatSessionRepository.save(session);
            
            log.info("[ChatSessionController] Session created: {}", session.getId());
            
            return ResponseEntity.ok(mapSession(session));
        } catch (Exception e) {
            log.error("[ChatSessionController] Failed to create session: {}", e.getMessage(), e);
            Map<String, String> response = new HashMap<>();
            response.put("error", "服务端内部错误");
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * 更新会话标题
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateSession(@PathVariable String id,
                                          @RequestBody Map<String, String> request,
                                          @AuthenticationPrincipal User user) {
        try {
            if (user == null) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "未授权");
                return ResponseEntity.status(401).body(response);
            }
            
            Optional<ChatSession> sessionOpt = chatSessionRepository.findById(id);
            if (!sessionOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            ChatSession session = sessionOpt.get();
            
            // 验证会话属于当前用户
            if (!session.getUserId().equals(user.getId())) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "无权修改此会话");
                return ResponseEntity.status(403).body(response);
            }
            
            if (request.containsKey("title")) {
                session.setTitle(request.get("title"));
            }
            session.setUpdatedAt(LocalDateTime.now());
            
            session = chatSessionRepository.save(session);
            
            log.info("[ChatSessionController] Session updated: {}", id);
            
            return ResponseEntity.ok(mapSession(session));
        } catch (Exception e) {
            log.error("[ChatSessionController] Failed to update session: {}", e.getMessage(), e);
            Map<String, String> response = new HashMap<>();
            response.put("error", "服务端内部错误");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * 兼容前端使用 PATCH 更新会话标题
     */
    @PatchMapping("/{id}")
    public ResponseEntity<?> patchSession(@PathVariable String id,
                                         @RequestBody Map<String, String> request,
                                         @AuthenticationPrincipal User user) {
        return updateSession(id, request, user);
    }
    
    /**
     * 删除会话
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSession(@PathVariable String id, @AuthenticationPrincipal User user) {
        try {
            if (user == null) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "未授权");
                return ResponseEntity.status(401).body(response);
            }
            
            Optional<ChatSession> sessionOpt = chatSessionRepository.findById(id);
            if (!sessionOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            ChatSession session = sessionOpt.get();
            
            // 验证会话属于当前用户
            if (!session.getUserId().equals(user.getId())) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "无权删除此会话");
                return ResponseEntity.status(403).body(response);
            }
            
            // 先删除会话的所有消息
            chatMessageRepository.deleteBySessionId(id);
            
            // 再删除会话
            chatSessionRepository.deleteById(id);
            
            log.info("[ChatSessionController] Session deleted: {}", id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "会话已删除");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("[ChatSessionController] Failed to delete session: {}", e.getMessage(), e);
            Map<String, String> response = new HashMap<>();
            response.put("error", "服务端内部错误");
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    private Map<String, Object> mapSession(ChatSession session) {
        Map<String, Object> result = new HashMap<>();
        result.put("id", session.getId());
        result.put("userId", session.getUserId());
        result.put("title", session.getTitle());
        result.put("createdAt", session.getCreatedAt());
        result.put("updatedAt", session.getUpdatedAt());
        return result;
    }
    
    private Map<String, Object> mapMessage(ChatMessage message) {
        Map<String, Object> result = new HashMap<>();
        result.put("id", message.getId());
        result.put("sessionId", message.getSessionId());
        result.put("role", message.getRole());
        result.put("content", message.getContent());
        result.put("createdAt", message.getCreatedAt());
        return result;
    }
}

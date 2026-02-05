package com.equivocal.controller;

import com.equivocal.entity.ChatMessage;
import com.equivocal.entity.ChatSession;
import com.equivocal.repository.ChatMessageRepository;
import com.equivocal.repository.ChatSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/chat-sessions")
@RequiredArgsConstructor
@Slf4j
public class AdminChatController {
    
    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    
    /**
     * 获取会话的所有消息（管理员功能）
     */
    @GetMapping("/{id}/messages")
    public ResponseEntity<?> getSessionMessages(@PathVariable String id) {
        try {
            log.info("[AdminChatController] Getting messages for session: {}", id);
            
            Optional<ChatSession> sessionOpt = chatSessionRepository.findById(id);
            if (!sessionOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            List<ChatMessage> messages = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(id);
            
            List<Map<String, Object>> messageList = messages.stream()
                    .map(message -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", message.getId());
                        map.put("sessionId", message.getSessionId());
                        map.put("role", message.getRole());
                        map.put("content", message.getContent());
                        map.put("createdAt", message.getCreatedAt());
                        return map;
                    })
                    .collect(Collectors.toList());
            
            // 返回会话信息和消息列表
            ChatSession session = sessionOpt.get();
            Map<String, Object> result = new HashMap<>();
            
            Map<String, Object> sessionMap = new HashMap<>();
            sessionMap.put("id", session.getId());
            sessionMap.put("userId", session.getUserId());
            sessionMap.put("title", session.getTitle());
            sessionMap.put("createdAt", session.getCreatedAt());
            sessionMap.put("updatedAt", session.getUpdatedAt());
            
            result.put("session", sessionMap);
            result.put("messages", messageList);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("[AdminChatController] Failed to get session messages: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "服务端内部错误");
            return ResponseEntity.internalServerError().body(error);
        }
    }
    
    /**
     * 获取会话详情（管理员功能）
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getSession(@PathVariable String id) {
        try {
            log.info("[AdminChatController] Getting session: {}", id);
            
            Optional<ChatSession> sessionOpt = chatSessionRepository.findById(id);
            if (!sessionOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            ChatSession session = sessionOpt.get();
            
            // 获取消息数量
            List<ChatMessage> messages = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(id);
            
            Map<String, Object> result = new HashMap<>();
            result.put("id", session.getId());
            result.put("userId", session.getUserId());
            result.put("title", session.getTitle());
            result.put("createdAt", session.getCreatedAt());
            result.put("updatedAt", session.getUpdatedAt());
            result.put("messageCount", messages.size());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("[AdminChatController] Failed to get session: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "服务端内部错误");
            return ResponseEntity.internalServerError().body(error);
        }
    }
    
    /**
     * 删除会话（管理员功能）
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSession(@PathVariable String id) {
        try {
            log.info("[AdminChatController] Deleting session: {}", id);
            
            if (!chatSessionRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            
            // 先删除会话的所有消息
            chatMessageRepository.deleteBySessionId(id);
            
            // 再删除会话
            chatSessionRepository.deleteById(id);
            
            log.info("[AdminChatController] Session deleted: {}", id);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Session deleted");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("[AdminChatController] Failed to delete session: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "服务端内部错误");
            return ResponseEntity.internalServerError().body(error);
        }
    }
}

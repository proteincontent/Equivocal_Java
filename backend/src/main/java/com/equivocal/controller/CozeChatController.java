package com.equivocal.controller;

import com.equivocal.entity.ChatMessage;
import com.equivocal.entity.ChatSession;
import com.equivocal.entity.User;
import com.equivocal.repository.ChatMessageRepository;
import com.equivocal.repository.ChatSessionRepository;
import com.equivocal.repository.UserRepository;
import com.equivocal.service.CozeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/coze-chat")
@RequiredArgsConstructor
@Slf4j
public class CozeChatController {
    
    private final CozeService cozeService;
    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    
    /**
     * 流式聊天端点 - 使用 Server-Sent Events (SSE)
     */
    @PostMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamChat(@RequestBody CozeChatRequest request, @AuthenticationPrincipal User user) {
        log.info("[CozeChatController] Received stream chat request");
        
        if (user == null) {
            return Flux.just("{\"type\":\"error\",\"message\":\"Unauthorized\"}");
        }
        
        String userId = user.getId();
        
        // Handle session
        String sessionIdStr = request.getSessionId();
        ChatSession session;
        
        if (sessionIdStr != null && !sessionIdStr.isEmpty()) {
            session = chatSessionRepository.findById(sessionIdStr)
                    .orElseGet(() -> createNewSession(user.getId()));
        } else {
            session = createNewSession(user.getId());
        }
        
        final String finalSessionId = session.getId();

        // Save user message
        List<Map<String, String>> messages = request.getMessages();
        if (messages != null && !messages.isEmpty()) {
            Map<String, String> lastMessage = messages.get(messages.size() - 1);
            log.info("[Debug] Last message from frontend: {}", lastMessage);
            if ("user".equals(lastMessage.get("role"))) {
                String contentType = lastMessage.getOrDefault("content_type", "text");
                saveMessage(finalSessionId, "user", lastMessage.get("content"), contentType);
            }
        }
        
        // 修复：不再完全信任前端传来的消息列表，而是从数据库加载完整的历史上下文
        // 这能解决用户刷新页面或消息丢失导致的“AI失忆”问题
        List<Map<String, Object>> cozeMessages = new ArrayList<>();
        List<ChatMessage> historyMessages = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(finalSessionId);
        
        for (ChatMessage msg : historyMessages) {
            Map<String, Object> cozeMsg = new HashMap<>();
            cozeMsg.put("role", msg.getRole());
            cozeMsg.put("content", msg.getContent());
            cozeMsg.put("content_type", msg.getContentType() != null ? msg.getContentType() : "text");
            cozeMessages.add(cozeMsg);
        }
        
        // 用于收集完整响应
        StringBuilder fullResponse = new StringBuilder();
        
        // 首先发送 session ID
        Map<String, Object> sessionMap = new HashMap<>();
        sessionMap.put("type", "session");
        sessionMap.put("sessionId", finalSessionId);
        
        String sessionJson;
        try {
            sessionJson = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(sessionMap);
        } catch (Exception e) {
            sessionJson = "{\"type\":\"session\",\"sessionId\":\"" + finalSessionId + "\"}";
        }
        
        log.info("[Debug] Session Event: {}", sessionJson);
        // 在 TEXT_EVENT_STREAM 模式下，Flux<String> 的每一项会被自动包装成 data: <item>\n\n
        Flux<String> sessionEvent = Flux.just(sessionJson);
        
        // 调用 Coze 流式 API
        log.info("[Debug] Calling cozeService.streamChat with userId: {} and conversationId: {}", userId, finalSessionId);
        Flux<String> chatStream = cozeService.streamChat(userId, cozeMessages, finalSessionId)
                .doOnSubscribe(s -> log.info("[CozeChatController] Stream subscribed for session: {}", finalSessionId))
                .doOnNext(item -> log.info("[CozeChatController] Stream item received: {}", item))
                .doOnNext(item -> {
                    // 安全解析 JSON 收集内容用于后台保存
                    try {
                        com.fasterxml.jackson.databind.JsonNode node = new com.fasterxml.jackson.databind.ObjectMapper().readTree(item);
                        if ("content".equals(node.path("type").asText())) {
                            fullResponse.append(node.path("content").asText());
                        }
                    } catch (Exception e) {
                        log.debug("Skip non-content event for accumulation: {}", item);
                    }
                })
                .doOnComplete(() -> {
                    log.info("[CozeChatController] Stream completed for session: {}", finalSessionId);
                    // 保存完整响应
                    String response = fullResponse.toString();
                    if (!response.isEmpty()) {
                        saveMessage(finalSessionId, "assistant", response, "text");
                        
                        // 更新会话时间戳和标题
                        chatSessionRepository.findById(finalSessionId).ifPresent(s -> {
                            s.setUpdatedAt(LocalDateTime.now());
                            
                            // 如果是默认标题，尝试生成新标题
                            if ("New Chat".equals(s.getTitle()) || "新对话".equals(s.getTitle())) {
                                String convText = "User: " + (messages != null && !messages.isEmpty() ? messages.get(messages.size()-1).get("content") : "") +
                                                 "\nAssistant: " + response;
                                
                                CompletableFuture.runAsync(() -> {
                                    try {
                                        String newTitle = cozeService.generateTitle(convText);
                                        if (newTitle != null && !newTitle.isEmpty() && !newTitle.equals("新对话")) {
                                            s.setTitle(newTitle);
                                            chatSessionRepository.save(s);
                                            log.info("Successfully updated session title to: {}", newTitle);
                                        }
                                    } catch (Exception e) {
                                        log.error("Failed to generate/save new title: {}", e.getMessage());
                                    }
                                });
                            } else {
                                chatSessionRepository.save(s);
                            }
                        });
                    }
                })
                .doOnError(e -> {
                    log.error("[CozeChatController] Stream chat failed for session {}: {}", finalSessionId, e.getMessage(), e);
                })
                .doOnCancel(() -> log.info("[CozeChatController] Stream cancelled for session: {}", finalSessionId));
        
        return sessionEvent.concatWith(chatStream);
    }
    
    /**
     * 非流式聊天端点 (保留用于兼容)
     */
    @PostMapping(value = "/sync", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> syncChat(@RequestBody CozeChatRequest request, @AuthenticationPrincipal User user) {
        try {
            log.info("[CozeChatController] Received sync chat request");
            
            if (user == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Unauthorized");
                return ResponseEntity.status(401).body(error);
            }
            
            String userId = user.getId();
            
            // Handle session
            String sessionIdStr = request.getSessionId();
            ChatSession session;
            
            if (sessionIdStr != null && !sessionIdStr.isEmpty()) {
                session = chatSessionRepository.findById(sessionIdStr)
                        .orElseGet(() -> createNewSession(user.getId()));
            } else {
                session = createNewSession(user.getId());
            }

            // Save user message
            List<Map<String, String>> messages = request.getMessages();
            if (messages != null && !messages.isEmpty()) {
                Map<String, String> lastMessage = messages.get(messages.size() - 1);
                if ("user".equals(lastMessage.get("role"))) {
                    String contentType = lastMessage.getOrDefault("content_type", "text");
                    saveMessage(session.getId(), "user", lastMessage.get("content"), contentType);
                }
            }
            
            // Call Coze API
            String response = cozeService.chat(request.getMessages(), userId);
            
            // Save assistant response
            saveMessage(session.getId(), "assistant", response, "text");
            
            // Update session timestamp
            session.setUpdatedAt(LocalDateTime.now());
            chatSessionRepository.save(session);
            
            Map<String, Object> result = new HashMap<>();
            result.put("id", "chatcmpl-" + UUID.randomUUID().toString());
            result.put("object", "chat.completion");
            result.put("created", System.currentTimeMillis() / 1000);
            result.put("model", "coze-bot");
            result.put("sessionId", session.getId());
            
            Map<String, Object> choice = new HashMap<>();
            choice.put("index", 0);
            
            Map<String, String> message = new HashMap<>();
            message.put("role", "assistant");
            message.put("content", response);
            choice.put("message", message);
            choice.put("finish_reason", "stop");
            
            List<Map<String, Object>> choices = new ArrayList<>();
            choices.add(choice);
            result.put("choices", choices);
            
            Map<String, Integer> usage = new HashMap<>();
            usage.put("prompt_tokens", 0);
            usage.put("completion_tokens", 0);
            usage.put("total_tokens", 0);
            result.put("usage", usage);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("[CozeChatController] Sync chat failed: {}", e.getMessage(), e);
            
            Map<String, Object> error = new HashMap<>();
            Map<String, String> errorDetails = new HashMap<>();
            errorDetails.put("message", e.getMessage());
            errorDetails.put("type", "api_error");
            errorDetails.put("code", "coze_error");
            error.put("error", errorDetails);
            
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory(@AuthenticationPrincipal User user) {
        try {
            if (user == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Unauthorized");
                return ResponseEntity.status(401).body(error);
            }
            
            // Get latest session
            List<ChatSession> sessions = chatSessionRepository.findByUserIdOrderByUpdatedAtDesc(String.valueOf(user.getId()));
            
            if (sessions.isEmpty()) {
                return ResponseEntity.ok(Collections.emptyList());
            }
            
            ChatSession latestSession = sessions.get(0);
            List<ChatMessage> messages = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(String.valueOf(latestSession.getId()));
            
            Map<String, Object> result = new HashMap<>();
            result.put("sessionId", latestSession.getId());
            result.put("messages", messages);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("[CozeChatController] Get history failed: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
    
    private ChatSession createNewSession(String userId) {
        // 生成会话 ID
        String sessionId = "session_" + System.currentTimeMillis() + "_" +
                          Long.toHexString(Double.doubleToLongBits(Math.random())).substring(0, 7);
                          
        ChatSession session = ChatSession.builder()
                .id(sessionId)
                .userId(userId)
                .title("New Chat")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        return chatSessionRepository.save(session);
    }
    
    private void saveMessage(String sessionId, String role, String content, String contentType) {
        ChatMessage message = ChatMessage.builder()
                .sessionId(sessionId)
                .role(role)
                .content(content)
                .contentType(contentType)
                .createdAt(LocalDateTime.now())
                .build();
        chatMessageRepository.save(message);
    }
    
    public static class CozeChatRequest {
        private List<Map<String, String>> messages;
        private String userId;
        private String sessionId;
        private Boolean stream;
        
        public CozeChatRequest() {}
        
        public List<Map<String, String>> getMessages() { return messages; }
        public void setMessages(List<Map<String, String>> messages) { this.messages = messages; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getSessionId() { return sessionId; }
        public void setSessionId(String sessionId) { this.sessionId = sessionId; }
        public Boolean getStream() { return stream; }
        public void setStream(Boolean stream) { this.stream = stream; }
    }
}
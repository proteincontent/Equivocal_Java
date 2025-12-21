package com.equivocal.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;
import java.util.stream.Collectors;

@Service
@Slf4j
public class CozeService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${coze.api-key}")
    private String apiToken;

    @Value("${coze.title-token:}")
    private String titleToken;

    @Value("${coze.bot-id}")
    private String botId;

    @Value("${coze.project-id:}")
    private String projectId;

    @Value("${coze.api-url:https://api.coze.cn}")
    private String apiUrl;

    @Value("${ai.agent.url:http://localhost:8000}")
    private String agentUrl;

    public CozeService(WebClient webClient, ObjectMapper objectMapper) {
        this.webClient = webClient;
        this.objectMapper = objectMapper;
    }

    /**
     * 同步聊天方法（非流式）
     */
    public String chat(List<Map<String, String>> messages, String userId) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("bot_id", botId);
        requestBody.put("user_id", userId);
        requestBody.put("stream", false);
        requestBody.put("auto_save_history", true);

        // 转换消息格式 - 按照 Coze API v3 要求添加 type 字段
        List<Map<String, Object>> additionalMessages = messages.stream()
                .map(msg -> {
                    Map<String, Object> cozeMsg = new HashMap<>();
                    String role = msg.get("role");
                    cozeMsg.put("role", role);
                    cozeMsg.put("content", msg.get("content"));
                    cozeMsg.put("content_type", "text");
                    // 根据角色设置消息类型：user -> question, assistant -> answer
                    if ("user".equals(role)) {
                        cozeMsg.put("type", "question");
                    } else if ("assistant".equals(role)) {
                        cozeMsg.put("type", "answer");
                    }
                    return cozeMsg;
                })
                .collect(Collectors.toList());

        requestBody.put("additional_messages", additionalMessages);

        log.info("Sending sync request to Coze API with bot_id: {}", botId);

        try {
            String uri = apiUrl.endsWith("/stream_run") ? apiUrl : apiUrl + "/v3/chat";
            if (projectId != null && !projectId.isEmpty()) {
                uri = apiUrl + "/stream_run";
            }

            String finalUri = uri;
            String response = webClient.post()
                    .uri(finalUri)
                    .header("Authorization", "Bearer " + apiToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            log.info("Coze API Raw Response: {}", response);

            // 解析响应获取助手回复
            JsonNode jsonNode = objectMapper.readTree(response);
            JsonNode messagesNode = jsonNode.path("data").path("messages");
            
            if (messagesNode.isArray()) {
                for (JsonNode msgNode : messagesNode) {
                    if ("assistant".equals(msgNode.path("role").asText())) {
                        return msgNode.path("content").asText();
                    }
                }
            }
            
            return "No response from Coze";
        } catch (Exception e) {
            log.error("Error calling Coze API: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to call Coze API: " + e.getMessage(), e);
        }
    }

    public Flux<String> streamChat(String userId, List<Map<String, Object>> messages, String conversationId) {
        // 切换到 Coze Site API (/stream_run)
        // 优化：构建多模态 Prompt，支持文件和图片的识别
        List<Map<String, Object>> prompt = new ArrayList<>();
        StringBuilder historyText = new StringBuilder();
        
        if (messages != null && !messages.isEmpty()) {
            // 1. 处理历史消息 (不包含最后一条)
            int start = Math.max(0, messages.size() - 7);
            for (int i = start; i < messages.size() - 1; i++) {
                Map<String, Object> msg = messages.get(i);
                String role = "user".equals(msg.get("role")) ? "User" : "Assistant";
                String contentType = String.valueOf(msg.getOrDefault("content_type", "text"));
                String content = String.valueOf(msg.get("content"));
                
                if ("object_string".equals(contentType)) {
                    // 如果是历史消息中的对象字符串，只提取文本部分
                    try {
                        JsonNode nodes = objectMapper.readTree(content);
                        if (nodes.isArray()) {
                            for (JsonNode node : nodes) {
                                if ("text".equals(node.path("type").asText())) {
                                    historyText.append(role).append(": ").append(node.path("text").asText()).append("\n");
                                }
                            }
                        }
                    } catch (Exception e) {
                        log.warn("Failed to parse history object_string: {}", e.getMessage());
                        historyText.append(role).append(": ").append(content).append("\n");
                    }
                } else {
                    historyText.append(role).append(": ").append(content).append("\n");
                }
            }
            
            // 2. 处理最后一条消息 (当前输入)
            Map<String, Object> lastMsg = messages.get(messages.size() - 1);
            String lastContentType = String.valueOf(lastMsg.getOrDefault("content_type", "text"));
            String lastContent = String.valueOf(lastMsg.get("content"));
            
            if ("object_string".equals(lastContentType)) {
                try {
                    JsonNode nodes = objectMapper.readTree(lastContent);
                    if (nodes.isArray()) {
                        for (JsonNode node : nodes) {
                            String type = node.path("type").asText();
                            if ("text".equals(type)) {
                                String text = node.path("text").asText();
                                // 将当前文本拼接到历史文本之后
                                if (historyText.length() > 0) historyText.append("User: ");
                                historyText.append(text);
                            } else {
                                // 文件或图片，作为独立的 prompt 项
                                Map<String, Object> item = new HashMap<>();
                                item.put("type", type);
                                Map<String, Object> itemContent = new HashMap<>();
                                if (node.has("file_id")) itemContent.put("file_id", node.path("file_id").asText());
                                if (node.has("image_url")) itemContent.put("image_url", node.path("image_url").asText());
                                item.put("content", itemContent);
                                prompt.add(item);
                            }
                        }
                    }
                } catch (Exception e) {
                    log.error("Failed to parse current object_string: {}", e.getMessage());
                    if (historyText.length() > 0) historyText.append("User: ");
                    historyText.append(lastContent);
                }
            } else {
                if (historyText.length() > 0) historyText.append("User: ");
                historyText.append(lastContent);
            }
        }
        
        // 3. 将拼接好的文本作为第一个 prompt 项 (如果存在)
        // 修复：如果 prompt 中只有文件而没有文本，Coze 可能会表现不一致。添加默认提示。
        if (historyText.length() == 0 && prompt.stream().anyMatch(item -> "file".equals(item.get("type")) || "image".equals(item.get("type")))) {
            historyText.append("请分析上传的文件。");
        }

        if (historyText.length() > 0) {
            Map<String, Object> textItem = new HashMap<>();
            textItem.put("type", "text");
            Map<String, Object> textContent = new HashMap<>();
            textContent.put("text", historyText.toString());
            textItem.put("content", textContent);
            // 文本通常排在最前面
            prompt.add(0, textItem);
        }

        Map<String, Object> query = new HashMap<>();
        query.put("prompt", prompt);

        Map<String, Object> content = new HashMap<>();
        content.put("query", query);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("content", content);
        requestBody.put("type", "query");
        requestBody.put("project_id", projectId);

        try {
            log.info("[Debug] Coze Request Body: {}", objectMapper.writeValueAsString(requestBody));
        } catch (Exception e) {
            log.error("Failed to log request body", e);
        }
        // 修复：添加 user_id 和 conversation_id 确保 Coze 端能识别用户并激活持久化记忆
        requestBody.put("user_id", userId);
        if (conversationId != null && !conversationId.isEmpty()) {
            requestBody.put("conversation_id", conversationId);
        }

        String targetUrl = apiUrl + "/stream_run";
        log.info("Sending stream request to Coze Site API: {} for user: {}", targetUrl, userId);

        // 修复：显式指定字符集并使用 DataBuffer 流处理，确保多字节字符（如中文）不被截断
        return webClient.post()
                .uri(targetUrl)
                .header("Authorization", "Bearer " + (titleToken != null && !titleToken.isEmpty() ? titleToken : apiToken))
                .contentType(MediaType.APPLICATION_JSON)
                .accept(new MediaType("text", "event-stream", java.nio.charset.StandardCharsets.UTF_8))
                .bodyValue(requestBody)
                .retrieve()
                .bodyToFlux(org.springframework.core.io.buffer.DataBuffer.class)
                .map(dataBuffer -> {
                    byte[] bytes = new byte[dataBuffer.readableByteCount()];
                    dataBuffer.read(bytes);
                    org.springframework.core.io.buffer.DataBufferUtils.release(dataBuffer);
                    return new String(bytes, java.nio.charset.StandardCharsets.UTF_8);
                })
                .flatMap(rawContent -> {
                    // 处理可能合并在一起的多个 SSE 事件
                    String[] parts = rawContent.split("\n\n");
                    List<String> events = new ArrayList<>();
                    for (String part : parts) {
                        if (part.contains("data:")) {
                            String data = part.substring(part.indexOf("data:") + 5).trim();
                            if (!data.isEmpty()) events.add(data);
                        }
                    }
                    return Flux.fromIterable(events);
                })
                .doOnNext(data -> log.info("[CozeService] Processed SSE data: {}", data))
                .doOnError(e -> log.error("[CozeService] Error receiving SSE stream: {}", e.getMessage(), e))
                .filter(data -> !data.isEmpty())
                .flatMap(data -> {
                    if ("[DONE]".equals(data)) {
                        log.info("[CozeService] Received DONE signal");
                        return Flux.just(createDoneEvent());
                    }
                    return processStreamLine(data);
                });
    }

    private Flux<String> streamChatWithProjectId(List<Map<String, Object>> messages) {
        String lastMessage = "";
        if (!messages.isEmpty()) {
            lastMessage = String.valueOf(messages.get(messages.size() - 1).get("content"));
        }

        Map<String, Object> textContent = new HashMap<>();
        textContent.put("text", lastMessage);

        Map<String, Object> promptItem = new HashMap<>();
        promptItem.put("type", "text");
        promptItem.put("content", textContent);

        Map<String, Object> query = new HashMap<>();
        query.put("prompt", Collections.singletonList(promptItem));

        Map<String, Object> content = new HashMap<>();
        content.put("query", query);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("content", content);
        requestBody.put("type", "query");
        requestBody.put("project_id", projectId);

        log.info("Sending stream request to Coze Project API: {}/stream_run", apiUrl);

        return webClient.post()
                .uri(apiUrl + "/stream_run")
                .header("Authorization", "Bearer " + apiToken)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.TEXT_EVENT_STREAM)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToFlux(String.class)
                .filter(line -> line != null && !line.trim().isEmpty())
                .flatMap(this::processStreamLine);
    }

    private Flux<String> processStreamLine(String line) {
        try {
            log.info("RAW stream line received: {}", line);
            
            // WebClient bodyToFlux 已经自动解析 SSE，去掉了 data: 前缀
            // 所以这里直接处理 JSON 数据
            
            String data = line.trim();
            
            // 跳过空行
            if (data.isEmpty()) {
                return Flux.empty();
            }
            
            // 如果还有 data: 前缀（某些情况下可能保留），去掉它
            if (data.startsWith("data:")) {
                data = data.substring(5).trim();
            }
            
            // 跳过 event: 行
            if (data.startsWith("event:")) {
                return Flux.empty();
            }
            
            // 检查是否是结束标志
            if (data.equals("[DONE]") || data.equals("\"[DONE]\"")) {
                log.debug("Received DONE signal");
                return Flux.just(createDoneEvent());
            }
            
            // 尝试解析 JSON
            try {
                JsonNode jsonNode = objectMapper.readTree(data);
                
                // 适配 Project/Site API 的响应格式
                // 通常格式为: {"message": {"content": "...", "role": "assistant", ...}}
                if (jsonNode.has("message")) {
                    JsonNode messageNode = jsonNode.path("message");
                    String content = messageNode.path("content").asText("");
                    if (!content.isEmpty()) {
                        // 如果是 Project API，直接返回内容
                        return Flux.just(createContentEvent(content));
                    }
                }

                // 检查是否有 role 和 type 字段（这是标准 v3 消息事件）
                String role = jsonNode.path("role").asText("");
                String type = jsonNode.path("type").asText("");
                String convId = jsonNode.path("conversation_id").asText("");
                
                // 处理 Coze Stream Run API 的多种类型消息
                // 格式: {"type": "answer", "content": {"answer": "..."}}
                if ("answer".equals(type) || "thinking".equals(type)) {
                    JsonNode contentNode = jsonNode.path("content");
                    String contentVal = "";
                    
                    if (contentNode.isObject()) {
                        contentVal = contentNode.path(type).asText("");
                    } else if (contentNode.isTextual()) {
                        contentVal = contentNode.asText("");
                    }
                    
                    if (!contentVal.isEmpty() && !"null".equals(contentVal)) {
                        log.debug("Streaming {} from event: {}", type, contentVal);
                        return Flux.just(createGenericEvent(type, contentVal));
                    }
                }
                
                // 处理工具调用
                if ("tool_request".equals(type)) {
                    return Flux.just(createGenericEvent("tool", "[正在调用插件...]"));
                }

                String content = jsonNode.path("content").asText("");
                
                // 只处理 assistant 的 answer 类型消息 (兼容旧格式)
                if ("assistant".equals(role) && "answer".equals(type) && !content.isEmpty()) {
                    // 检查是否是最终的完整消息（包含 created_at 字段）
                    // 如果是最终消息，跳过它，因为前端已经通过增量累积得到了完整内容
                    boolean isFinalMessage = jsonNode.has("created_at") && jsonNode.has("time_cost");
                    if (isFinalMessage) {
                        log.info("Skipping final complete message (already accumulated via increments): {}", content);
                        return Flux.empty();
                    }
                    log.debug("Streaming content: {}", content);
                    return Flux.just(createContentEvent(content));
                }
                
                // 检查是否是 chat 完成事件（包含 status 字段）
                String status = jsonNode.path("status").asText("");
                if ("completed".equals(status) && !convId.isEmpty()) {
                    log.debug("Chat completed with conversation_id: {}", convId);
                    return Flux.just(createConversationEvent(convId));
                }
                
                // 检查错误
                JsonNode lastError = jsonNode.path("last_error");
                if (lastError.has("code") && lastError.path("code").asInt() != 0) {
                    String errorMsg = lastError.path("msg").asText("Unknown error");
                    log.error("Coze API error: {}", errorMsg);
                    return Flux.just(createErrorEvent(errorMsg));
                }
                
            } catch (Exception parseError) {
                log.debug("Failed to parse JSON data: {} - Error: {}", data, parseError.getMessage());
            }
            
            return Flux.empty();
        } catch (Exception e) {
            log.error("Error processing stream line: {}", line, e);
            return Flux.just(createErrorEvent(e.getMessage()));
        }
    }

    private String createContentEvent(String content) {
        return createGenericEvent("content", content);
    }

    private String createGenericEvent(String type, String content) {
        Map<String, Object> event = new HashMap<>();
        event.put("type", type);
        event.put("content", content);
        try {
            return objectMapper.writeValueAsString(event);
        } catch (Exception e) {
            return "";
        }
    }

    private String createDoneEvent() {
        Map<String, Object> event = new HashMap<>();
        event.put("type", "done");
        try {
            return objectMapper.writeValueAsString(event);
        } catch (Exception e) {
            return "";
        }
    }

    private String createConversationEvent(String conversationId) {
        Map<String, Object> event = new HashMap<>();
        event.put("type", "conversation");
        event.put("conversation_id", conversationId);
        try {
            return objectMapper.writeValueAsString(event);
        } catch (Exception e) {
            return "";
        }
    }

    private String createErrorEvent(String message) {
        Map<String, Object> event = new HashMap<>();
        event.put("type", "error");
        event.put("message", message);
        try {
            return objectMapper.writeValueAsString(event);
        } catch (Exception e) {
            return "";
        }
    }

    public String uploadFile(byte[] fileData, String fileName) {
        log.info("Uploading file to Coze: {}", fileName);
        if (apiToken == null || apiToken.isEmpty()) {
            throw new RuntimeException("Coze API Token is not configured");
        }
        
        // 确保文件名是有效的 UTF-8 编码
        String safeFileName = fileName;
        try {
            // 检查文件名是否包含非 ASCII 字符
            if (!java.nio.charset.StandardCharsets.US_ASCII.newEncoder().canEncode(fileName)) {
                // 对于包含中文等非 ASCII 字符的文件名，进行 URL 编码
                // 但保留扩展名可读性
                int dotIndex = fileName.lastIndexOf('.');
                if (dotIndex > 0) {
                    String name = fileName.substring(0, dotIndex);
                    String ext = fileName.substring(dotIndex);
                    safeFileName = java.net.URLEncoder.encode(name, "UTF-8").replace("+", "%20") + ext;
                } else {
                    safeFileName = java.net.URLEncoder.encode(fileName, "UTF-8").replace("+", "%20");
                }
                log.info("Encoded filename from '{}' to '{}'", fileName, safeFileName);
            }
        } catch (Exception e) {
            log.warn("Failed to encode filename, using original: {}", e.getMessage());
        }
        
        final String finalFileName = safeFileName;
        
        // 使用 ByteArrayResource 的子类来重写 getFilename
        org.springframework.core.io.ByteArrayResource resource = new org.springframework.core.io.ByteArrayResource(fileData) {
            @Override
            public String getFilename() {
                return finalFileName;
            }
        };
        
        // 检测文件的 MIME 类型
        String mimeType = "application/octet-stream";
        String lowerFileName = fileName.toLowerCase();
        if (lowerFileName.endsWith(".pdf")) {
            mimeType = "application/pdf";
        } else if (lowerFileName.endsWith(".docx")) {
            mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        } else if (lowerFileName.endsWith(".doc")) {
            mimeType = "application/msword";
        } else if (lowerFileName.endsWith(".xlsx")) {
            mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        } else if (lowerFileName.endsWith(".xls")) {
            mimeType = "application/vnd.ms-excel";
        } else if (lowerFileName.endsWith(".png")) {
            mimeType = "image/png";
        } else if (lowerFileName.endsWith(".jpg") || lowerFileName.endsWith(".jpeg")) {
            mimeType = "image/jpeg";
        } else if (lowerFileName.endsWith(".txt")) {
            mimeType = "text/plain";
        }
        
        org.springframework.http.client.MultipartBodyBuilder builder = new org.springframework.http.client.MultipartBodyBuilder();
        builder.part("file", resource, MediaType.parseMediaType(mimeType))
               .filename(finalFileName);

        // 关键修复：必须使用与 /stream_run 相同的 token 上传文件
        // 如果使用 coze.site，需要用 title-token (JWT) 上传到 api.coze.cn
        // 这样 file_id 才能在 coze.site 的对话中被识别
        String preferredToken = (titleToken != null && !titleToken.isEmpty()) ? titleToken : apiToken;
        
        // coze.site 不支持 /v1/files/upload 端点，必须使用 api.coze.cn
        // 但要使用与项目关联的 token (title-token) 来确保 file_id 在项目中可用
        List<UploadAttempt> attempts = Arrays.asList(
                // 使用 title-token 上传到 api.coze.cn，这样 file_id 在 coze.site 项目中也能用
                new UploadAttempt("https://api.coze.cn/v1/files/upload", preferredToken, "project-token"),
                // 回退：使用 api-key 上传
                new UploadAttempt("https://api.coze.cn/v1/files/upload", apiToken, "api-key")
        );

        Exception lastException = null;
        Set<String> seen = new HashSet<>();

        for (UploadAttempt attempt : attempts) {
            if (attempt == null || attempt.url == null || attempt.url.isEmpty()) continue;
            String key = attempt.url + "|" + attempt.token;
            if (!seen.add(key)) continue;

            try {
                log.info("Uploading file via {} endpoint: {}", attempt.label, attempt.url);
                return webClient.post()
                        .uri(attempt.url)
                        .header("Authorization", "Bearer " + attempt.token)
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .body(org.springframework.web.reactive.function.BodyInserters.fromMultipartData(builder.build()))
                        .retrieve()
                        .bodyToMono(String.class)
                        .block();
            } catch (WebClientResponseException e) {
                lastException = e;
                log.warn("Coze upload failed via {} (status={}): {}", attempt.label, e.getRawStatusCode(), e.getResponseBodyAsString());
            } catch (Exception e) {
                lastException = e;
                log.warn("Coze upload failed via {}: {}", attempt.label, e.getMessage());
            }
        }

        log.error("Failed to upload file to Coze API after retries", lastException);
        throw new RuntimeException("Coze Upload API call failed: " + (lastException != null ? lastException.getMessage() : "Unknown error"), lastException);
    }

    private String normalizeCozeBaseUrl(String baseUrl) {
        String resolved = (baseUrl == null || baseUrl.trim().isEmpty()) ? "https://api.coze.cn" : baseUrl.trim();

        // 兼容错误配置：有人可能把 api-url 配成 .../stream_run 或 .../v3/chat
        if (resolved.endsWith("/stream_run")) {
            resolved = resolved.substring(0, resolved.length() - "/stream_run".length());
        } else if (resolved.endsWith("/v3/chat")) {
            resolved = resolved.substring(0, resolved.length() - "/v3/chat".length());
        }

        // 去掉尾部 /
        while (resolved.endsWith("/")) {
            resolved = resolved.substring(0, resolved.length() - 1);
        }

        return resolved;
    }

    private static final class UploadAttempt {
        private final String url;
        private final String token;
        private final String label;

        private UploadAttempt(String url, String token, String label) {
            this.url = url;
            this.token = token;
            this.label = label;
        }
    }

    /**
     * 生成会话标题
     */
    public String generateTitle(String conversationText) {
        Map<String, Object> textContent = new HashMap<>();
        textContent.put("text", "请根据以下对话内容总结一个简短的标题（10字以内）：\n" + conversationText);

        Map<String, Object> promptItem = new HashMap<>();
        promptItem.put("type", "text");
        promptItem.put("content", textContent);

        Map<String, Object> query = new HashMap<>();
        query.put("prompt", Collections.singletonList(promptItem));

        Map<String, Object> content = new HashMap<>();
        content.put("query", query);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("content", content);
        requestBody.put("type", "query");
        requestBody.put("project_id", projectId);

        String targetUrl = apiUrl + "/stream_run";
        log.info("Generating title using Coze Site API: {}", targetUrl);
        log.info("Using Project ID: {}", projectId);

        try {
            String response = webClient.post()
                    .uri(targetUrl)
                    .header("Authorization", "Bearer " + (titleToken != null && !titleToken.isEmpty() ? titleToken : apiToken))
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            log.info("Title generation raw response: {}", response);

            // 解析 SSE 响应流中的内容
            if (response != null) {
                String[] lines = response.split("\n");
                StringBuilder titleBuilder = new StringBuilder();
                for (String line : lines) {
                    if (line.startsWith("data:")) {
                        String data = line.substring(5).trim();
                        if (data.equals("[DONE]")) break;
                        try {
                            JsonNode node = objectMapper.readTree(data);
                            
                            // Check for "answer" type (Coze Stream Run API)
                            String type = node.path("type").asText("");
                            if ("answer".equals(type)) {
                                JsonNode contentNode = node.path("content");
                                String answerContent = "";
                                if (contentNode.isObject() && contentNode.has("answer")) {
                                    answerContent = contentNode.path("answer").asText("");
                                } else if (contentNode.isTextual()) {
                                    answerContent = contentNode.asText("");
                                }
                                
                                if (!answerContent.isEmpty() && !"null".equals(answerContent)) {
                                    titleBuilder.append(answerContent);
                                }
                            }
                            // Check for "message" format (Legacy/Other APIs)
                            else if (node.has("message")) {
                                String contentStr = node.path("message").path("content").asText("");
                                titleBuilder.append(contentStr);
                            }
                        } catch (Exception e) {
                            // ignore
                        }
                    }
                }
                String result = titleBuilder.toString().trim();
                // 去掉可能的引号或多余字符
                return result.replaceAll("^\"|\"$", "");
            }
            return "新对话";
        } catch (Exception e) {
            log.error("Failed to generate title: {}", e.getMessage());
            return "新对话";
        }
    }
}

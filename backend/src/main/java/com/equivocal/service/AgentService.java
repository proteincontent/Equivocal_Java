package com.equivocal.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import reactor.core.publisher.Flux;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class AgentService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${agent.api-url:http://localhost:8100/v1}")
    private String apiUrl;

    public AgentService(WebClient webClient, ObjectMapper objectMapper) {
        this.webClient = webClient;
        this.objectMapper = objectMapper;
    }

    /**
     * 流式聊天方法
     */
    public Flux<String> streamChat(String userId, List<Map<String, Object>> messages) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("messages", messages);
        requestBody.put("user_id", userId);
        requestBody.put("stream", true);

        log.info("Sending stream request to Agent API: {}/chat/completions", apiUrl);

        return webClient.post()
                .uri(apiUrl + "/chat/completions")
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
            // Remove "data: " prefix if present
            String data = line.trim();
            if (data.startsWith("data:")) {
                data = data.substring(5).trim();
            }

            if (data.isEmpty() || data.startsWith("event:")) {
                return Flux.empty();
            }

            if ("[DONE]".equals(data)) {
                return Flux.just(createDoneEvent());
            }

            // The Python agent returns JSON payload directly in data
            return Flux.just(data);

        } catch (Exception e) {
            log.error("Error processing stream line: {}", line, e);
            return Flux.empty();
        }
    }
    
    private String createDoneEvent() {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("type", "done");
            return objectMapper.writeValueAsString(event);
        } catch (Exception e) {
            return "";
        }
    }
    
    /**
     * 上传文件到 Agent 服务
     */
    public String uploadFile(byte[] fileData, String filename) {
        try {
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(fileData) {
                @Override
                public String getFilename() {
                    return filename;
                }
            });

            log.info("Uploading file to Agent API: {}/files/upload", apiUrl);

            String response = webClient.post()
                    .uri(apiUrl + "/files/upload")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(); // Block for synchronous upload as expected by controller

            return response;
        } catch (Exception e) {
            log.error("Failed to upload file to Agent API", e);
            throw new RuntimeException("Upload failed: " + e.getMessage());
        }
    }

    /**
     * 生成会话标题 (从用户消息中提取有意义的标题)
     */
    public String generateTitle(String userMessage) {
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return "新对话";
        }
        
        String text = userMessage.trim();
        
        // 移除可能的 "User: " 前缀（兼容旧格式）
        if (text.startsWith("User:") || text.startsWith("user:")) {
            text = text.substring(5).trim();
        }
        
        // 如果包含换行符，只取第一行（用户的第一句话）
        int newlineIndex = text.indexOf('\n');
        if (newlineIndex > 0) {
            text = text.substring(0, newlineIndex).trim();
        }
        
        // 移除开头的问候语，提取核心内容
        String[] greetings = {"你好", "您好", "hi", "hello", "嗨", "请问", "麻烦", "帮我", "我想"};
        String lowerText = text.toLowerCase();
        for (String greeting : greetings) {
            if (lowerText.startsWith(greeting)) {
                String remaining = text.substring(greeting.length()).trim();
                // 移除可能的标点符号开头
                if (remaining.length() > 0 && "，,。.！!？?、".indexOf(remaining.charAt(0)) >= 0) {
                    remaining = remaining.substring(1).trim();
                }
                if (remaining.length() > 3) {
                    text = remaining;
                }
                break;
            }
        }
        
        // 智能截断：在合适的位置截断，避免截断在词语中间
        int maxLength = 25;
        if (text.length() <= maxLength) {
            return text;
        }
        
        // 尝试在标点符号或空格处截断
        String truncated = text.substring(0, maxLength);
        int lastBreak = -1;
        for (int i = truncated.length() - 1; i >= maxLength / 2; i--) {
            char c = truncated.charAt(i);
            if ("，,。.！!？? 、".indexOf(c) >= 0) {
                lastBreak = i;
                break;
            }
        }
        
        if (lastBreak > 0) {
            return truncated.substring(0, lastBreak) + "...";
        }
        
        return truncated + "...";
    }
}

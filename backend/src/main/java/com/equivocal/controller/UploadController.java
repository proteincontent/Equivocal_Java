package com.equivocal.controller;

import com.equivocal.service.AgentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
@Slf4j
public class UploadController {

    private final AgentService agentService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> uploadFile(@RequestParam("file") MultipartFile file) {
        Map<String, Object> response = new HashMap<>();

        try {
            log.info("Received upload request. File content type: {}", file.getContentType());
            
            if (file.isEmpty()) {
                response.put("success", false);
                response.put("error", "文件不能为空");
                return ResponseEntity.badRequest().body(response);
            }

            // 检查文件大小 (最大 10MB)
            if (file.getSize() > 10 * 1024 * 1024) {
                response.put("success", false);
                response.put("error", "文件大小不能超过10MB");
                return ResponseEntity.badRequest().body(response);
            }

            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || originalFilename.isEmpty()) {
                originalFilename = "unknown_file";
            }
            // 注意：Spring Boot 默认已正确处理 UTF-8 编码的文件名，无需额外转换
            // 日志中显示乱码是因为控制台编码问题，不影响实际传输
            
            byte[] fileData = file.getBytes();

            log.info("Uploading file: {}, size: {} bytes", originalFilename, fileData.length);

            String agentRawResponse = agentService.uploadFile(fileData, originalFilename);
            log.info("Agent upload response: {}", agentRawResponse);

            if (agentRawResponse == null) {
                throw new RuntimeException("Agent API returned null response");
            }

            // Parse Agent JSON response
            // Expected format: { "url": "...", "filename": "...", "extracted_text": "..." }
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode agentJson = mapper.readTree(agentRawResponse);
            
            // Adapt to frontend format
            // Frontend expects: success: true, data: { id: "..." }
            // We map Agent's "url" to "id"
            
            Map<String, Object> dataMap = new HashMap<>();
            if (agentJson.has("url")) {
                dataMap.put("id", agentJson.get("url").asText());
                dataMap.put("file_id", agentJson.get("url").asText()); // Redundant but safe
                dataMap.put("file_name", agentJson.has("filename") ? agentJson.get("filename").asText() : originalFilename);
            } else {
                 throw new RuntimeException("Agent API did not return URL");
            }

            response.put("success", true);
            response.put("data", dataMap);
            response.put("filename", originalFilename);
            response.put("size", fileData.length);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("File upload failed", e);
            e.printStackTrace(); // 确保打印到控制台
            response.put("success", false);
            // 防止 NPE 导致 error 字段为 null
            response.put("error", e.getMessage() != null ? e.getMessage() : "Unknown error occurred during upload: " + e.getClass().getName());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
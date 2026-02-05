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

import java.util.Arrays;
import java.util.HashSet;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
@Slf4j
public class UploadController {

    private final AgentService agentService;

    private static final Set<String> ALLOWED_CONTENT_TYPES = new HashSet<>(Arrays.asList(
            "application/pdf",
            "text/plain",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/png",
            "image/jpeg"
    ));

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

            String contentType = file.getContentType();
            if (!isAllowedContentType(contentType)) {
                response.put("success", false);
                response.put("error", "不支持的文件类型");
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

            if (!hasValidSignature(contentType, fileData)) {
                response.put("success", false);
                response.put("error", "文件内容与类型不匹配");
                return ResponseEntity.badRequest().body(response);
            }

            String agentRawResponse = agentService.uploadFile(fileData, originalFilename);
            log.debug("Agent upload response received ({} chars)", agentRawResponse != null ? agentRawResponse.length() : 0);

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
            response.put("success", false);
            response.put("error", "服务端内部错误");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    private static boolean isAllowedContentType(String contentType) {
        if (contentType == null || contentType.trim().isEmpty()) {
            return false;
        }
        String normalized = contentType.trim().toLowerCase();
        return ALLOWED_CONTENT_TYPES.contains(normalized);
    }

    private static boolean hasValidSignature(String contentType, byte[] data) {
        if (data == null) {
            return false;
        }
        String normalized = contentType != null ? contentType.trim().toLowerCase() : "";

        // text/plain can be any bytes (including empty already checked earlier).
        if ("text/plain".equals(normalized)) {
            return true;
        }

        if ("application/pdf".equals(normalized)) {
            return startsWith(data, "%PDF-".getBytes(java.nio.charset.StandardCharsets.US_ASCII));
        }

        if ("application/vnd.openxmlformats-officedocument.wordprocessingml.document".equals(normalized)) {
            // docx is a ZIP (PK..).
            return data.length >= 2 && (data[0] == 'P') && (data[1] == 'K');
        }

        if ("application/msword".equals(normalized)) {
            // Legacy .doc (OLE2) magic: D0 CF 11 E0 A1 B1 1A E1
            byte[] ole = new byte[]{
                    (byte) 0xD0, (byte) 0xCF, 0x11, (byte) 0xE0, (byte) 0xA1, (byte) 0xB1, 0x1A, (byte) 0xE1
            };
            return startsWith(data, ole);
        }

        if ("image/png".equals(normalized)) {
            byte[] png = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};
            return startsWith(data, png);
        }

        if ("image/jpeg".equals(normalized)) {
            // JPEG starts with FF D8 FF
            return data.length >= 3 && (data[0] == (byte) 0xFF) && (data[1] == (byte) 0xD8) && (data[2] == (byte) 0xFF);
        }

        return false;
    }

    private static boolean startsWith(byte[] data, byte[] prefix) {
        if (data.length < prefix.length) {
            return false;
        }
        for (int i = 0; i < prefix.length; i++) {
            if (data[i] != prefix[i]) {
                return false;
            }
        }
        return true;
    }
}

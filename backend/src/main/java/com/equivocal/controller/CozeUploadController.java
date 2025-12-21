package com.equivocal.controller;

import com.equivocal.service.CozeService;
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
@RequestMapping("/api/coze-upload")
@RequiredArgsConstructor
@Slf4j
public class CozeUploadController {

    private final CozeService cozeService;

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

            String cozeRawResponse = cozeService.uploadFile(fileData, originalFilename);
            log.info("Coze upload response: {}", cozeRawResponse);

            if (cozeRawResponse == null) {
                throw new RuntimeException("Coze API returned null response");
            }

            // 解析 Coze 返回的 JSON 字符串
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode cozeJson = mapper.readTree(cozeRawResponse);
            
            // 检查 Coze API 是否返回错误
            if (cozeJson.has("code") && cozeJson.get("code").asInt() != 0) {
                 String msg = cozeJson.has("msg") ? cozeJson.get("msg").asText() : "Unknown Coze Error";
                 throw new RuntimeException("Coze API Error: " + msg);
            }

            response.put("success", true);
            response.put("data", cozeJson.path("data")); // 提取 data 部分，包含 id
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
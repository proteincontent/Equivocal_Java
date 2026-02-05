package com.equivocal.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    
    @Value("${resend.api-key}")
    private String resendApiKey;
    
    @Value("${resend.from-email}")
    private String fromEmail;
    
    private final WebClient.Builder webClientBuilder;
    
    public boolean sendVerificationCode(String email, String code) {
        try {
            boolean apiKeyConfigured = resendApiKey != null && !resendApiKey.trim().isEmpty();
            log.info("[EmailService] Sending verification email: to={}, apiKeyConfigured={}", email, apiKeyConfigured);
            
            // 检查 API Key 是否为空
            if (!apiKeyConfigured) {
                log.error("[EmailService] 错误: Resend API Key 未配置！请设置环境变量 RESEND_API_KEY");
                return false;
            }
            
            // 检查发件人邮箱是否为默认值
            if (fromEmail == null || fromEmail.isEmpty() || fromEmail.equals("noreply@example.com")) {
                log.warn("[EmailService] 警告: 发件人邮箱为默认值或未配置，Resend 可能拒绝发送");
            }
            
            WebClient webClient = webClientBuilder
                    .baseUrl("https://api.resend.com")
                    .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + resendApiKey)
                    .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .build();
            
            String htmlContent = buildVerificationEmailHtml(code);
            
            Map<String, Object> requestBody = new HashMap<String, Object>();
            requestBody.put("from", fromEmail);
            requestBody.put("to", Arrays.asList(email));
            requestBody.put("subject", "Your Verification Code - Equivocal");
            requestBody.put("html", htmlContent);
            
            log.info("[EmailService] 正在调用 Resend API...");
            
            @SuppressWarnings("rawtypes")
            Map response = webClient.post()
                    .uri("/emails")
                    .bodyValue(requestBody)
                    .retrieve()
                    .onStatus(
                        status -> status.is4xxClientError() || status.is5xxServerError(),
                        clientResponse -> {
                            return clientResponse.bodyToMono(String.class)
                                .flatMap(errorBody -> {
                                    log.error("[EmailService] Resend API 返回错误: status={}, body={}",
                                        clientResponse.statusCode(), errorBody);
                                    return Mono.error(new RuntimeException("Resend API 错误: " + errorBody));
                                });
                        }
                    )
                    .bodyToMono(Map.class)
                    .onErrorResume(new java.util.function.Function<Throwable, Mono<Map>>() {
                        @Override
                        public Mono<Map> apply(Throwable e) {
                            log.error("[EmailService] API 调用失败: {}", e.getMessage(), e);
                            return Mono.empty();
                        }
                    })
                    .block();
            
            if (response != null && response.containsKey("id")) {
                log.info("[EmailService] ✓ 邮件发送成功: {}, messageId: {}", email, response.get("id"));
                return true;
            } else {
                log.error("[EmailService] ✗ 邮件发送失败, response: {}", response);
                return false;
            }
        } catch (Exception e) {
            log.error("[EmailService] ✗ 发生异常: {}", e.getMessage(), e);
            return false;
        }
    }
    
    private String buildVerificationEmailHtml(String code) {
        StringBuilder html = new StringBuilder();
        html.append("<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;'>");
        html.append("<div style='background-color: white; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);'>");
        html.append("<h2 style='color: #111827; margin-bottom: 24px; font-size: 24px;'>Welcome to Equivocal!</h2>");
        html.append("<p style='color: #374151; font-size: 16px; margin-bottom: 16px;'>");
        html.append("You are verifying your email. Please use the following verification code to complete registration:");
        html.append("</p>");
        html.append("<div style='background-color: #f3f4f6; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;'>");
        html.append("<div style='font-size: 36px; font-weight: bold; color: #4F46E5; letter-spacing: 8px; font-family: Courier New, monospace;'>");
        html.append(code);
        html.append("</div>");
        html.append("</div>");
        html.append("<p style='color: #6b7280; font-size: 14px; margin-top: 24px; line-height: 1.6;'>");
        html.append("<strong>Notes:</strong><br>");
        html.append("- The verification code is valid for <strong>5 minutes</strong><br>");
        html.append("- Do not share this code with anyone<br>");
        html.append("- If this was not your action, please ignore this email");
        html.append("</p>");
        html.append("<hr style='border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;'>");
        html.append("<p style='color: #9ca3af; font-size: 12px; text-align: center;'>");
        html.append("This email was sent automatically by Equivocal. Please do not reply directly.");
        html.append("</p>");
        html.append("</div>");
        html.append("</div>");
        return html.toString();
    }
}

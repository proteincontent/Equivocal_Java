package com.equivocal.service;

import com.equivocal.entity.VerificationCode;
import com.equivocal.repository.VerificationCodeRepository;
import com.equivocal.security.InMemoryRateLimiter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class VerificationService {
    
    private final VerificationCodeRepository verificationCodeRepository;
    private final EmailService emailService;
    private final InMemoryRateLimiter rateLimiter;
    
    private static final int CODE_LENGTH = 6;
    private static final int EXPIRATION_MINUTES = 5;
    private static final int MAX_ATTEMPTS = 5;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    
    @Transactional
    public SendCodeResult sendVerificationCode(String email) {
        try {
            String normalizedEmail = email != null ? email.trim().toLowerCase() : null;
            if (!rateLimiter.allow("sendCode:" + normalizedEmail)) {
                log.warn("[VerificationService] sendVerificationCode rate limited: {}", normalizedEmail);
                return new SendCodeResult(false, SendCodeStatus.RATE_LIMITED, "请求过于频繁，请稍后再试");
            }

            verificationCodeRepository.deleteByEmail(normalizedEmail);
            
            String code = generateCode();
            LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(EXPIRATION_MINUTES);
            
            VerificationCode verificationCode = VerificationCode.builder()
                    .email(normalizedEmail)
                    .code(code)
                    .expiresAt(expiresAt)
                    .attempts(0)
                    .build();
            
            verificationCodeRepository.save(verificationCode);
            
            boolean sent = emailService.sendVerificationCode(normalizedEmail, code);
            
            if (sent) {
                log.info("[VerificationService] Verification code sent: {}", normalizedEmail);
                return new SendCodeResult(true, SendCodeStatus.SENT, "Verification code sent");
            } else {
                log.error("[VerificationService] Failed to send verification code: {}", normalizedEmail);
                return new SendCodeResult(false, SendCodeStatus.SEND_FAILED, "Failed to send verification code");
            }
        } catch (Exception e) {
            log.error("[VerificationService] Exception: {}", e.getMessage(), e);
            return new SendCodeResult(false, SendCodeStatus.ERROR, "服务端内部错误");
        }
    }
    
    @Transactional
    public VerificationResult verifyCode(String email, String code) {
        VerificationCode verificationCode = verificationCodeRepository
                .findFirstByEmailOrderByCreatedAtDesc(email)
                .orElse(null);
        
        if (verificationCode == null) {
            return new VerificationResult(false, "Verification code not found");
        }
        
        if (verificationCode.isExpired()) {
            verificationCodeRepository.delete(verificationCode);
            return new VerificationResult(false, "Verification code expired");
        }
        
        if (verificationCode.getAttempts() >= MAX_ATTEMPTS) {
            verificationCodeRepository.delete(verificationCode);
            return new VerificationResult(false, "Too many attempts");
        }
        
        if (!verificationCode.getCode().equals(code)) {
            verificationCode.incrementAttempts();
            verificationCodeRepository.save(verificationCode);
            return new VerificationResult(false, "Invalid verification code");
        }
        
        verificationCodeRepository.delete(verificationCode);
        return new VerificationResult(true, "Verification successful");
    }
    
    private String generateCode() {
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < CODE_LENGTH; i++) {
            code.append(SECURE_RANDOM.nextInt(10));
        }
        return code.toString();
    }
    
    @Transactional
    public int cleanExpiredCodes() {
        return verificationCodeRepository.deleteExpiredCodes(LocalDateTime.now());
    }
    
    public static class VerificationResult {
        private final boolean success;
        private final String message;
        
        public VerificationResult(boolean success, String message) {
            this.success = success;
            this.message = message;
        }
        
        public boolean isSuccess() {
            return success;
        }
        
        public String getMessage() {
            return message;
        }
    }

    public enum SendCodeStatus {
        SENT,
        RATE_LIMITED,
        SEND_FAILED,
        ERROR
    }

    public static class SendCodeResult {
        private final boolean success;
        private final SendCodeStatus status;
        private final String message;

        public SendCodeResult(boolean success, SendCodeStatus status, String message) {
            this.success = success;
            this.status = status;
            this.message = message;
        }

        public boolean isSuccess() {
            return success;
        }

        public SendCodeStatus getStatus() {
            return status;
        }

        public String getMessage() {
            return message;
        }
    }
}

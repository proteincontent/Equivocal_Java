package com.equivocal.service;

import com.equivocal.entity.VerificationCode;
import com.equivocal.repository.VerificationCodeRepository;
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
    
    private static final int CODE_LENGTH = 6;
    private static final int EXPIRATION_MINUTES = 5;
    private static final int MAX_ATTEMPTS = 5;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    
    @Transactional
    public boolean sendVerificationCode(String email) {
        try {
            verificationCodeRepository.deleteByEmail(email);
            
            String code = generateCode();
            LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(EXPIRATION_MINUTES);
            
            VerificationCode verificationCode = VerificationCode.builder()
                    .email(email)
                    .code(code)
                    .expiresAt(expiresAt)
                    .attempts(0)
                    .build();
            
            verificationCodeRepository.save(verificationCode);
            
            boolean sent = emailService.sendVerificationCode(email, code);
            
            if (sent) {
                log.info("[VerificationService] Verification code sent: {}", email);
                return true;
            } else {
                log.error("[VerificationService] Failed to send verification code: {}", email);
                return false;
            }
        } catch (Exception e) {
            log.error("[VerificationService] Exception: {}", e.getMessage(), e);
            return false;
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
}

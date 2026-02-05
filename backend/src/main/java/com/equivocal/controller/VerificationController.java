package com.equivocal.controller;

import com.equivocal.service.VerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class VerificationController {
    
    private final VerificationService verificationService;
    
    @PostMapping("/send-code")
    public ResponseEntity<Map<String, Object>> sendCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        
        if (email == null || email.trim().isEmpty()) {
            Map<String, Object> error = new HashMap<String, Object>();
            error.put("success", false);
            error.put("error", "Email is required");
            return ResponseEntity.badRequest().body(error);
        }
        
        if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            Map<String, Object> error = new HashMap<String, Object>();
            error.put("success", false);
            error.put("error", "Invalid email format");
            return ResponseEntity.badRequest().body(error);
        }
        
        log.info("[VerificationController] Send code request: {}", email);
        
        VerificationService.SendCodeResult result =
                verificationService.sendVerificationCode(email.trim().toLowerCase());
        
        if (result.isSuccess()) {
            Map<String, Object> ok = new HashMap<String, Object>();
            ok.put("success", true);
            ok.put("message", "Verification code sent");
            return ResponseEntity.ok(ok);
        }

        Map<String, Object> error = new HashMap<String, Object>();
        error.put("success", false);
        error.put("error", result.getMessage());

        if (result.getStatus() == VerificationService.SendCodeStatus.RATE_LIMITED) {
            return ResponseEntity.status(429).body(error);
        }

        return ResponseEntity.internalServerError().body(error);
    }
    
    @PostMapping("/verify-code")
    public ResponseEntity<Map<String, Object>> verifyCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");
        
        if (email == null || email.trim().isEmpty()) {
            Map<String, Object> error = new HashMap<String, Object>();
            error.put("success", false);
            error.put("error", "Email is required");
            return ResponseEntity.badRequest().body(error);
        }
        
        if (code == null || code.trim().isEmpty()) {
            Map<String, Object> error = new HashMap<String, Object>();
            error.put("success", false);
            error.put("error", "Verification code is required");
            return ResponseEntity.badRequest().body(error);
        }
        
        log.info("[VerificationController] Verify code request: {}", email);
        
        VerificationService.VerificationResult result = 
                verificationService.verifyCode(email.trim().toLowerCase(), code.trim());
        
        if (result.isSuccess()) {
            Map<String, Object> response = new HashMap<String, Object>();
            response.put("success", true);
            response.put("message", result.getMessage());
            return ResponseEntity.ok(response);
        } else {
            Map<String, Object> error = new HashMap<String, Object>();
            error.put("success", false);
            error.put("error", result.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}

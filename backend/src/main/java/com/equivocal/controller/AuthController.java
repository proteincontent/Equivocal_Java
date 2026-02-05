package com.equivocal.controller;

import com.equivocal.dto.AuthRequest;
import com.equivocal.dto.AuthResponse;
import com.equivocal.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    
    private final AuthService authService;
    
    /**
     * POST /api/auth/login - 登录或注册
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticate(@RequestBody AuthRequest request) {
        log.info("[AuthController] 收到认证请求: email={}", request.getEmail());
        
        try {
            AuthResponse response = authService.authenticate(request);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            log.error("[AuthController] 认证过程中发生异常", e);
            return ResponseEntity.internalServerError()
                    .body(AuthResponse.error("服务端内部错误"));
        }
    }
}

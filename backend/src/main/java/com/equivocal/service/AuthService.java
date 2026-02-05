package com.equivocal.service;

import com.equivocal.dto.AuthRequest;
import com.equivocal.dto.AuthResponse;
import com.equivocal.entity.User;
import com.equivocal.repository.UserRepository;
import com.equivocal.security.JwtService;
import com.equivocal.security.PasswordService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordService passwordService;
    private final JwtService jwtService;
    private final VerificationService verificationService;
    
    /**
     * 登录或注册
     */
    @Transactional
    public AuthResponse authenticate(AuthRequest request) {
        String email = request.getEmail();
        String password = request.getPassword();
        
        if (email == null || email.isEmpty() || password == null || password.isEmpty()) {
            return AuthResponse.error("邮箱和密码不能为空");
        }
        
        Optional<User> existingUser = userRepository.findByEmail(email);
        
        if (existingUser.isPresent()) {
            // 登录
            return login(existingUser.get(), password);
        } else {
            // 注册
            return register(email, password, request.getCode());
        }
    }
    
    /**
     * 登录
     */
    private AuthResponse login(User user, String password) {
        log.info("[AuthService] 尝试登录: email={}, hasPassword={}, isBcrypt={}",
                user.getEmail(),
                user.getPassword() != null,
                user.getPassword() != null && user.getPassword().startsWith("$2"));

        // 验证密码
        try {
            if (!passwordService.verifyPassword(password, user.getPassword())) {
                log.warn("[AuthService] 密码错误: email={}", user.getEmail());
                return AuthResponse.error("密码错误");
            }
        } catch (Exception e) {
            log.error("[AuthService] 密码验证抛出异常", e);
            throw e;
        }
        
        // 检查是否需要升级密码哈希
        if (passwordService.needsUpgrade(user.getPassword())) {
            String newHash = passwordService.hashPassword(password);
            user.setPassword(newHash);
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
            log.info("[AuthService] 密码哈希已升级: userId={}", user.getId());
        }
        
        // 生成 Token（使用最新的 role 值）
        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());
        
        log.info("[AuthService] 用户登录成功: userId={}, email={}, role={}", user.getId(), user.getEmail(), user.getRole());
        
        return AuthResponse.success(token, buildUserInfo(user));
    }
    
    /**
     * 注册
     */
    private AuthResponse register(String email, String password, String code) {
        // 验证邮箱格式
        if (!isValidEmail(email)) {
            return AuthResponse.error("邮箱格式不正确");
        }
        
        // 验证密码强度
        if (password.length() < 6) {
            return AuthResponse.error("密码长度至少为6位");
        }

        // 验证验证码
        if (code == null || code.isEmpty()) {
            return AuthResponse.error("请输入验证码");
        }
        VerificationService.VerificationResult verificationResult = verificationService.verifyCode(email, code);
        if (!verificationResult.isSuccess()) {
            return AuthResponse.error(verificationResult.getMessage());
        }
        
        // 创建用户
        String hashedPassword = passwordService.hashPassword(password);
        
        // 生成用户 ID（格式：user_时间戳_随机字符串）
        String userId = "user_" + System.currentTimeMillis() + "_" +
                        Long.toHexString(Double.doubleToLongBits(Math.random())).substring(0, 7);
        
        // 默认注册为普通用户；管理员权限应通过受控流程授予
        Integer role = 1;

        User user = User.builder()
                .id(userId)
                .email(email)
                .password(hashedPassword)
                .role(role)
                .emailVerified(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        user = userRepository.save(user);
        
        // 生成 Token
        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());
        
        log.info("[AuthService] 用户注册成功: userId={}, email={}", user.getId(), email);
        
        return AuthResponse.success(token, buildUserInfo(user));
    }
    
    /**
     * 构建用户信息
     */
    private AuthResponse.UserInfo buildUserInfo(User user) {
        return AuthResponse.UserInfo.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .emailVerified(user.getEmailVerified())
                .build();
    }
    
    /**
     * 验证邮箱格式
     */
    private boolean isValidEmail(String email) {
        return email != null && email.matches("^[A-Za-z0-9+_.-]+@(.+)$");
    }
}

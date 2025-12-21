package com.equivocal.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class PasswordService {
    
    private final BCryptPasswordEncoder passwordEncoder;
    
    public PasswordService() {
        this.passwordEncoder = new BCryptPasswordEncoder(10);
    }
    
    /**
     * 对密码进行哈希加密
     */
    public String hashPassword(String password) {
        String hash = passwordEncoder.encode(password);
        log.debug("[PasswordService] 密码哈希成功");
        return hash;
    }
    
    /**
     * 验证密码是否匹配
     */
    public boolean verifyPassword(String rawPassword, String encodedPassword) {
        if (encodedPassword == null) {
            return false;
        }

        boolean matches;
        if (isBcryptHash(encodedPassword)) {
            matches = passwordEncoder.matches(rawPassword, encodedPassword);
        } else {
            // 尝试旧版密码验证
            matches = verifyLegacyPassword(rawPassword, encodedPassword);
        }
        
        log.debug("[PasswordService] 密码验证: {}", matches ? "成功" : "失败");
        return matches;
    }
    
    /**
     * 检查密码是否为 BCrypt 格式
     */
    public boolean isBcryptHash(String password) {
        return password != null && password.startsWith("$2");
    }
    
    /**
     * 检查密码是否需要升级（从旧格式升级到 BCrypt）
     */
    public boolean needsUpgrade(String storedPassword) {
        // 如果不是 BCrypt 格式，则需要升级
        return !isBcryptHash(storedPassword);
    }
    
    /**
     * 旧版简单哈希函数（仅用于验证和迁移旧密码）
     */
    public String legacySimpleHash(String str) {
        int hash = 0;
        for (int i = 0; i < str.length(); i++) {
            char c = str.charAt(i);
            hash = ((hash << 5) - hash) + c;
            hash = hash & hash;
        }
        
        // 添加盐值
        String salt = "equivocal_salt_2024";
        int saltedHash = hash;
        for (int i = 0; i < salt.length(); i++) {
            char c = salt.charAt(i);
            saltedHash = ((saltedHash << 5) - saltedHash) + c;
            saltedHash = saltedHash & saltedHash;
        }
        
        return String.format("%08x%08x", Math.abs(saltedHash), Math.abs(hash));
    }
    
    /**
     * 验证旧格式密码
     */
    public boolean verifyLegacyPassword(String rawPassword, String storedHash) {
        String computedHash = legacySimpleHash(rawPassword);
        return computedHash.equals(storedHash);
    }
}
package com.equivocal.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
@Slf4j
public class JwtService {
    
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    @Value("${jwt.expiration}")
    private long jwtExpiration;
    
    private SecretKey secretKey;
    
    @PostConstruct
    public void init() {
        // 确保密钥足够长（至少 256 位 = 32 字节）
        if (jwtSecret == null || jwtSecret.trim().isEmpty()) {
            throw new IllegalStateException("jwt.secret 未配置（至少 32 字节）");
        }

        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalStateException("jwt.secret 长度不足（至少 32 字节）");
        }
        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
    }
    
    /**
     * 生成 JWT Token
     */
    public String generateToken(String userId, String email, Integer role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);
        
        return Jwts.builder()
                .setSubject(userId)
                .claim("email", email)
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }
    
    /**
     * 从 Token 中提取用户 ID
     */
    public String extractUserId(String token) {
        Claims claims = extractAllClaims(token);
        return claims.getSubject();
    }
    
    /**
     * 从 Token 中提取邮箱
     */
    public String extractEmail(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("email", String.class);
    }
    
    /**
     * 从 Token 中提取角色
     */
    public Integer extractRole(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("role", Integer.class);
    }
    
    /**
     * 验证 Token 是否有效
     */
    public boolean isTokenValid(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return !claims.getExpiration().before(new Date());
        } catch (Exception e) {
            log.warn("[JwtService] Token 验证失败: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * 提取所有 Claims
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}

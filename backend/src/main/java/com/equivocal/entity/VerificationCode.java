package com.equivocal.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "verification_codes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerificationCode {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String code;
    
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
    
    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column
    @Builder.Default
    private Boolean used = false;
    
    @Column
    @Builder.Default
    private Integer attempts = 0;
    
    /**
     * 检查验证码是否已过期
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
    
    /**
     * 获取尝试次数
     */
    public int getAttempts() {
        return attempts != null ? attempts : 0;
    }
    
    /**
     * 增加尝试次数
     */
    public void incrementAttempts() {
        if (attempts == null) {
            attempts = 0;
        }
        attempts++;
    }
}
package com.equivocal.repository;

import com.equivocal.entity.VerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface VerificationCodeRepository extends JpaRepository<VerificationCode, Long> {
    
    /**
     * 根据邮箱查找最新的验证码
     */
    Optional<VerificationCode> findFirstByEmailOrderByCreatedAtDesc(String email);
    
    /**
     * 删除邮箱的所有验证码
     */
    void deleteByEmail(String email);
    
    /**
     * 删除过期的验证码
     */
    @Modifying
    @Query("DELETE FROM VerificationCode v WHERE v.expiresAt < :now")
    int deleteExpiredCodes(LocalDateTime now);
}
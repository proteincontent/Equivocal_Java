package com.equivocal.repository;

import com.equivocal.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, String> {
    
    /**
     * 根据用户ID查找所有会话，按更新时间降序
     */
    List<ChatSession> findByUserIdOrderByUpdatedAtDesc(String userId);
    
    /**
     * 删除用户的所有会话
     */
    @Modifying
    @Transactional
    void deleteByUserId(String userId);
    
    /**
     * 统计指定时间之后创建的会话数量
     */
    long countByCreatedAtAfter(LocalDateTime dateTime);
}
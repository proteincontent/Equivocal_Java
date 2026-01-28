package com.equivocal.repository;

import com.equivocal.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
     * 获取用户所有「有消息」的会话（避免 N+1 查询）。
     *
     * 说明：前端侧边栏只展示有聊天记录的会话；如果逐个会话去查 message 列表，会导致大量 SQL 请求，
     * 在 TiDB Cloud 等高延迟数据库环境下容易出现超时/500。
     */
    @Query("SELECT s FROM ChatSession s " +
            "WHERE s.userId = :userId " +
            "AND EXISTS (SELECT 1 FROM ChatMessage m WHERE m.sessionId = s.id) " +
            "ORDER BY s.updatedAt DESC")
    List<ChatSession> findWithMessagesByUserIdOrderByUpdatedAtDesc(@Param("userId") String userId);
    
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

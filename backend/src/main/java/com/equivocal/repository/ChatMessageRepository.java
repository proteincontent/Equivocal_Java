package com.equivocal.repository;

import com.equivocal.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    /**
     * 根据会话ID查找所有消息，按创建时间升序
     */
    List<ChatMessage> findBySessionIdOrderByCreatedAtAsc(String sessionId);

    /**
     * 分页查询会话消息（排序由 Pageable 的 Sort 决定）。
     */
    Page<ChatMessage> findBySessionId(String sessionId, Pageable pageable);

    long countBySessionId(String sessionId);

    interface SessionMessageCount {
        String getSessionId();

        long getCnt();
    }

    @Query("SELECT m.sessionId as sessionId, COUNT(m) as cnt " +
            "FROM ChatMessage m " +
            "WHERE m.sessionId IN :sessionIds " +
            "GROUP BY m.sessionId")
    List<SessionMessageCount> countMessagesBySessionIds(@Param("sessionIds") Collection<String> sessionIds);
    
    /**
     * 删除会话的所有消息
     */
    @Modifying
    @Transactional
    void deleteBySessionId(String sessionId);

    /**
     * 批量删除多个会话的所有消息
     */
    @Modifying
    @Transactional
    void deleteBySessionIdIn(Collection<String> sessionIds);
}

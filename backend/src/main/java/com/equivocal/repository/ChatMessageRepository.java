package com.equivocal.repository;

import com.equivocal.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    /**
     * 根据会话ID查找所有消息，按创建时间升序
     */
    List<ChatMessage> findBySessionIdOrderByCreatedAtAsc(String sessionId);
    
    /**
     * 删除会话的所有消息
     */
    @Modifying
    @Transactional
    void deleteBySessionId(String sessionId);
}
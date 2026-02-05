package com.equivocal;

import com.equivocal.controller.AdminChatController;
import com.equivocal.entity.ChatSession;
import com.equivocal.repository.ChatMessageRepository;
import com.equivocal.repository.ChatSessionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminChatControllerPaginationTest {

    @Mock
    private ChatSessionRepository chatSessionRepository;

    @Mock
    private ChatMessageRepository chatMessageRepository;

    @InjectMocks
    private AdminChatController adminChatController;

    @Captor
    private ArgumentCaptor<Pageable> pageableCaptor;

    @Test
    void getSessionMessages_clampsPageAndLimit() {
        ChatSession session = ChatSession.builder()
                .id("s")
                .userId("u")
                .title("t")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(chatSessionRepository.findById("s")).thenReturn(Optional.of(session));
        when(chatMessageRepository.findBySessionId(eq("s"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(Collections.emptyList()));

        adminChatController.getSessionMessages("s", -100, 99999);

        verify(chatMessageRepository).findBySessionId(eq("s"), pageableCaptor.capture());
        Pageable pageable = pageableCaptor.getValue();
        assertEquals(0, pageable.getPageNumber());
        assertEquals(500, pageable.getPageSize());
    }
}


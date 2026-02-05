package com.equivocal;

import com.equivocal.controller.AdminUserController;
import com.equivocal.repository.ChatMessageRepository;
import com.equivocal.repository.ChatSessionRepository;
import com.equivocal.repository.UserRepository;
import com.equivocal.security.PasswordService;
import org.junit.jupiter.api.Test;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AdminUserControllerChatSessionsEmptyTest {

    @Test
    void getUserChatSessions_whenNoSessions_doesNotQueryCountsWithEmptyInClause() {
        UserRepository userRepository = mock(UserRepository.class);
        ChatSessionRepository chatSessionRepository = mock(ChatSessionRepository.class);
        ChatMessageRepository chatMessageRepository = mock(ChatMessageRepository.class);
        PasswordService passwordService = mock(PasswordService.class);

        when(userRepository.existsById("u")).thenReturn(true);
        when(chatSessionRepository.findByUserIdOrderByUpdatedAtDesc("u")).thenReturn(Collections.emptyList());

        AdminUserController controller = new AdminUserController(
                userRepository,
                chatSessionRepository,
                chatMessageRepository,
                passwordService
        );

        Object response = controller.getUserChatSessions("u").getBody();
        assertEquals(Collections.emptyList(), response);

        verify(chatMessageRepository, never()).countMessagesBySessionIds(Collections.emptyList());
    }
}


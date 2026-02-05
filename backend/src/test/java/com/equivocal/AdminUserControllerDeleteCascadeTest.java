package com.equivocal;

import com.equivocal.controller.AdminUserController;
import com.equivocal.entity.ChatSession;
import com.equivocal.repository.ChatMessageRepository;
import com.equivocal.repository.ChatSessionRepository;
import com.equivocal.repository.UserRepository;
import com.equivocal.security.PasswordService;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AdminUserControllerDeleteCascadeTest {

    @Test
    void deleteUser_deletesMessagesBeforeSessionsAndUser() {
        UserRepository userRepository = mock(UserRepository.class);
        ChatSessionRepository chatSessionRepository = mock(ChatSessionRepository.class);
        ChatMessageRepository chatMessageRepository = mock(ChatMessageRepository.class);
        PasswordService passwordService = mock(PasswordService.class);

        when(userRepository.existsById("u")).thenReturn(true);

        List<ChatSession> sessions = Arrays.asList(
                ChatSession.builder().id("s1").userId("u").build(),
                ChatSession.builder().id("s2").userId("u").build()
        );
        when(chatSessionRepository.findByUserIdOrderByUpdatedAtDesc("u")).thenReturn(sessions);

        AdminUserController controller = new AdminUserController(
                userRepository,
                chatSessionRepository,
                chatMessageRepository,
                passwordService
        );

        controller.deleteUser("u");

        InOrder order = inOrder(chatSessionRepository, chatMessageRepository, userRepository);
        order.verify(chatSessionRepository).findByUserIdOrderByUpdatedAtDesc(eq("u"));
        order.verify(chatMessageRepository).deleteBySessionIdIn(eq(Arrays.asList("s1", "s2")));
        order.verify(chatSessionRepository).deleteByUserId(eq("u"));
        order.verify(userRepository).deleteById(eq("u"));
    }
}


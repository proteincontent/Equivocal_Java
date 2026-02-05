package com.equivocal;

import com.equivocal.controller.ChatController;
import com.equivocal.entity.User;
import com.equivocal.repository.ChatMessageRepository;
import com.equivocal.repository.ChatSessionRepository;
import com.equivocal.repository.UserRepository;
import com.equivocal.service.AgentService;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;

class ChatControllerSyncDeprecatedTest {

    @Test
    void syncChat_returns410AndHasNoSideEffects() {
        AgentService agentService = mock(AgentService.class);
        ChatSessionRepository chatSessionRepository = mock(ChatSessionRepository.class);
        ChatMessageRepository chatMessageRepository = mock(ChatMessageRepository.class);
        UserRepository userRepository = mock(UserRepository.class);

        ChatController controller = new ChatController(
                agentService,
                chatSessionRepository,
                chatMessageRepository,
                userRepository
        );

        ChatController.ChatRequest request = new ChatController.ChatRequest();
        User user = User.builder().id("user_1").email("u@example.com").password("x").role(1).build();

        ResponseEntity<?> response = controller.syncChat(request, user);

        assertEquals(410, response.getStatusCodeValue());
        assertNotNull(response.getBody());

        verifyNoInteractions(agentService, chatSessionRepository, chatMessageRepository, userRepository);

        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        @SuppressWarnings("unchecked")
        Map<String, String> error = (Map<String, String>) body.get("error");

        assertEquals("服务端内部错误", error.get("message"));
        assertEquals("deprecated", error.get("type"));
    }
}


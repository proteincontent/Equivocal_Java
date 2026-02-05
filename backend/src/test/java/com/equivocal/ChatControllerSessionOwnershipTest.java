package com.equivocal;

import com.equivocal.controller.ChatController;
import com.equivocal.entity.ChatMessage;
import com.equivocal.entity.ChatSession;
import com.equivocal.entity.User;
import com.equivocal.repository.ChatMessageRepository;
import com.equivocal.repository.ChatSessionRepository;
import com.equivocal.repository.UserRepository;
import com.equivocal.service.AgentService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Flux;

import java.time.Duration;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatControllerSessionOwnershipTest {

    @Mock
    private AgentService agentService;

    @Mock
    private ChatSessionRepository chatSessionRepository;

    @Mock
    private ChatMessageRepository chatMessageRepository;

    @Mock
    private UserRepository userRepository;

    @Captor
    private ArgumentCaptor<ChatMessage> savedMessageCaptor;

    @Test
    void streamChat_sessionIdNotOwnedByCurrentUser_createsNewSessionAndDoesNotTouchOtherSession() throws Exception {
        User userA = User.builder()
                .id("user_a")
                .email("a@example.com")
                .password("x")
                .role(1)
                .build();

        ChatSession sessionB = ChatSession.builder()
                .id("session_b")
                .userId("user_b")
                .title("New Chat")
                .build();

        when(chatSessionRepository.findById("session_b")).thenReturn(Optional.of(sessionB));
        lenient().when(chatSessionRepository.save(any(ChatSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        when(chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(anyString())).thenReturn(Collections.emptyList());
        when(chatMessageRepository.save(any(ChatMessage.class))).thenAnswer(invocation -> invocation.getArgument(0));

        when(agentService.streamChat(anyString(), anyList())).thenReturn(Flux.empty());

        ChatController controller = new ChatController(agentService, chatSessionRepository, chatMessageRepository, userRepository);

        ChatController.ChatRequest request = new ChatController.ChatRequest();
        request.setSessionId("session_b");

        Map<String, String> userMsg = new HashMap<>();
        userMsg.put("role", "user");
        userMsg.put("content", "hello");
        request.setMessages(Collections.singletonList(userMsg));

        List<String> events = controller.streamChat(request, userA)
                .collectList()
                .block(Duration.ofSeconds(2));

        assertNotNull(events);
        JsonNode first = new ObjectMapper().readTree(events.get(0));
        String returnedSessionId = first.path("sessionId").asText();

        assertNotEquals("session_b", returnedSessionId);
        verify(chatMessageRepository, never()).findBySessionIdOrderByCreatedAtAsc("session_b");

        verify(chatMessageRepository).save(savedMessageCaptor.capture());
        assertNotEquals("session_b", savedMessageCaptor.getValue().getSessionId());
    }
}


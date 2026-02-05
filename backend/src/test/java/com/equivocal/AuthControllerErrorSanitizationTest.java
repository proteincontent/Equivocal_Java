package com.equivocal;

import com.equivocal.controller.AuthController;
import com.equivocal.dto.AuthRequest;
import com.equivocal.dto.AuthResponse;
import com.equivocal.service.AuthService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AuthControllerErrorSanitizationTest {

    @Test
    void authenticate_whenServiceThrows_doesNotLeakExceptionMessage() {
        AuthService authService = mock(AuthService.class);
        when(authService.authenticate(new AuthRequest("user@example.com", "pass", null)))
                .thenThrow(new RuntimeException("db down"));

        AuthController controller = new AuthController(authService);
        AuthResponse response = controller.authenticate(new AuthRequest("user@example.com", "pass", null)).getBody();

        assertNotNull(response);
        assertTrue(response.isSuccess() == false);
        assertNotNull(response.getError());
        assertFalse(response.getError().contains("db down"));
    }
}


package com.equivocal;

import com.equivocal.dto.AuthRequest;
import com.equivocal.dto.AuthResponse;
import com.equivocal.entity.User;
import com.equivocal.repository.UserRepository;
import com.equivocal.security.JwtService;
import com.equivocal.security.PasswordService;
import com.equivocal.service.AuthService;
import com.equivocal.service.VerificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceAdminBackdoorTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordService passwordService;

    @Mock
    private JwtService jwtService;

    @Mock
    private VerificationService verificationService;

    @InjectMocks
    private AuthService authService;

    @Captor
    private ArgumentCaptor<User> userCaptor;

    @Test
    void register_adminEmail_doesNotGrantAdminRole() {
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.empty());
        when(verificationService.verifyCode("admin@example.com", "123456"))
                .thenReturn(new VerificationService.VerificationResult(true, "ok"));
        when(passwordService.hashPassword("pass123")).thenReturn("$2hash");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(jwtService.generateToken(any(), any(), any())).thenReturn("token");

        AuthResponse response = authService.authenticate(new AuthRequest("admin@example.com", "pass123", "123456"));

        assertTrue(response.isSuccess());
        assertNotNull(response.getUser());
        assertEquals(1, response.getUser().getRole());
    }

    @Test
    void login_adminEmail_doesNotAutoUpgradeAdminRole() {
        User existing = User.builder()
                .id("user_1")
                .email("admin@example.com")
                .password("$2a$10$hash")
                .role(1)
                .emailVerified(true)
                .build();

        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(existing));
        when(passwordService.verifyPassword("pass123", existing.getPassword())).thenReturn(true);
        when(passwordService.needsUpgrade(existing.getPassword())).thenReturn(false);
        when(jwtService.generateToken(any(), any(), any())).thenReturn("token");

        AuthResponse response = authService.authenticate(new AuthRequest("admin@example.com", "pass123", null));

        assertTrue(response.isSuccess());
        assertNotNull(response.getUser());
        assertEquals(1, response.getUser().getRole());
        assertEquals(1, existing.getRole());
    }
}

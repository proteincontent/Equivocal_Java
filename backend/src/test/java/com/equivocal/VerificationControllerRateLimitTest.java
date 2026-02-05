package com.equivocal;

import com.equivocal.controller.VerificationController;
import com.equivocal.service.VerificationService;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class VerificationControllerRateLimitTest {

    @Test
    void sendCode_whenRateLimited_returns429() {
        VerificationService verificationService = mock(VerificationService.class);
        VerificationController controller = new VerificationController(verificationService);

        Map<String, String> request = new HashMap<>();
        request.put("email", "user@example.com");

        when(verificationService.sendVerificationCode("user@example.com"))
                .thenReturn(new VerificationService.SendCodeResult(
                        false,
                        VerificationService.SendCodeStatus.RATE_LIMITED,
                        "请求过于频繁，请稍后再试"
                ));

        ResponseEntity<Map<String, Object>> response = controller.sendCode(request);

        assertEquals(429, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals(false, response.getBody().get("success"));
        assertEquals("请求过于频繁，请稍后再试", response.getBody().get("error"));
    }
}


package com.equivocal;

import com.equivocal.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertThrows;

class JwtServiceSecretValidationTest {

    @Test
    void init_whenSecretShorterThan32Bytes_throws() {
        JwtService jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "jwtSecret", "too-short");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 1000L);

        assertThrows(IllegalStateException.class, jwtService::init);
    }
}


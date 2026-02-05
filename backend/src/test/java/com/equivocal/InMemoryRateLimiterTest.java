package com.equivocal;

import com.equivocal.security.InMemoryRateLimiter;
import org.junit.jupiter.api.Test;

import java.util.concurrent.atomic.AtomicLong;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class InMemoryRateLimiterTest {

    @Test
    void allow_blocksAfterLimitWithinWindow_andResetsAfterWindow() {
        AtomicLong now = new AtomicLong(0);
        InMemoryRateLimiter limiter = new InMemoryRateLimiter(1000, 3, now::get);

        assertTrue(limiter.allow("k"));
        assertTrue(limiter.allow("k"));
        assertTrue(limiter.allow("k"));
        assertFalse(limiter.allow("k"));

        now.set(1001);
        assertTrue(limiter.allow("k"));
    }
}


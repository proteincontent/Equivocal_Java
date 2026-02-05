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

    @Test
    void allow_doesNotCreateUnboundedKeys_whenMaxEntriesReached() {
        AtomicLong now = new AtomicLong(0);
        InMemoryRateLimiter limiter = new InMemoryRateLimiter(1000, 1, 2, 10_000, now::get);

        assertTrue(limiter.allow("k1"));
        assertTrue(limiter.allow("k2"));
        assertFalse(limiter.allow("k3"));
    }

    @Test
    void allow_cleansUpStaleEntries_toMakeRoomForNewKeys() {
        AtomicLong now = new AtomicLong(0);
        InMemoryRateLimiter limiter = new InMemoryRateLimiter(1000, 1, 2, 5, now::get);

        assertTrue(limiter.allow("k1"));
        assertTrue(limiter.allow("k2"));

        // Make both stale
        now.set(100);
        assertTrue(limiter.allow("k3"));
    }
}

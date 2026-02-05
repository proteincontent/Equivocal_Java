package com.equivocal.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.function.LongSupplier;

@Component
public class InMemoryRateLimiter {

    private final long windowMs;
    private final int maxRequests;
    private final LongSupplier nowMs;

    private final ConcurrentMap<String, WindowCounter> counters = new ConcurrentHashMap<>();

    public InMemoryRateLimiter(
            @Value("${app.rate-limit.window-ms:300000}") long windowMs,
            @Value("${app.rate-limit.max-requests:10}") int maxRequests) {
        this(windowMs, maxRequests, System::currentTimeMillis);
    }

    public InMemoryRateLimiter(long windowMs, int maxRequests, LongSupplier nowMs) {
        this.windowMs = windowMs;
        this.maxRequests = maxRequests;
        this.nowMs = nowMs;
    }

    public boolean allow(String key) {
        if (key == null || key.trim().isEmpty()) {
            return true;
        }
        long now = nowMs.getAsLong();
        return counters.computeIfAbsent(key, k -> new WindowCounter()).allow(now, windowMs, maxRequests);
    }

    private static final class WindowCounter {
        private long windowStartMs;
        private int count;

        synchronized boolean allow(long nowMs, long windowMs, int maxRequests) {
            if (count == 0 || nowMs - windowStartMs >= windowMs) {
                windowStartMs = nowMs;
                count = 0;
            }

            if (count >= maxRequests) {
                return false;
            }

            count++;
            return true;
        }
    }
}


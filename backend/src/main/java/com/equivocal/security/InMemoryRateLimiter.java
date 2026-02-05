package com.equivocal.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.function.LongSupplier;

@Component
public class InMemoryRateLimiter {

    private final long windowMs;
    private final int maxRequests;
    private final int maxEntries;
    private final long staleAfterMs;
    private final LongSupplier nowMs;

    private final ConcurrentMap<String, WindowCounter> counters = new ConcurrentHashMap<>();

    @Autowired
    public InMemoryRateLimiter(
            @Value("${app.rate-limit.window-ms:300000}") long windowMs,
            @Value("${app.rate-limit.max-requests:10}") int maxRequests,
            @Value("${app.rate-limit.max-entries:10000}") int maxEntries,
            @Value("${app.rate-limit.stale-after-ms:3600000}") long staleAfterMs) {
        this(windowMs, maxRequests, maxEntries, staleAfterMs, System::currentTimeMillis);
    }

    public InMemoryRateLimiter(long windowMs, int maxRequests, LongSupplier nowMs) {
        this(windowMs, maxRequests, 10_000, 3_600_000, nowMs);
    }

    public InMemoryRateLimiter(long windowMs, int maxRequests, int maxEntries, long staleAfterMs, LongSupplier nowMs) {
        this.windowMs = windowMs;
        this.maxRequests = maxRequests;
        this.maxEntries = maxEntries;
        this.staleAfterMs = staleAfterMs;
        this.nowMs = nowMs;
    }

    public boolean allow(String key) {
        if (key == null || key.trim().isEmpty()) {
            return true;
        }
        long now = nowMs.getAsLong();

        // Prevent unbounded growth if an attacker floods unique keys.
        // If we're already at capacity, don't create new buckets.
        if (counters.size() >= maxEntries && !counters.containsKey(key)) {
            cleanupStale(now);
            if (counters.size() >= maxEntries && !counters.containsKey(key)) {
                return false;
            }
        }

        WindowCounter counter = counters.computeIfAbsent(key, k -> new WindowCounter());
        boolean allowed = counter.allow(now, windowMs, maxRequests);
        counter.lastSeenMs = now;

        // Best-effort cleanup when map grows large.
        if (counters.size() > maxEntries) {
            cleanupStale(now);
        }

        return allowed;
    }

    private void cleanupStale(long nowMs) {
        if (staleAfterMs <= 0) {
            return;
        }

        // Iteration is weakly consistent for ConcurrentHashMap; we use remove(key, value) for safety.
        for (java.util.Map.Entry<String, WindowCounter> entry : counters.entrySet()) {
            WindowCounter counter = entry.getValue();
            if (counter != null && nowMs - counter.lastSeenMs > staleAfterMs) {
                counters.remove(entry.getKey(), counter);
            }
        }
    }

    private static final class WindowCounter {
        private long windowStartMs;
        private int count;
        private volatile long lastSeenMs;

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

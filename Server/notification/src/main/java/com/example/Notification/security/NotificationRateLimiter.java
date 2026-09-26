package com.example.Notification.security;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/** Atomic fixed-window quotas with bounded storage; rejected requests consume no tokens. */
@Component
@RequiredArgsConstructor
public class NotificationRateLimiter {
    private final NotificationProtectionProperties properties;
    private final Clock clock;
    private final Map<String, Bucket> buckets = new HashMap<>();
    private Bucket global;

    public synchronized void acquire(String caller, String recipient) {
        long now = clock.millis();
        buckets.values().removeIf(bucket -> bucket.expiresAt <= now);
        if (global == null || global.expiresAt <= now) {
            global = new Bucket(now + properties.window().toMillis());
        }
        String callerKey = "caller:" + caller;
        String recipientKey = "recipient:" + recipient.strip().toLowerCase(Locale.ROOT);
        Bucket callerBucket = buckets.get(callerKey);
        Bucket recipientBucket = buckets.get(recipientKey);
        check(global, properties.globalLimit(), now);
        check(callerBucket, properties.callerLimit(), now);
        check(recipientBucket, properties.recipientLimit(), now);
        int needed = (callerBucket == null ? 1 : 0) + (recipientBucket == null ? 1 : 0);
        if (buckets.size() + needed > properties.maxTrackedKeys()) {
            long nextExpiry = buckets.values().stream().mapToLong(bucket -> bucket.expiresAt).min().orElse(global.expiresAt);
            throw limited(nextExpiry, now);
        }
        callerBucket = buckets.computeIfAbsent(callerKey, unused -> new Bucket(now + properties.window().toMillis()));
        recipientBucket = buckets.computeIfAbsent(recipientKey, unused -> new Bucket(now + properties.window().toMillis()));
        callerBucket.count++;
        recipientBucket.count++;
        global.count++;
    }

    private void check(Bucket bucket, int limit, long now) {
        if (bucket != null && bucket.count >= limit) {
            throw limited(bucket.expiresAt, now);
        }
    }

    private NotificationRateLimitException limited(long expiresAt, long now) {
        return new NotificationRateLimitException((expiresAt - now + 999) / 1000);
    }

    private static final class Bucket {
        private final long expiresAt;
        private int count;

        private Bucket(long expiresAt) {
            this.expiresAt = expiresAt;
        }
    }
}

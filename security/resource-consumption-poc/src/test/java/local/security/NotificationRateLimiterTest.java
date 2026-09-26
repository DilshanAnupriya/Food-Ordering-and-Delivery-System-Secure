package local.security;

import com.example.Notification.security.*;
import org.junit.jupiter.api.Test;
import java.time.*;
import java.util.concurrent.*;
import java.util.stream.IntStream;
import static org.junit.jupiter.api.Assertions.*;

class NotificationRateLimiterTest {
    private final MutableClock clock = new MutableClock();
    private NotificationRateLimiter limiter(int caller, int recipient, int global, int keys) {
        return new NotificationRateLimiter(new NotificationProtectionProperties(caller, recipient, global, keys, Duration.ofSeconds(60)), clock);
    }

    @Test void quotaExpiresAndRetryAfterIsRoundedUp() {
        var limiter = limiter(1, 1, 100, 100);
        limiter.acquire("a", "one@example.test");
        clock.now += 1;
        assertEquals(60, assertThrows(NotificationRateLimitException.class, () -> limiter.acquire("a", "one@example.test")).getRetryAfterSeconds());
        clock.now += 59999;
        assertDoesNotThrow(() -> limiter.acquire("a", "one@example.test"));
    }

    @Test void recipientsAreSharedAcrossCallersAndCaseNormalized() {
        var limiter = limiter(5, 1, 100, 100);
        limiter.acquire("a", "One@example.test");
        assertThrows(NotificationRateLimitException.class, () -> limiter.acquire("b", "one@example.test"));
        assertDoesNotThrow(() -> limiter.acquire("b", "two@example.test"));
    }

    @Test void changingRecipientDoesNotBypassCallerAndRejectedRequestsConsumeNoTokens() {
        var limiter = limiter(1, 1, 100, 100);
        limiter.acquire("a", "one@example.test");
        assertThrows(NotificationRateLimitException.class, () -> limiter.acquire("a", "two@example.test"));
        assertDoesNotThrow(() -> limiter.acquire("b", "two@example.test"));
    }

    @Test void globalQuotaAndTrackingCapacityFailClosedAndRecover() {
        var global = limiter(5, 5, 1, 100);
        global.acquire("a", "one@example.test");
        assertThrows(NotificationRateLimitException.class, () -> global.acquire("b", "two@example.test"));
        var bounded = limiter(5, 5, 100, 2);
        bounded.acquire("a", "one@example.test");
        assertThrows(NotificationRateLimitException.class, () -> bounded.acquire("b", "two@example.test"));
        clock.now += 60000;
        assertDoesNotThrow(() -> bounded.acquire("b", "two@example.test"));
    }

    @Test void concurrentRequestsCannotOverspendTheQuota() throws Exception {
        var limiter = limiter(5, 5, 100, 100);
        var ready = new CountDownLatch(20);
        var go = new CountDownLatch(1);
        var pool = Executors.newFixedThreadPool(20);
        try {
            var attempts = IntStream.range(0, 20).mapToObj(i -> pool.submit(() -> {
                ready.countDown(); go.await();
                try { limiter.acquire("a", "one@example.test"); return 1; }
                catch (NotificationRateLimitException blocked) { return 0; }
            })).toList();
            assertTrue(ready.await(5, TimeUnit.SECONDS)); go.countDown();
            int accepted = 0;
            for (var attempt : attempts) accepted += attempt.get(5, TimeUnit.SECONDS);
            assertEquals(5, accepted);
        } finally { pool.shutdownNow(); }
    }

    private static class MutableClock extends Clock {
        long now = Instant.parse("2026-09-26T00:00:00Z").toEpochMilli();
        public ZoneId getZone() { return ZoneOffset.UTC; }
        public Clock withZone(ZoneId zone) { return this; }
        public Instant instant() { return Instant.ofEpochMilli(now); }
    }
}

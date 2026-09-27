// SECURITY FIX: carry the server-calculated retry interval to the HTTP response.
package com.example.Notification.security;

public class NotificationRateLimitException extends RuntimeException {
    private final long retryAfterSeconds;

    public NotificationRateLimitException(long retryAfterSeconds) {
        super("Notification request limit exceeded. Retry later.");
        this.retryAfterSeconds = Math.max(1, retryAfterSeconds);
    }

    public long getRetryAfterSeconds() {
        return retryAfterSeconds;
    }
}

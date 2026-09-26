// SECURITY FIX: return HTTP 429 and Retry-After before an over-quota request can send mail.
package com.example.Notification.security;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice(basePackages = "com.example.Notification")
public class NotificationExceptionHandler {
    @ExceptionHandler(NotificationRateLimitException.class)
    public ResponseEntity<Map<String, String>> rateLimit(NotificationRateLimitException error) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .header(HttpHeaders.RETRY_AFTER, Long.toString(error.getRetryAfterSeconds()))
                .body(Map.of("error", "RATE_LIMIT_EXCEEDED", "message", error.getMessage()));
    }
}

// SECURITY FIX: validate configurable quotas; defaults allow five requests per caller/recipient per minute.
package com.example.Notification.security;

import jakarta.validation.constraints.Min;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;

@Validated
@ConfigurationProperties("notification.protection")
public record NotificationProtectionProperties(
        @DefaultValue("5") @Min(1) int callerLimit,
        @DefaultValue("5") @Min(1) int recipientLimit,
        @DefaultValue("100") @Min(1) int globalLimit,
        @DefaultValue("10000") @Min(2) int maxTrackedKeys,
        @DefaultValue("60s") Duration window) {
    public NotificationProtectionProperties {
        if (window == null || window.isNegative() || window.isZero() || window.toMillis() < 1) {
            throw new IllegalArgumentException("Notification rate window must be at least one millisecond");
        }
    }
}

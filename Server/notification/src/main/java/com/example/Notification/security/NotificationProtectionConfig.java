// SECURITY FIX: bind quotas and inject a clock so window expiry can be tested without sleeping.
package com.example.Notification.security;

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

@Configuration
@EnableConfigurationProperties(NotificationProtectionProperties.class)
public class NotificationProtectionConfig {
    @Bean
    @ConditionalOnMissingBean(Clock.class)
    Clock notificationClock() {
        return Clock.systemUTC();
    }
}

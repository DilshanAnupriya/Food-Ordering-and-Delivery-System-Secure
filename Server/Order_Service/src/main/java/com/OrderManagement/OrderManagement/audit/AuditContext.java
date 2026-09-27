package com.OrderManagement.OrderManagement.audit;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import java.util.UUID;

// AUDIT FIX: immutable, server-created context; never copy body userId or X-Auth-* headers.
public record AuditContext(String actorId, String identitySource, String requestId) {
    public static final String ATTRIBUTE = AuditContext.class.getName();

    public static AuditContext current() {
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes) {
            HttpServletRequest request = attributes.getRequest();
            if (request.getAttribute(ATTRIBUTE) instanceof AuditContext context) return context;
            return new AuditContext("UNVERIFIED", "UNVERIFIED", UUID.randomUUID().toString());
        }
        // Internal service calls have no HTTP caller; do not attribute them to an order owner.
        return new AuditContext("SYSTEM", "INTERNAL", UUID.randomUUID().toString());
    }
}

package com.OrderManagement.OrderManagement.audit;

import com.OrderManagement.OrderManagement.model.OrderStatus;
import jakarta.persistence.*;
import lombok.Getter;
import org.hibernate.annotations.Immutable;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "security_audit_events", indexes = {
        @Index(name = "idx_audit_order_time", columnList = "order_id,occurred_at"),
        @Index(name = "idx_audit_request", columnList = "request_id")})
@Immutable
@Getter
public class SecurityAuditEvent {
    @Id @Column(updatable = false, nullable = false, length = 36)
    private String eventId;
    @Column(name = "occurred_at", updatable = false, nullable = false)
    private Instant occurredAt;
    @Column(updatable = false, nullable = false, length = 128)
    private String actorId;
    @Column(updatable = false, nullable = false, length = 24)
    private String identitySource;
    @Column(name = "request_id", updatable = false, nullable = false, length = 36)
    private String requestId;
    @Enumerated(EnumType.STRING) @Column(updatable = false, nullable = false, length = 24)
    private Action action;
    // AUDIT FIX: scalar ID, deliberately NO foreign key or cascade to the deletable order.
    @Column(name = "order_id", updatable = false)
    private Long orderId;
    @Column(updatable = false, nullable = false, length = 16)
    private String outcome;
    @Column(updatable = false, nullable = false)
    private int httpStatus;
    @Column(updatable = false, nullable = false, length = 32)
    private String reasonCode;
    @Enumerated(EnumType.STRING) @Column(updatable = false, length = 24)
    private OrderStatus previousStatus;
    @Enumerated(EnumType.STRING) @Column(updatable = false, length = 24)
    private OrderStatus newStatus;

    public enum Action { CREATE_ORDER, UPDATE_ORDER, CHANGE_STATUS, DELETE_ORDER, READ_ORDER, ORDER_REQUEST }
    protected SecurityAuditEvent() { }

    SecurityAuditEvent(AuditContext context, Action action, Long orderId, String outcome,
                       int httpStatus, String reasonCode, OrderStatus previousStatus, OrderStatus newStatus) {
        eventId = UUID.randomUUID().toString();
        occurredAt = Instant.now();
        actorId = context.actorId(); identitySource = context.identitySource(); requestId = context.requestId();
        this.action = action; this.orderId = orderId; this.outcome = outcome;
        this.httpStatus = httpStatus; this.reasonCode = reasonCode;
        this.previousStatus = previousStatus; this.newStatus = newStatus;
    }
}

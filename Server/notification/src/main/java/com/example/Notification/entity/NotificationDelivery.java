// SECURITY FIX: persistent delivery claims; a unique event key prevents concurrent duplicate sends.
package com.example.Notification.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "notification_delivery")
@Getter
@Setter
@NoArgsConstructor
public class NotificationDelivery {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_key", nullable = false, unique = true, length = 64)
    private String eventKey;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private Status status;

    @Column(nullable = false)
    private Instant createdAt;

    public NotificationDelivery(String eventKey, Instant createdAt) {
        this.eventKey = eventKey;
        this.createdAt = createdAt;
        this.status = Status.PROCESSING;
    }

    public enum Status { PROCESSING, SENT }
}

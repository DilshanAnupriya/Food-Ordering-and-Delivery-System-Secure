package com.DeliveryOrder.DeliveryOrder.model;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "completed_deliveries")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CompletedDelivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false)
    private String orderId;

    @Column(name = "driver_id", nullable = false)
    private String driverId;

    @Column(nullable = false)
    private double latitude;

    @Column(nullable = false)
    private double longitude;

    @Column(name = "is_delivered", nullable = false)
    private boolean isDelivered;

    @Column(name = "completed_at", nullable = false)
    private LocalDateTime completedAt;
}
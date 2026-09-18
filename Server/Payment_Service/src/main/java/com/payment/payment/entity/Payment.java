package com.payment.payment.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userId;
    private Long orderId;
    private BigDecimal totalAmount;
    private String paymentStatus;
    private LocalDateTime paymentDate;

    // Constructor for successful payments
    public static Payment createSuccessfulPayment(String userId, Long orderId, BigDecimal totalAmount) {
        return Payment.builder()
                .userId(userId)
                .orderId(orderId)
                .totalAmount(totalAmount)
                .paymentStatus("SUCCESS")
                .paymentDate(LocalDateTime.now())
                .build();
    }
}

package com.example.Notification.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentConfirmationRequest {
    private String email;
    private String orderId;
    private double amount;
    private String paymentStatus;
}

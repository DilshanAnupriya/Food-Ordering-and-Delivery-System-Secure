package com.example.Notification.controller;

import com.example.Notification.dto.DriverConfirmationRequest;
import com.example.Notification.dto.PaymentConfirmationRequest;
import com.example.Notification.dto.RestaurantConfirmationRequest;
import com.example.Notification.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class NotificationController {
    
    private final EmailService emailService;    @PostMapping("/notifications/payment-confirmation")
    public ResponseEntity<?> sendPaymentConfirmation(
        @RequestBody PaymentConfirmationRequest request
    ) {
        emailService.sendPaymentConfirmationEmail(
            request.getEmail(),
            request.getOrderId(),
            request.getAmount(),
            request.getPaymentStatus()
        );
        return ResponseEntity.ok().build();
    }    @PostMapping("/notifications/order-confirmation")
    public ResponseEntity<?> sendOrderConfirmation(
        @RequestParam String email,
        @RequestParam String orderId,
        @RequestParam double totalAmount
    ) {
        emailService.sendOrderConfirmationEmail(
            email,
            orderId,
            totalAmount
        );
        return ResponseEntity.ok().build();
    }    @PostMapping("/notifications/restaurant-confirmation")
    public ResponseEntity<?> sendRestaurantConfirmation(
        @RequestBody RestaurantConfirmationRequest request
    ) {
        emailService.sendRestaurantConfirmationEmail(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/notifications/driver-status")
    public ResponseEntity<?> sendDriverStatusConfirmation(
        @RequestBody DriverConfirmationRequest request
    ) {
        emailService.sendDriverStatusConfirmationEmail(request);
        return ResponseEntity.ok().build();
    }
}

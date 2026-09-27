// ORIGINAL code retained for assignment review: direct sends had no quotas or deduplication.
// package com.example.Notification.controller;
//
// import com.example.Notification.dto.DriverConfirmationRequest;
// import com.example.Notification.dto.PaymentConfirmationRequest;
// import com.example.Notification.dto.RestaurantConfirmationRequest;
// import com.example.Notification.service.EmailService;
// import lombok.RequiredArgsConstructor;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;
//
// @RestController
// @RequestMapping("/api")
// @RequiredArgsConstructor
// public class NotificationController {
//
//     private final EmailService emailService;    @PostMapping("/notifications/payment-confirmation")
//     public ResponseEntity<?> sendPaymentConfirmation(
//         @RequestBody PaymentConfirmationRequest request
//     ) {
//         emailService.sendPaymentConfirmationEmail(
//             request.getEmail(),
//             request.getOrderId(),
//             request.getAmount(),
//             request.getPaymentStatus()
//         );
//         return ResponseEntity.ok().build();
//     }    @PostMapping("/notifications/order-confirmation")
//     public ResponseEntity<?> sendOrderConfirmation(
//         @RequestParam String email,
//         @RequestParam String orderId,
//         @RequestParam double totalAmount
//     ) {
//         emailService.sendOrderConfirmationEmail(
//             email,
//             orderId,
//             totalAmount
//         );
//         return ResponseEntity.ok().build();
//     }    @PostMapping("/notifications/restaurant-confirmation")
//     public ResponseEntity<?> sendRestaurantConfirmation(
//         @RequestBody RestaurantConfirmationRequest request
//     ) {
//         emailService.sendRestaurantConfirmationEmail(request);
//         return ResponseEntity.ok().build();
//     }
//
//     @PostMapping("/notifications/driver-status")
//     public ResponseEntity<?> sendDriverStatusConfirmation(
//         @RequestBody DriverConfirmationRequest request
//     ) {
//         emailService.sendDriverStatusConfirmationEmail(request);
//         return ResponseEntity.ok().build();
//     }
// }

package com.example.Notification.controller;

import com.example.Notification.dto.DriverConfirmationRequest;
import com.example.Notification.dto.PaymentConfirmationRequest;
import com.example.Notification.dto.RestaurantConfirmationRequest;
import com.example.Notification.service.EmailService;
import com.example.Notification.service.ProtectedNotificationService;
import com.example.Notification.service.ProtectedNotificationService.DeliveryResult;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.util.Map;

// FIX: every endpoint uses the shared service guard before triggering SMTP delivery.
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class NotificationController {
    private final EmailService emailService;
    private final ProtectedNotificationService protection;

    @PostMapping("/notifications/payment-confirmation")
    public ResponseEntity<?> sendPaymentConfirmation(
            @Valid @RequestBody PaymentConfirmationRequest request, HttpServletRequest caller) {
        return deliveryResponse(protection.deliver(caller, "payment", request.getOrderId(),
                request.getEmail(), request.getPaymentStatus(), () -> emailService.sendPaymentConfirmationEmail(
                        request.getEmail(), request.getOrderId(), request.getAmount(), request.getPaymentStatus())));
    }

    @PostMapping("/notifications/order-confirmation")
    public ResponseEntity<?> sendOrderConfirmation(
            @RequestParam @NotBlank @Email @Size(max = 254) String email,
            @RequestParam @NotBlank @Pattern(regexp = "[A-Za-z0-9][A-Za-z0-9._:-]{0,127}") String orderId,
            @RequestParam double totalAmount, HttpServletRequest caller) {
        validateAmount(totalAmount);
        return deliveryResponse(protection.deliver(caller, "order", orderId, email, "confirmed",
                () -> emailService.sendOrderConfirmationEmail(email, orderId, totalAmount)));
    }

    @PostMapping("/notifications/restaurant-confirmation")
    public ResponseEntity<?> sendRestaurantConfirmation(
            @Valid @RequestBody RestaurantConfirmationRequest request, HttpServletRequest caller) {
        return deliveryResponse(protection.deliver(caller, "restaurant", request.getRestaurantId(),
                request.getEmail(), "registered", () -> emailService.sendRestaurantConfirmationEmail(request)));
    }

    @PostMapping("/notifications/driver-status")
    public ResponseEntity<?> sendDriverStatusConfirmation(
            @Valid @RequestBody DriverConfirmationRequest request, HttpServletRequest caller) {
        return deliveryResponse(protection.deliver(caller, "driver", request.getDriverId(),
                request.getEmail(), request.getStatus(), () -> emailService.sendDriverStatusConfirmationEmail(request)));
    }

    public static void validateAmount(double amount) {
        if (!Double.isFinite(amount) || amount < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount must be finite and non-negative");
        }
    }

    public static ResponseEntity<?> deliveryResponse(DeliveryResult result) {
        // A concurrent request may find an SMTP send in progress. Do not claim it has completed.
        return ResponseEntity.status(result == DeliveryResult.PROCESSING ? 202 : 200)
                .body(Map.of("deliveryStatus", result.name()));
    }
}

// ORIGINAL code retained for assignment review: direct sends had no quotas or deduplication.
// package com.example.Notification.api;
//
//
//
// import com.example.Notification.service.EmailService;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.web.bind.annotation.*;
//
// @RestController
// @RequestMapping("/api/orders")
// public class OrderController {
//
//     @Autowired
//     private EmailService emailService;
//
//     @PostMapping("/confirm")
//     public String confirmOrder(@RequestParam String email, @RequestParam String orderId, @RequestParam double totalAmount) {
//         emailService.sendOrderConfirmationEmail(email, orderId, totalAmount);
//         return "Order confirmed and email sent successfully!";
//     }
// }

package com.example.Notification.api;

import com.example.Notification.controller.NotificationController;
import com.example.Notification.service.EmailService;
import com.example.Notification.service.ProtectedNotificationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// FIX: the legacy route shares both quotas and the same event key as the newer order route.
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final EmailService emailService;
    private final ProtectedNotificationService protection;

    @PostMapping("/confirm")
    public ResponseEntity<?> confirmOrder(
            @RequestParam @NotBlank @Email @Size(max = 254) String email,
            @RequestParam @NotBlank @Pattern(regexp = "[A-Za-z0-9][A-Za-z0-9._:-]{0,127}") String orderId,
            @RequestParam double totalAmount, HttpServletRequest caller) {
        NotificationController.validateAmount(totalAmount);
        return NotificationController.deliveryResponse(protection.deliver(caller, "order", orderId, email,
                "confirmed", () -> emailService.sendOrderConfirmationEmail(email, orderId, totalAmount)));
    }
}

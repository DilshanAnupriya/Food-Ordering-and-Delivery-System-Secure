package com.example.Notification.api;



import com.example.Notification.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/confirm")
    public String confirmOrder(@RequestParam String email, @RequestParam String orderId, @RequestParam double totalAmount) {
        emailService.sendOrderConfirmationEmail(email, orderId, totalAmount);
        return "Order confirmed and email sent successfully!";
    }
}
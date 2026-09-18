package com.example.Notification.service;

import com.example.Notification.dto.DriverConfirmationRequest;
import com.example.Notification.dto.RestaurantConfirmationRequest;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {
    
    private final JavaMailSender mailSender;
      public void sendDriverStatusConfirmationEmail(DriverConfirmationRequest request) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            
            helper.setTo(request.getEmail());
            helper.setSubject("Driver Application Status Update");
            
            String emailContent = String.format("""
                <html>
                <body style='font-family: Arial, sans-serif; padding: 20px;'>
                    <h2 style='color: #333;'>Driver Application Status Update</h2>
                    <div style='background-color: #f8f9fa; padding: 20px; border-radius: 5px;'>
                        <p>Dear %s,</p>
                        <p>Your driver application status has been updated.</p>
                        <div style='margin: 20px 0; padding: 15px; background-color: #fff; border-radius: 5px;'>
                            <p><strong>Driver ID:</strong> %s</p>
                            <p><strong>Status:</strong> %s</p>
                        </div>
                        <p>%s</p>
                        <p>If you have any questions, please contact our support team.</p>
                    </div>
                    <div style='margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;'>
                        <p style='color: #666; font-size: 12px;'>This is an automated message, please do not reply.</p>
                    </div>
                </body>
                </html>
                """,
                request.getDriverName(),
                request.getDriverId(),
                request.getStatus(),
                request.getStatus().equals("APPROVED") ? 
                    "Congratulations! You have been approved as a driver. You can now start accepting delivery requests." :
                    "Thank you for your interest. Unfortunately, we cannot approve your application at this time."
            );
            
            helper.setText(emailContent, true);
            mailSender.send(message);
            
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send driver status confirmation email", e);
        }
    }

    public void sendRestaurantConfirmationEmail(RestaurantConfirmationRequest request) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            
            helper.setTo(request.getEmail());
            helper.setSubject("Restaurant Registration Confirmation - " + request.getRestaurantName());
            
            String emailContent = String.format("""
                <html>
                <body style='font-family: Arial, sans-serif; padding: 20px;'>
                    <h2 style='color: #333;'>Restaurant Registration Confirmation</h2>
                    <div style='background-color: #f8f9fa; padding: 20px; border-radius: 5px;'>
                        <p>Dear Restaurant Owner,</p>
                        <p>Your restaurant has been successfully registered on our platform!</p>
                        <div style='margin: 20px 0; padding: 15px; background-color: #fff; border-radius: 5px;'>
                            <p><strong>Restaurant Name:</strong> %s</p>
                            <p><strong>Restaurant ID:</strong> %s</p>
                            <p><strong>Type:</strong> %s</p>
                            <p><strong>Address:</strong> %s</p>
                            <p><strong>City:</strong> %s</p>
                            <p><strong>Phone:</strong> %s</p>
                            <p><strong>Operating Hours:</strong> %s - %s</p>
                        </div>
                        <p>You can now start managing your restaurant through our platform.</p>
                        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                    </div>
                    <div style='margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;'>
                        <p style='color: #666; font-size: 12px;'>This is an automated message, please do not reply.</p>
                    </div>
                </body>
                </html>
                """,
                request.getRestaurantName(),
                request.getRestaurantId(),
                request.getRestaurantType(),
                request.getAddress(),
                request.getCity(),
                request.getPhone(),
                request.getOpeningTime(),
                request.getClosingTime()
            );
            
            helper.setText(emailContent, true);
            mailSender.send(message);
            
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send restaurant confirmation email", e);
        }
    }    public void sendPaymentConfirmationEmail(String email, String orderId, double amount, String paymentStatus) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(email);
            helper.setSubject("Payment Confirmation - Order #" + orderId);
            
            String emailContent = String.format("""
                <html>
                <body style='font-family: Arial, sans-serif; padding: 20px;'>
                    <h2 style='color: #333;'>Payment Confirmation</h2>
                    <div style='background-color: #f8f9fa; padding: 20px; border-radius: 5px;'>
                        <p>Dear Customer,</p>
                        <p>Your payment has been successfully processed.</p>
                        <div style='margin: 20px 0; padding: 15px; background-color: #fff; border-radius: 5px;'>
                            <p><strong>Order ID:</strong> %s</p>
                            <p><strong>Amount Paid:</strong> $%.2f</p>
                            <p><strong>Status:</strong> %s</p>
                        </div>
                        <p>Thank you for your purchase!</p>
                        <p>If you have any questions, please don't hesitate to contact our support team.</p>
                    </div>
                    <div style='margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;'>
                        <p style='color: #666; font-size: 12px;'>This is an automated message, please do not reply.</p>
                    </div>
                </body>
                </html>
                """, orderId, amount, paymentStatus);
            
            helper.setText(emailContent, true);
            mailSender.send(message);
            
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send payment confirmation email", e);
        }
    }
    
    public void sendOrderConfirmationEmail(String email, String orderId, double amount) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            
            helper.setTo(email);
            helper.setSubject("Order Confirmation - Order #" + orderId);
            
            String emailContent = String.format("""
                <html>
                <body style='font-family: Arial, sans-serif; padding: 20px;'>
                    <h2 style='color: #333;'>Order Confirmation</h2>
                    <div style='background-color: #f8f9fa; padding: 20px; border-radius: 5px;'>
                        <p>Dear Customer,</p>
                        <p>Thank you for your order! We're pleased to confirm that your order has been received.</p>
                        <div style='margin: 20px 0; padding: 15px; background-color: #fff; border-radius: 5px;'>
                            <p><strong>Order ID:</strong> %s</p>
                            <p><strong>Total Amount:</strong> $%.2f</p>
                            <p><strong>Status:</strong> Order Received</p>
                        </div>
                        <p>We'll send you another email once your payment is confirmed.</p>
                        <p>If you have any questions about your order, please contact our support team.</p>
                    </div>
                    <div style='margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;'>
                        <p style='color: #666; font-size: 12px;'>This is an automated message, please do not reply.</p>
                    </div>
                </body>
                </html>
                """, orderId, amount);
            
            helper.setText(emailContent, true);
            mailSender.send(message);
            
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send order confirmation email", e);
        }
    }
  }

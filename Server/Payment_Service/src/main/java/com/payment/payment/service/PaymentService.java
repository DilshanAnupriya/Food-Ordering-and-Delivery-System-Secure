package com.payment.payment.service;






import com.payment.payment.entity.Payment;
import com.payment.payment.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository repo;

    public Payment saveSuccessfulPayment(String userId, Long orderId, BigDecimal totalAmount) {
        Payment payment = Payment.createSuccessfulPayment(userId, orderId, totalAmount);
        return repo.save(payment);
    }

    public List<Payment> getAllPayments() {
        return repo.findAll();
    }

    public Payment getPaymentById(Long id) {
        return repo.findById(id).orElse(null);
    }

    public Payment savePayment(Payment payment) {
        return repo.save(payment);
    }

    public void deletePayment(Long id) {
        repo.deleteById(id);
    }
}

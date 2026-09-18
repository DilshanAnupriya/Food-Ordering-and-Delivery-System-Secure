package com.payment.payment.repository;


import com.payment.payment.entity.Payment;
// Ensure the 'Payment' class exists in 'com.payment.payment.entity' package.
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
}
package com.payment.payment.controller;


import com.payment.payment.entity.Payment;
import com.payment.payment.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    @Autowired
    private PaymentService service;

    @GetMapping
    public List<Payment> getAll() {
        return service.getAllPayments();
    }

    @GetMapping("/{id}")
    public Payment getById(@PathVariable Long id) {
        return service.getPaymentById(id);
    }

    @PostMapping
    public Payment create(@RequestBody Payment payment) {
        return service.savePayment(payment);
    }

    @PutMapping("/{id}")
    public Payment update(@PathVariable Long id, @RequestBody Payment payment) {
        payment.setId(id);
        return service.savePayment(payment);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deletePayment(id);
    }

}
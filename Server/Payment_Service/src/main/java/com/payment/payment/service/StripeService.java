package com.payment.payment.service;

import com.payment.payment.dto.ProductRequest; // Ensure the ProductRequest class exists under this package level
import com.payment.payment.dto.StripeResponse;
import com.payment.payment.service.PaymentService;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@Slf4j
public class StripeService {

    @Autowired
    private PaymentService paymentService;

    @Value("${stripe.secretKey}")
    private String secretKey;

    public StripeResponse checkoutProducts(ProductRequest productRequest) {
        Stripe.apiKey = secretKey;

        try {
            // Create price data
            SessionCreateParams.LineItem.PriceData priceData = SessionCreateParams.LineItem.PriceData.builder()
                    .setCurrency(productRequest.getCurrency() != null ? productRequest.getCurrency() : "USD")
                    .setUnitAmount(productRequest.getAmount())
                    .setProductData(
                            SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                    .setName(productRequest.getName())
                                    .build()
                    )
                    .build();

            // Create line item
            SessionCreateParams.LineItem lineItem = SessionCreateParams.LineItem.builder()
                    .setQuantity(1L)
                    .setPriceData(priceData)
                    .build();

            // Create session
            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl("http://localhost:5173/order-confirmation")
                    .setCancelUrl("http://localhost:5173/orders")
                    .addLineItem(lineItem)
                    .build();

            Session session = Session.create(params);

            // Save successful payment to database
            paymentService.saveSuccessfulPayment(
                String.valueOf(productRequest.getUserId()),
                productRequest.getOrderId(),
                BigDecimal.valueOf(productRequest.getAmount() / 100.0)
            );

            log.info("Payment saved successfully for order: {}", productRequest.getOrderId());

            return StripeResponse.builder()
                    .status("SUCCESS")
                    .message("Payment processed successfully")
                    .sessionId(session.getId())
                    .sessionUrl(session.getUrl())
                    .build();

        } catch (StripeException e) {
            log.error("Stripe payment failed", e);
            return StripeResponse.builder()
                    .status("FAILED")
                    .message("Payment failed: " + e.getMessage())
                    .build();
        }
    }
}

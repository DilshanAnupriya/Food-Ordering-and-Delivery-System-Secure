package com.example.Notification.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentConfirmationRequest {
    // ORIGINAL (unvalidated): private String email;
    // FIX: constrain inputs before notification work and event-key calculation.
    @NotBlank @Email @Size(max = 254)
    private String email;
    // ORIGINAL (unvalidated): private String orderId;
    // FIX: constrain inputs before notification work and event-key calculation.
    @NotBlank @Pattern(regexp = "[A-Za-z0-9][A-Za-z0-9._:-]{0,127}")
    private String orderId;
    // ORIGINAL (unvalidated): private double amount;
    // FIX: constrain inputs before notification work and event-key calculation.
    @PositiveOrZero
    private double amount;
    // ORIGINAL (unvalidated): private String paymentStatus;
    // FIX: constrain inputs before notification work and event-key calculation.
    @NotBlank @Pattern(regexp = "SUCCESS|PAID|FAILED|PENDING")
    private String paymentStatus;
    // FIX: reject non-finite JSON amounts even if a JSON parser accepts them.
    @AssertTrue(message = "Amount must be finite")
    public boolean isAmountFinite() { return Double.isFinite(amount); }
}

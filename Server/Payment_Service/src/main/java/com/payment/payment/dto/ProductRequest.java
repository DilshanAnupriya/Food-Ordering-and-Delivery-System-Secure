package com.payment.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductRequest {

    @NotNull(message = "User ID cannot be null")
    private Long userId;

    @NotNull(message = "Order ID cannot be null")
    private Long orderId;

    @NotNull(message = "Amount cannot be null")
    @Positive(message = "Amount must be greater than zero")
    private Long amount;

    @NotNull(message = "Quantity cannot be null")
    @Positive(message = "Quantity must be positive")
    private Long quantity;

    @NotBlank(message = "Product name cannot be blank")
    private String name;

    private String currency;
}


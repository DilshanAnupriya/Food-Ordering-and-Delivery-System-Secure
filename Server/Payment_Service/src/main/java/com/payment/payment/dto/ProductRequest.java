package com.payment.payment.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductRequest {

    private Long userId;
    private Long orderId;
    private Long amount;
    private Long quantity;
    private String name;
    private String currency;


}

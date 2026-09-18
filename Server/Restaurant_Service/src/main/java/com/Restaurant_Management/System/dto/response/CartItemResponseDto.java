package com.Restaurant_Management.System.dto.response;

import lombok.*;

@Data
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CartItemResponseDto {

    private String foodItemId;
    private String foodName;
    private String foodImage;
    private String restaurantId;
    private String restaurantName;
    private int quantity;
    private double price;
}

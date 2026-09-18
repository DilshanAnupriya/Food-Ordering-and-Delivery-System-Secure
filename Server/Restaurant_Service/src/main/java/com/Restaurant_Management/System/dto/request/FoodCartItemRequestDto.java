package com.Restaurant_Management.System.dto.request;

import lombok.*;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class FoodCartItemRequestDto {
    private String foodItemId;
    private String foodName;
    private String foodImage;
    private String restaurantId;
    private String restaurantName;
    private double price;
    private int quantity;
}

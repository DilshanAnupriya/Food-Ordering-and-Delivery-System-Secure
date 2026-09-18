package com.Restaurant_Management.System.dto.response;


import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Data
@Getter
@Setter
@Builder
public class FoodItemResponseDto {

    private String foodItemId;
    private String name;
    private String type;
    private String category;
    private double price;
    private int discount;
    private String imageUrl;
    private String description;
    private boolean available;
    private String restaurantId;
    private String restaurantName;
    private LocalDateTime createdAt;
}

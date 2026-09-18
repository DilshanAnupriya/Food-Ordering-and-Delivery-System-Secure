package com.Restaurant_Management.System.dto.request;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class FoodItemsRequestDto {

    private String name;
    private String type;
    private String category;
    private double price;
    private int discount;
    private String imageUrl;
    private String description;
    private boolean available;
    private String restaurantId;



}

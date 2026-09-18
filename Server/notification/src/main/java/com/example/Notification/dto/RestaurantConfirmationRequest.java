package com.example.Notification.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RestaurantConfirmationRequest {
    private String email;
    private String restaurantName;
    private String restaurantId;
    private String restaurantType;
    private String address;
    private String city;
    private String phone;
    private String openingTime;
    private String closingTime;
}

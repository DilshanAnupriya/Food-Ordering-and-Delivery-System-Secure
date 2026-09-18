package com.Restaurant_Management.System.dto.request;


import lombok.*;

import java.time.LocalTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class RestaurantRequestDto {

    private String restaurantName;
    private String restaurantAddress;
    private String restaurantPhone;
    private String restaurantEmail;
    private String restaurantType;
    private String city;
    private Double latitude;
    private Double longitude;
    private boolean availability;
    private boolean orderAvailability;
    private double rating;
    private LocalTime openingTime;
    private LocalTime closingTime;
    private String description;
    private String imageUrl;
    private String coverImageUrl;
    private String owner_username;
    private boolean active;

}

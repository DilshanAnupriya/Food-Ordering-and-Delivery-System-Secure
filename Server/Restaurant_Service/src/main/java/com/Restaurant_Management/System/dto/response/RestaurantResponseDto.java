package com.Restaurant_Management.System.dto.response;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Getter
@Setter
@Builder
public class RestaurantResponseDto {

    private String restaurantId;
    private String restaurantName;
    private String restaurantAddress;
    private String restaurantPhone;
    private String restaurantEmail;
    private String restaurantType;
    private String city;
    private boolean availability;
    private boolean orderAvailability;
    private double rating;
    private LocalTime openingTime;
    private LocalTime closingTime;
    private String description;
    private boolean active;
    private String imageUrl;
    private String coverImageUrl;
    private String owner_username;
    private Double latitude;
    private Double longitude;
    private LocalDateTime updatedAt;
    private LocalDateTime createdAt;
}

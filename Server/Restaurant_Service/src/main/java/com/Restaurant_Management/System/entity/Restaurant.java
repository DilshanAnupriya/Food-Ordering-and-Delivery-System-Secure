package com.Restaurant_Management.System.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Date;
import java.util.Set;

@Entity(name = "restaurant")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class Restaurant {



    @Id
    private String restaurantId;

    @Column(name="restaurant_name", nullable = false,unique = true)
    private String restaurantName;

    @Column( nullable = false)
    private String restaurantAddress;

    @Column( nullable = false,length = 11)
    private String restaurantPhone;

    @Column( nullable = false,unique = true)
    private String restaurantEmail;

    @Column( nullable = false)
    private String restaurantType;

    @Column( nullable = false)
    private String city;

    @Column( nullable = false)
    private Double latitude;

    @Column( nullable = false)
    private Double longitude;

    @Column( nullable = false)
    private boolean availability;

    @Column( nullable = false)
    private boolean orderAvailability;


    private LocalDateTime createdAt;

    @Column( nullable = false)
    private double rating;

    @Column( nullable = false)
    @JsonFormat(pattern = "HH:mm")
    private LocalTime openingTime;

    @Column( nullable = false)
    @JsonFormat(pattern = "HH:mm")
    private LocalTime closingTime;


    @Column( nullable = false,length = 1000)
    private String description;

    @Column( nullable = false)
    private boolean active;

    @Column( nullable = false)
    private String imageUrl;

    private String coverImageUrl;

    private String owner_username;

    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "restaurant",cascade = CascadeType.ALL, fetch = FetchType.LAZY,orphanRemoval = true)
    private Set<FoodItem> foodItems;


}

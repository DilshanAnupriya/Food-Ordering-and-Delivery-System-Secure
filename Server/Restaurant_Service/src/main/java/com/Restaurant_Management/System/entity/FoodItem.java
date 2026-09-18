package com.Restaurant_Management.System.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity(name = "food_items")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class FoodItem {



    @Id
    private String foodItemId;

    @Column(name = "items_name", nullable = false)
    private String name;

    private String type;
    private String category;
    private double price;
    private int discount;
    private String imageUrl;
    private String description;
    private boolean available;
    private LocalDateTime createdAt;
    private String restaurantName;


    @ManyToOne
    @JoinColumn(name = "restaurant_id",nullable = false)
    private Restaurant restaurant;





}

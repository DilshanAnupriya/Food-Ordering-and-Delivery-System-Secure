package com.Restaurant_Management.System.entity;


import jakarta.persistence.Entity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity(name = "cart")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class Cart {

    @Id
    private String cartId;

    private String userId;


    @OneToMany(mappedBy = "foodCart", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CartItems> cartItems;

    private double totalPrice;
    private LocalDateTime createdAt;


}

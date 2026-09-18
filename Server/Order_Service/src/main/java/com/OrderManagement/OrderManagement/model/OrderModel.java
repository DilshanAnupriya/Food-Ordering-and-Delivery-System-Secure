package com.OrderManagement.OrderManagement.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;


@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    @NotNull(message = "User ID cannot be null")
    private String userId;

    @NotNull(message = "Restaurant ID cannot be null")
    private String restaurantId;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    private LocalDateTime orderDate;
    private LocalDateTime lastUpdated;

    @NotNull(message = "Delivery address cannot be null")
    private String deliveryAddress;

    // New geolocation fields
    private Double latitude;
    private Double longitude;

    @NotNull(message = "Contact phone cannot be null")
    private String contactPhone;

    @Positive(message = "Subtotal must be positive")
    private BigDecimal subtotal;

    @Positive(message = "Delivery fee must be positive")
    private BigDecimal deliveryFee;

    @Positive(message = "Tax must be positive")
    private BigDecimal tax;

    @Positive(message = "Total amount must be positive")
    private BigDecimal totalAmount;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "order_id")
    private List<OrderItem> orderItems;
}
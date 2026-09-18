package com.OrderManagement.OrderManagement.controller;

import com.OrderManagement.OrderManagement.model.OrderModel;
import com.OrderManagement.OrderManagement.model.OrderStatus;
import com.OrderManagement.OrderManagement.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // Get all orders with pagination
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "orderDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort.Direction sortDirection = direction.equalsIgnoreCase("asc") ?
                Sort.Direction.ASC : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        Page<OrderModel> orders = orderService.getOrdersPaginated(pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("orders", orders.getContent());
        response.put("currentPage", orders.getNumber());
        response.put("totalItems", orders.getTotalElements());
        response.put("totalPages", orders.getTotalPages());

        return ResponseEntity.ok(response);
    }

    // Get orders by user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderModel>> getOrdersByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(orderService.getOrdersByUserId(userId));
    }
    @GetMapping("restaurant/{restaurantId}")
    public ResponseEntity<List<OrderModel>> getOrdersByRestaurantId(@PathVariable String restaurantId) {
        return ResponseEntity.ok(orderService.getOrdersByRestaurantId(restaurantId));
    }

    // Get order by ID
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderModel> getOrderById(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderById(orderId));
    }

    // Create new order
    @PostMapping
    public ResponseEntity<OrderModel> createOrder(@Valid @RequestBody OrderModel order) {
        OrderModel createdOrder = orderService.createOrder(order);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
    }

    // Update order
    @PutMapping("/{orderId}")
    public ResponseEntity<OrderModel> updateOrder(@PathVariable Long orderId,
                                                  @Valid @RequestBody OrderModel order) {
        return ResponseEntity.ok(orderService.updateOrder(orderId, order));
    }

    // Update order status
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<OrderModel> updateOrderStatus(@PathVariable Long orderId,
                                                        @RequestBody Map<String, String> statusRequest) {
        if (!statusRequest.containsKey("status")) {
            return ResponseEntity.badRequest().build();
        }

        try {
            OrderStatus status = OrderStatus.valueOf(statusRequest.get("status").toUpperCase());
            OrderModel updatedOrder = orderService.updateOrderStatus(orderId, status);
            return ResponseEntity.ok(updatedOrder);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Track order status
    @GetMapping("/{orderId}/track")
    public ResponseEntity<Map<String, String>> trackOrderStatus(@PathVariable Long orderId) {
        String statusInfo = orderService.trackOrderStatus(orderId);
        Map<String, String> response = new HashMap<>();
        response.put("statusInfo", statusInfo);
        return ResponseEntity.ok(response);
    }

    // Delete order
    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long orderId) {
        orderService.deleteOrder(orderId);
        return ResponseEntity.noContent().build();
    }
}
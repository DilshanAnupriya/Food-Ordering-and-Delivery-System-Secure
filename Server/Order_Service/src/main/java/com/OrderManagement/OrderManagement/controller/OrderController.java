package com.OrderManagement.OrderManagement.controller;

import com.OrderManagement.OrderManagement.exception.OrderException;
import com.OrderManagement.OrderManagement.model.OrderModel;
import com.OrderManagement.OrderManagement.model.OrderStatus;
import com.OrderManagement.OrderManagement.service.OrderService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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

    // ORIGINAL parameters (kept for the assignment's before/after comparison):
    // @RequestParam(defaultValue = "0") int page,
    // @RequestParam(defaultValue = "10") int size,
    // FIX: reject negative pages and sizes outside 1..100 before building a query.
    // Get all orders with pagination
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllOrders(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(OrderService.MAX_PAGE_SIZE) int size,
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
    public ResponseEntity<OrderModel> getOrderById(@PathVariable Long orderId,
                                                   @RequestHeader(value = "X-Auth-User-Id", required = false) String callerUserId,
                                                   @RequestHeader(value = "X-Auth-Roles", required = false) String callerRoles) {
        // Fix for V-BrokenAccess/IDOR Test 1 (read another user's order):
        // enforce object-level authorization before returning the order.
        OrderModel order = orderService.getOrderById(orderId);
        assertOwnerOrPrivileged(order, callerUserId, callerRoles);
        return ResponseEntity.ok(order);
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
                                                  @Valid @RequestBody OrderModel order,
                                                  @RequestHeader(value = "X-Auth-User-Id", required = false) String callerUserId,
                                                  @RequestHeader(value = "X-Auth-Roles", required = false) String callerRoles) {
        assertCanModify(orderId, callerUserId, callerRoles);
        return ResponseEntity.ok(orderService.updateOrder(orderId, order));
    }

    // Update order status
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<OrderModel> updateOrderStatus(@PathVariable Long orderId,
                                                        @RequestBody Map<String, String> statusRequest,
                                                        @RequestHeader(value = "X-Auth-User-Id", required = false) String callerUserId,
                                                        @RequestHeader(value = "X-Auth-Roles", required = false) String callerRoles) {
        // ORIGINAL: if (!statusRequest.containsKey("status")) {
        // AUDIT FIX: null/blank values must also reach the audited exception handler.
        if (statusRequest.get("status") == null || statusRequest.get("status").isBlank()) {
            // ORIGINAL: return ResponseEntity.badRequest().build();
            throw new OrderException("Status is required", HttpStatus.BAD_REQUEST);
        }

        assertCanModify(orderId, callerUserId, callerRoles);

        try {
            // ORIGINAL: OrderStatus status = OrderStatus.valueOf(statusRequest.get("status").toUpperCase());
            // AUDIT FIX: parse consistently regardless of the server locale.
            OrderStatus status = OrderStatus.valueOf(statusRequest.get("status").toUpperCase(java.util.Locale.ROOT));
            OrderModel updatedOrder = orderService.updateOrderStatus(orderId, status);
            return ResponseEntity.ok(updatedOrder);
        } catch (IllegalArgumentException e) {
            // ORIGINAL: return ResponseEntity.badRequest().build();
            // AUDIT FIX: retain HTTP 400 and record invalid enum values through the common handler.
            throw new OrderException("Invalid order status", HttpStatus.BAD_REQUEST);
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
    public ResponseEntity<Void> deleteOrder(@PathVariable Long orderId,
                                            @RequestHeader(value = "X-Auth-User-Id", required = false) String callerUserId,
                                            @RequestHeader(value = "X-Auth-Roles", required = false) String callerRoles) {
        assertCanModify(orderId, callerUserId, callerRoles);
        orderService.deleteOrder(orderId);
        return ResponseEntity.noContent().build();
    }


    /**
     * Object-level authorization guard for order modifications
     * (fix for V-BrokenAccess/IDOR Test 2).
     *
     * The caller identity (userId) and roles are taken from headers that the API
     * Gateway derives from the validated JWT - never from the request body or a
     * path variable, and the gateway overwrites any client-supplied values.
     *
     * A modification is permitted only when the caller either owns the order or
     * holds a privileged role (admin / restaurant owner / delivery person).
     * A regular customer attempting to modify someone else's order gets 403.
     */
    private void assertCanModify(Long orderId, String callerUserId, String callerRoles) {
        OrderModel order = orderService.getOrderById(orderId); // 404 if it does not exist
        assertOwnerOrPrivileged(order, callerUserId, callerRoles);
    }

    /**
     * Core object-level authorization check, shared by read and write endpoints.
     * A caller may access an order only if they own it (their userId matches the
     * order's userId) or hold a privileged role (admin / restaurant owner /
     * delivery person). Otherwise a 403 is returned.
     */
    private void assertOwnerOrPrivileged(OrderModel order, String callerUserId, String callerRoles) {
        boolean privileged = callerRoles != null && (
                callerRoles.contains("ROLE_ADMIN")
                        || callerRoles.contains("ROLE_RESTAURANT_OWNER")
                        || callerRoles.contains("ROLE_DELIVERY_PERSON"));

        boolean owner = callerUserId != null
                && !callerUserId.isEmpty()
                && callerUserId.equals(order.getUserId());

        if (!privileged && !owner) {
            throw new OrderException("You are not authorized to access this order", HttpStatus.FORBIDDEN);
        }
    }
}


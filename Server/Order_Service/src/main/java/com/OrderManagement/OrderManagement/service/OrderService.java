package com.OrderManagement.OrderManagement.service;

import com.OrderManagement.OrderManagement.exception.OrderException;
import com.OrderManagement.OrderManagement.model.OrderItem;
import com.OrderManagement.OrderManagement.model.OrderModel;
import com.OrderManagement.OrderManagement.model.OrderStatus;
import com.OrderManagement.OrderManagement.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    public List<OrderModel> getAllOrders() {
        return orderRepository.findAll();
    }

    public Page<OrderModel> getOrdersPaginated(Pageable pageable) {
        return orderRepository.findAll(pageable);
    }

    public List<OrderModel> getOrdersByUserId(String userId) {
        if (userId == null) {
            throw new OrderException("User ID cannot be null", HttpStatus.BAD_REQUEST);
        }
        return orderRepository.findByUserId(userId);
    }

    public List<OrderModel> getOrdersByRestaurantId(String restaurantId) {
        if (restaurantId == null) {
            throw new OrderException("restaurant ID cannot be null", HttpStatus.BAD_REQUEST);
        }
        return orderRepository.findByRestaurantId(restaurantId);
    }

    public OrderModel getOrderById(Long orderId) {
        if (orderId == null) {
            throw new OrderException("Order ID cannot be null", HttpStatus.BAD_REQUEST);
        }
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderException("Order not found with ID: " + orderId, HttpStatus.NOT_FOUND));
    }

    @Transactional
    public OrderModel createOrder(OrderModel order) {
        validateOrder(order);

        // Set initial values
        order.setOrderDate(LocalDateTime.now());
        order.setLastUpdated(LocalDateTime.now());
        order.setStatus(OrderStatus.PLACED);

        // Recalculate totals to ensure consistency
        calculateOrderTotals(order);

        return orderRepository.save(order);
    }

    private void calculateOrderTotals(OrderModel order) {
        // Calculate subtotal from items
        BigDecimal subtotal = order.getOrderItems().stream()
                .map(OrderItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        order.setSubtotal(subtotal);

        // Ensure other values are present
        if (order.getDeliveryFee() == null) {
            order.setDeliveryFee(BigDecimal.ZERO);
        }

        if (order.getTax() == null) {
            order.setTax(BigDecimal.ZERO);
        }

        // Calculate total
        BigDecimal total = subtotal
                .add(order.getDeliveryFee())
                .add(order.getTax());

        order.setTotalAmount(total);
    }

    private void validateOrder(OrderModel order) {
        if (order == null) {
            throw new OrderException("Order cannot be null", HttpStatus.BAD_REQUEST);
        }

        if (order.getUserId() == null) {
            throw new OrderException("User ID cannot be null", HttpStatus.BAD_REQUEST);
        }

        if (order.getRestaurantId() == null) {
            throw new OrderException("Restaurant ID cannot be null", HttpStatus.BAD_REQUEST);
        }

        if (order.getOrderItems() == null || order.getOrderItems().isEmpty()) {
            throw new OrderException("Order must contain at least one item", HttpStatus.BAD_REQUEST);
        }

        if (order.getDeliveryAddress() == null || order.getDeliveryAddress().trim().isEmpty()) {
            throw new OrderException("Delivery address cannot be empty", HttpStatus.BAD_REQUEST);
        }

        // Validate coordinates if provided
        if ((order.getLatitude() != null && order.getLongitude() == null) ||
                (order.getLatitude() == null && order.getLongitude() != null)) {
            throw new OrderException("Both latitude and longitude must be provided or none", HttpStatus.BAD_REQUEST);
        }

        if (order.getContactPhone() == null || order.getContactPhone().trim().isEmpty()) {
            throw new OrderException("Contact phone cannot be empty", HttpStatus.BAD_REQUEST);
        }
    }

    @Transactional
    public OrderModel updateOrder(Long orderId, OrderModel updatedOrder) {
        if (orderId == null) {
            throw new OrderException("Order ID cannot be null", HttpStatus.BAD_REQUEST);
        }

        OrderModel existingOrder = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderException("Order not found with ID: " + orderId, HttpStatus.NOT_FOUND));

        // Check if order is in a terminal state
        if ((existingOrder.getStatus() == OrderStatus.DELIVERED || existingOrder.getStatus() == OrderStatus.CANCELLED)
                && existingOrder.getStatus() != updatedOrder.getStatus()) {
            throw new OrderException("Cannot update order that is already " + existingOrder.getStatus(),
                    HttpStatus.BAD_REQUEST);
        }

        // Update fields
        if (updatedOrder.getUserId() != null) {
            existingOrder.setUserId(updatedOrder.getUserId());
        }

        if (updatedOrder.getRestaurantId() != null) {
            existingOrder.setRestaurantId(updatedOrder.getRestaurantId());
        }

        if (updatedOrder.getDeliveryAddress() != null) {
            existingOrder.setDeliveryAddress(updatedOrder.getDeliveryAddress());
        }

        // Update geolocation fields
        if (updatedOrder.getLongitude() != null) {
            existingOrder.setLongitude(updatedOrder.getLongitude());
        }

        if (updatedOrder.getLatitude() != null) {
            existingOrder.setLatitude(updatedOrder.getLatitude());
        }

        if (updatedOrder.getContactPhone() != null) {
            existingOrder.setContactPhone(updatedOrder.getContactPhone());
        }

        // Allow status updates if valid
        if (updatedOrder.getStatus() != null && existingOrder.getStatus() != updatedOrder.getStatus()) {
            validateStatusTransition(existingOrder.getStatus(), updatedOrder.getStatus());
            existingOrder.setStatus(updatedOrder.getStatus());
        }

        // Handle order items properly to avoid orphan removal issues
        if (updatedOrder.getOrderItems() != null && !updatedOrder.getOrderItems().isEmpty()) {
            // Create a map of existing items by ID for quick lookup
            Map<Long, OrderItem> existingItemsMap = existingOrder.getOrderItems().stream()
                    .filter(item -> item.getId() != null)
                    .collect(Collectors.toMap(OrderItem::getId, item -> item));

            // Create a new list to hold the updated order items
            List<OrderItem> updatedItems = new ArrayList<>();

            for (OrderItem updatedItem : updatedOrder.getOrderItems()) {
                if (updatedItem.getId() != null && existingItemsMap.containsKey(updatedItem.getId())) {
                    // Update existing item
                    OrderItem existingItem = existingItemsMap.get(updatedItem.getId());
                    existingItem.setMenuItemId(updatedItem.getMenuItemId());
                    existingItem.setItemName(updatedItem.getItemName());
                    existingItem.setQuantity(updatedItem.getQuantity());
                    existingItem.setUnitPrice(updatedItem.getUnitPrice());
                    existingItem.setTotalPrice(updatedItem.getTotalPrice());
                    updatedItems.add(existingItem);
                } else {
                    // Add new item
                    updatedItem.setOrder(existingOrder);
                    updatedItems.add(updatedItem);
                }
            }

            // Clear and set new items to avoid orphan removal issues
            existingOrder.getOrderItems().clear();
            existingOrder.getOrderItems().addAll(updatedItems);

            calculateOrderTotals(existingOrder);
        }

        existingOrder.setLastUpdated(LocalDateTime.now());
        return orderRepository.save(existingOrder);
    }

    @Transactional
    public boolean deleteOrder(Long orderId) {
        if (orderId == null) {
            throw new OrderException("Order ID cannot be null", HttpStatus.BAD_REQUEST);
        }

        OrderModel order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderException("Order not found with ID: " + orderId, HttpStatus.NOT_FOUND));

        // Only allow deletion if order is in PLACED or CANCELLED status
        if (order.getStatus() != OrderStatus.PLACED && order.getStatus() != OrderStatus.CANCELLED) {
            throw new OrderException("Cannot delete order that is already " + order.getStatus(),
                    HttpStatus.BAD_REQUEST);
        }

        orderRepository.deleteById(orderId);
        return true;
    }

    @Transactional
    public OrderModel updateOrderStatus(Long orderId, OrderStatus status) {
        if (orderId == null) {
            throw new OrderException("Order ID cannot be null", HttpStatus.BAD_REQUEST);
        }

        if (status == null) {
            throw new OrderException("Status cannot be null", HttpStatus.BAD_REQUEST);
        }

        OrderModel existingOrder = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderException("Order not found with ID: " + orderId, HttpStatus.NOT_FOUND));

        // Validate status transition
        validateStatusTransition(existingOrder.getStatus(), status);

        existingOrder.setStatus(status);
        existingOrder.setLastUpdated(LocalDateTime.now());

        return orderRepository.save(existingOrder);
    }

    private void validateStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        // Only prevent changes to orders that are already in terminal states
        if (currentStatus == OrderStatus.DELIVERED || currentStatus == OrderStatus.CANCELLED) {
            throw new OrderException("Cannot change status of an order that is already " + currentStatus,
                    HttpStatus.BAD_REQUEST);
        }



        // Prevent skipping statuses (implement proper sequence)
        switch (currentStatus) {
            case PLACED:
                if (newStatus != OrderStatus.CONFIRMED && newStatus != OrderStatus.CANCELLED) {
                    throw new OrderException("Order in PLACED status can only transition to CONFIRMED or CANCELLED",
                            HttpStatus.BAD_REQUEST);
                }
                break;
            case CONFIRMED:
                if (newStatus != OrderStatus.PREPARING && newStatus != OrderStatus.CANCELLED) {
                    throw new OrderException("Order in CONFIRMED status can only transition to PREPARING or CANCELLED",
                            HttpStatus.BAD_REQUEST);
                }
                break;
            case PREPARING:
                if (newStatus != OrderStatus.OUT_FOR_DELIVERY && newStatus != OrderStatus.CANCELLED) {
                    throw new OrderException("Order in PREPARING status can only transition to OUT_FOR_DELIVERY or CANCELLED",
                            HttpStatus.BAD_REQUEST);
                }
                break;
            case OUT_FOR_DELIVERY:
                if (newStatus != OrderStatus.DELIVERED && newStatus != OrderStatus.CANCELLED) {
                    throw new OrderException("Order in OUT_FOR_DELIVERY status can only transition to DELIVERED or CANCELLED",
                            HttpStatus.BAD_REQUEST);
                }
                break;
            default:
                break;
        }
    }

    public String trackOrderStatus(Long orderId) {
        if (orderId == null) {
            throw new OrderException("Order ID cannot be null", HttpStatus.BAD_REQUEST);
        }

        OrderModel order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderException("Order not found with ID: " + orderId, HttpStatus.NOT_FOUND));

        StringBuilder statusInfo = new StringBuilder();
        statusInfo.append("Order ").append(orderId).append("\n");
        statusInfo.append("Status: ").append(order.getStatus()).append("\n");
        statusInfo.append("Last Updated: ").append(order.getLastUpdated()).append("\n");

        // Include location information if available
        if (order.getLatitude() != null && order.getLongitude() != null) {
            statusInfo.append("Delivery Location: ").append(order.getLatitude()).append(", ")
                    .append(order.getLongitude()).append("\n");
        }

        switch (order.getStatus()) {
            case PLACED:
                statusInfo.append("Your order has been received and is awaiting confirmation from the restaurant.");
                break;
            case CONFIRMED:
                statusInfo.append("Your order has been confirmed by the restaurant and will be prepared soon.");
                break;
            case PREPARING:
                statusInfo.append("Your order is being prepared by the restaurant.");
                break;
            case OUT_FOR_DELIVERY:
                statusInfo.append("Your order is on the way!");
                break;
            case DELIVERED:
                statusInfo.append("Your order has been delivered. Enjoy your meal!");
                break;
            case CANCELLED:
                statusInfo.append("Your order has been cancelled.");
                break;
        }

        return statusInfo.toString();
    }
}
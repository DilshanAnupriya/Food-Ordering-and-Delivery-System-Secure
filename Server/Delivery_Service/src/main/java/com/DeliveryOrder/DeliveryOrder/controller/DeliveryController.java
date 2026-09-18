package com.DeliveryOrder.DeliveryOrder.controller;

import com.DeliveryOrder.DeliveryOrder.model.*;
import com.DeliveryOrder.DeliveryOrder.service.DeliveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/delivery")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    @PostMapping("/update-location")
    public ResponseEntity<String> updateDriverLocation(@RequestBody LocationDTO dto) {
        deliveryService.updateLocation(dto);
        return ResponseEntity.ok("Location updated successfully");
    }

    // Added endpoint to get driver locations by userId
    @GetMapping("/drivers/user/{userId}")
    public ResponseEntity<List<DriverLocation>> getDriversByUserId(@PathVariable String userId) {
        List<DriverLocation> drivers = deliveryService.getDriverLocationsByUserId(userId);
        return ResponseEntity.ok(drivers);
    }

    @PostMapping("/create")
    public ResponseEntity<String> createDelivery(@RequestParam String orderId,
                                                 @RequestParam double shopLatitude,
                                                 @RequestParam double shopLongitude,
                                                 @RequestParam double destinationLatitude,
                                                 @RequestParam double destinationLongitude) {
        deliveryService.createDelivery(orderId, shopLatitude, shopLongitude, destinationLatitude, destinationLongitude);
        return ResponseEntity.ok("Delivery created!");
    }

    @PostMapping("/mark-delivered/{driverId}")
    public ResponseEntity<String> markAsDelivered(@PathVariable String driverId) {
        deliveryService.markAsDelivered(driverId);
        return ResponseEntity.ok("Delivery marked as delivered and driver is now available");
    }

    @GetMapping("/by-driver/{driverId}")
    public ResponseEntity<Delivery> getDeliveryByDriver(@PathVariable String driverId) {
        Delivery delivery = deliveryService.getDeliveryByDriver(driverId);
        return ResponseEntity.ok(delivery);
    }

    @GetMapping("/completed-deliveries/{driverId}")
    public ResponseEntity<List<CompletedDelivery>> getCompletedDeliveries(@PathVariable String driverId) {
        List<CompletedDelivery> deliveries = deliveryService.getCompletedDeliveriesByDriver(driverId);
        return ResponseEntity.ok(deliveries);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<DeliveryTrackingDTO> getDeliveryByOrderId(@PathVariable String orderId) {
        DeliveryTrackingDTO delivery = deliveryService.getDeliveryByOrderId(orderId);
        return ResponseEntity.ok(delivery);
    }

    @DeleteMapping("/completed-deliveries/order/{orderId}")
    public ResponseEntity<String> deleteCompletedDeliveryByOrderId(@PathVariable String orderId) {
        deliveryService.deleteCompletedDeliveryByOrderId(orderId);
        return ResponseEntity.ok("Completed delivery for order " + orderId + " deleted successfully");
    }

    // New endpoints for driver location management

    @GetMapping("/drivers")
    public ResponseEntity<List<DriverLocation>> getAllDrivers() {
        List<DriverLocation> drivers = deliveryService.getAllDriverLocations();
        return ResponseEntity.ok(drivers);
    }

    @GetMapping("/drivers/status/{status}")
    public ResponseEntity<List<DriverLocation>> getDriversByStatus(@PathVariable String status) {
        try {
            DriverStatus driverStatus = DriverStatus.valueOf(status.toUpperCase());
            List<DriverLocation> drivers = deliveryService.getDriverLocationsByStatus(driverStatus);
            return ResponseEntity.ok(drivers);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid driver status: " + status);
        }
    }

    @PutMapping("/drivers/{driverId}/status")
    public ResponseEntity<String> updateDriverStatus(
            @PathVariable String driverId,
            @RequestParam String status) {
        try {
            DriverStatus driverStatus = DriverStatus.valueOf(status.toUpperCase());
            deliveryService.updateDriverStatus(driverId, driverStatus);
            return ResponseEntity.ok("Driver status updated to " + status);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid driver status: " + status);
        }
    }

    @DeleteMapping("/drivers/{driverId}")
    public ResponseEntity<String> deleteDriver(@PathVariable String driverId) {
        deliveryService.deleteDriverById(driverId);
        return ResponseEntity.ok("Driver " + driverId + " deleted successfully");
    }
}
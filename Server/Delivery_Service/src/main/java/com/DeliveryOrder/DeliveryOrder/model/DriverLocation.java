package com.DeliveryOrder.DeliveryOrder.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "driver_locations")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class DriverLocation {
    @Id
    @Column(name = "driver_id", nullable = false)
    private String driverId;

    @Column(nullable = false)
    private String driverName;

    @Column(nullable = false)
    private double latitude;

    @Column(nullable = false)
    private double longitude;

    @Column(nullable = false)
    private boolean isAvailable;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DriverStatus status = DriverStatus.PENDING;

    // Added userId field to match the frontend requirements
    @Column
    private String userId;

    public DriverLocation(String driverId, double latitude, double longitude, boolean isAvailable) {
        this.driverId = driverId;
        this.driverName = "Driver " + driverId.substring(0, Math.min(4, driverId.length()));
        this.latitude = latitude;
        this.longitude = longitude;
        this.isAvailable = isAvailable;
        this.status = DriverStatus.PENDING;
    }

    public DriverLocation(String driverId, String driverName, double latitude, double longitude, boolean isAvailable) {
        this.driverId = driverId;
        this.driverName = driverName;
        this.latitude = latitude;
        this.longitude = longitude;
        this.isAvailable = isAvailable;
        this.status = DriverStatus.PENDING;
    }

    // New constructor that includes userId
    public DriverLocation(String driverId, String driverName, double latitude, double longitude, boolean isAvailable, String userId) {
        this.driverId = driverId;
        this.driverName = driverName;
        this.latitude = latitude;
        this.longitude = longitude;
        this.isAvailable = isAvailable;
        this.status = DriverStatus.PENDING;
        this.userId = userId;
    }
}
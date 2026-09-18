package com.DeliveryOrder.DeliveryOrder.model;

import lombok.Data;

@Data
public class LocationDTO {
    private String driverId;
    private String driverName;
    private double latitude;
    private double longitude;
    private String userId; // Added userId field to match frontend requirements
}
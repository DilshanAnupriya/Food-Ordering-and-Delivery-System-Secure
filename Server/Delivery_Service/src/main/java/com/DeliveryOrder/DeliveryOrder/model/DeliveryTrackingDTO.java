package com.DeliveryOrder.DeliveryOrder.model;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryTrackingDTO {
    private String orderId;
    private boolean isDelivered;
    private String estimatedArrival;
    private String driverName;
    private double driverLatitude;
    private double driverLongitude;
    private double customerLatitude;
    private double customerLongitude;
}
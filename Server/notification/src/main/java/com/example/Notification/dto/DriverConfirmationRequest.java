package com.example.Notification.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DriverConfirmationRequest {
    private String email;
    private String driverName;
    private String driverId;
    private String status;
}

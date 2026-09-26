package com.example.Notification.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DriverConfirmationRequest {
    // ORIGINAL (unvalidated): private String email;
    // FIX: constrain inputs before notification work and event-key calculation.
    @NotBlank @Email @Size(max = 254)
    private String email;
    // ORIGINAL (unvalidated): private String driverName;
    // FIX: constrain inputs before notification work and event-key calculation.
    @NotBlank @Size(max = 200)
    private String driverName;
    // ORIGINAL (unvalidated): private String driverId;
    // FIX: constrain inputs before notification work and event-key calculation.
    @NotBlank @Pattern(regexp = "[A-Za-z0-9][A-Za-z0-9._:-]{0,127}")
    private String driverId;
    // ORIGINAL (unvalidated): private String status;
    // FIX: constrain inputs before notification work and event-key calculation.
    @NotBlank @Pattern(regexp = "APPROVED|REJECTED|PENDING")
    private String status;
}

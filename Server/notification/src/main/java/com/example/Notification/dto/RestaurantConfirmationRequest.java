package com.example.Notification.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RestaurantConfirmationRequest {
    // ORIGINAL (unvalidated): private String email;
    // FIX: constrain inputs before notification work and event-key calculation.
    @NotBlank @Email @Size(max = 254)
    private String email;
    // ORIGINAL (unvalidated): private String restaurantName;
    // FIX: constrain inputs before notification work and event-key calculation.
    @NotBlank @Size(max = 200)
    private String restaurantName;
    // ORIGINAL (unvalidated): private String restaurantId;
    // FIX: constrain inputs before notification work and event-key calculation.
    @NotBlank @Pattern(regexp = "[A-Za-z0-9][A-Za-z0-9._:-]{0,127}")
    private String restaurantId;
    // ORIGINAL (unvalidated): private String restaurantType;
    // FIX: constrain inputs before notification work and event-key calculation.
    @Size(max = 100)
    private String restaurantType;
    // ORIGINAL (unvalidated): private String address;
    // FIX: constrain inputs before notification work and event-key calculation.
    @Size(max = 500)
    private String address;
    // ORIGINAL (unvalidated): private String city;
    // FIX: constrain inputs before notification work and event-key calculation.
    @Size(max = 100)
    private String city;
    // ORIGINAL (unvalidated): private String phone;
    // FIX: constrain inputs before notification work and event-key calculation.
    @Size(max = 50)
    private String phone;
    // ORIGINAL (unvalidated): private String openingTime;
    // FIX: constrain inputs before notification work and event-key calculation.
    @Size(max = 32)
    private String openingTime;
    // ORIGINAL (unvalidated): private String closingTime;
    // FIX: constrain inputs before notification work and event-key calculation.
    @Size(max = 32)
    private String closingTime;
}

package com.example.pos1.pos1.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RequestAdminDto {
    private String username;
    private String fullName;
    private String contact;
    private String restaurantName;
    private String restaurantId;
    private String password;
}

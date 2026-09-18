package com.example.pos1.pos1.dto.response;


import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AdminResponseDto {
    private String username;
    private String fullName;
    private String contact;
    private String restaurantName;
    private String restaurantId;
}

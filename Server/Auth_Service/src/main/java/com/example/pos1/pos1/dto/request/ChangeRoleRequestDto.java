// Create DTO for role change request
package com.example.pos1.pos1.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChangeRoleRequestDto {
    private String userId;
    private String roleName;
}
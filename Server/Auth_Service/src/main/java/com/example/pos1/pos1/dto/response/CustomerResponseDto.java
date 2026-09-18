package com.example.pos1.pos1.dto.response;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
@Builder
public class CustomerResponseDto {
    private String id;
    private String name;
    private String address;
    private double salary;
}

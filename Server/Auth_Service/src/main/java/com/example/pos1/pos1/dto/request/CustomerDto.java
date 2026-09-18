package com.example.pos1.pos1.dto.request;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class CustomerDto {
    private String name;
    private String address;
    private double salary;
}

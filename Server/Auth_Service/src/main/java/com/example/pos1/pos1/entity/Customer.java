package com.example.pos1.pos1.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.*;


@Entity(name="customer")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class Customer {
    @Id
    private String id;
    @Column(name = "name", nullable = false, length = 255)
    private String name;
    private String address;
    private double salary;


}

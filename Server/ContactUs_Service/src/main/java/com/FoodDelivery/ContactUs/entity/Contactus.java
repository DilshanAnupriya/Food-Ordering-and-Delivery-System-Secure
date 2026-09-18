package com.FoodDelivery.ContactUs.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;



@Document
@Getter
@Setter
@Data
@AllArgsConstructor
public class Contactus {

    private String id;
    private String name;
    private String email;
    private String comment;
}

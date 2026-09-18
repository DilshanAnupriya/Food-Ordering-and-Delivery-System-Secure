package com.FoodDelivery.ContactUs.repository;

import com.FoodDelivery.ContactUs.entity.Contactus;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface Contactusrepository extends MongoRepository<Contactus, String> {
}

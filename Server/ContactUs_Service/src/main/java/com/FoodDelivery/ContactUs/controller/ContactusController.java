package com.FoodDelivery.ContactUs.controller;


import com.FoodDelivery.ContactUs.entity.Contactus;
import com.FoodDelivery.ContactUs.service.ContactusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController

@RequestMapping("/api/v1/contactus")

public class ContactusController {
    @Autowired
    ContactusService contactusService;

    @PostMapping("/create")
    public Contactus createContactus(@RequestBody Contactus contactus) {
        return contactusService.createContactus(contactus);
    }



    @GetMapping("/fetch/all")
    public List<Contactus> getAllContactus() {
        return contactusService.getAllContactus();
    }

    @GetMapping("/fetch/{id}")
    public Contactus getContactusbyID(@PathVariable("id") String id   ) {
        return contactusService.getContactusbyID(id);
    }

    @PutMapping("/update")
    public Contactus UpdateContactus(@RequestBody Contactus contactus) {
        return contactusService.createContactus(contactus);
    }


    @DeleteMapping("/delete/{id}")
    public void DeleteContactus(@PathVariable("id") String id) {
        contactusService.DeleteContactus(id);
    }




}

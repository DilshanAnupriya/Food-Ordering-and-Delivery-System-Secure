package com.FoodDelivery.ContactUs.service;

import com.FoodDelivery.ContactUs.entity.Contactus;
import com.FoodDelivery.ContactUs.repository.Contactusrepository;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContactusService {

    @Autowired
    Contactusrepository contactusRepository;

    public Contactus createContactus(Contactus contactus) {
        if (contactus == null) return null;
        if (contactus.getName() != null) {
            contactus.setName(Jsoup.clean(contactus.getName().trim(), Safelist.none()));
        }
        if (contactus.getEmail() != null) {
            contactus.setEmail(Jsoup.clean(contactus.getEmail().trim(), Safelist.none()));
        }
        if (contactus.getComment() != null) {
            contactus.setComment(Jsoup.clean(contactus.getComment().trim(), Safelist.none()));
        }
        return contactusRepository.save(contactus);
    }


    public List<Contactus> getAllContactus() {
        return contactusRepository.findAll();
    }

    public Contactus getContactusbyID(String id) {
        return contactusRepository.findById(id).orElse(null);
    }

    public void DeleteContactus(String id) {
        contactusRepository.deleteById(id);
    }


}

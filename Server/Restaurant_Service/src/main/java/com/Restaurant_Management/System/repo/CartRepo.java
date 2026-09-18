package com.Restaurant_Management.System.repo;

import com.Restaurant_Management.System.dto.request.FoodCartItemRequestDto;
import com.Restaurant_Management.System.entity.Cart;
import com.Restaurant_Management.System.entity.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface CartRepo extends JpaRepository<Cart, String> {

    Cart findByUserId(String userId);


    @Query(value = "SELECT * FROM cart WHERE user_id = ?1", nativeQuery = true)
    Optional<Cart> findCartByUserId(String userId);

    @Query(value = "SELECT * FROM cart WHERE username LIKE %?1%", nativeQuery = true)
    Optional<Cart> findCartByUsername(String username);



}

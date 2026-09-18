package com.Restaurant_Management.System.repo;

import com.Restaurant_Management.System.entity.Restaurant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface RestaurantRepo extends JpaRepository<Restaurant,String> {
    @Query(nativeQuery = true, value = "SELECT * FROM restaurant WHERE restaurant_name LIKE %?1% OR restaurant_address LIKE %?1% OR city LIKE %?1% OR restaurant_type LIKE %?1%")
    public Page<Restaurant> findAllRestaurant(String searchText, Pageable pageable);


    @Query(nativeQuery = true,value = "SELECT COUNT(*) FROM restaurant WHERE restaurant_name LIKE %?1% OR restaurant_address LIKE %?1%")
    public long countAllRestaurant(String searchText);

    boolean existsRestaurantByRestaurantName(String restaurantName);

    @Query(nativeQuery = true, value = "SELECT image_url FROM restaurant WHERE restaurant_name = ?1 LIMIT 1")
    String findRestaurantImageUrlByRestaurantName(String restaurantName);

    @Query(nativeQuery = true, value = "SELECT restaurant_id FROM restaurant WHERE restaurant_name = ?1 LIMIT 1")
    String findRestaurantIdByRestaurantName(String restaurantName);

    @Query(nativeQuery = true, value = "SELECT * FROM restaurant WHERE owner_username = ?1 LIMIT 1")
    Restaurant getRestaurantByOwnerUsername(String username);


}

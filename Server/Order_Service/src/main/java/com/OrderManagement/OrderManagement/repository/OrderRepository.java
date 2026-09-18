package com.OrderManagement.OrderManagement.repository;

import com.OrderManagement.OrderManagement.model.OrderModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;


@Repository
public interface OrderRepository extends JpaRepository<OrderModel, Long> {
    List<OrderModel> findByUserId(String userId);
    List<OrderModel> findByRestaurantId(String restaurantId);
}
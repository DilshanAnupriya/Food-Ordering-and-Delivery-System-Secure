package com.DeliveryOrder.DeliveryOrder.repository;

import com.DeliveryOrder.DeliveryOrder.model.Delivery;
import org.springframework.data.domain.Example;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    Optional<Delivery> findByDriverId(String driverId);
    Optional<Delivery> findByOrderId(String orderId);

    @Query(value = "SELECT * FROM deliveries WHERE order_id = :orderId LIMIT 1", nativeQuery = true)
    Optional<Delivery>  findOne(String orderId);
}
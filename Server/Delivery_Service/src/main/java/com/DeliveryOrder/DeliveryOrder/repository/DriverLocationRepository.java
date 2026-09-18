package com.DeliveryOrder.DeliveryOrder.repository;

import com.DeliveryOrder.DeliveryOrder.model.DriverLocation;
import com.DeliveryOrder.DeliveryOrder.model.DriverStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DriverLocationRepository extends JpaRepository<DriverLocation, String> {
    List<DriverLocation> findByIsAvailableTrue();
    List<DriverLocation> findByStatus(DriverStatus status);
    List<DriverLocation> findByIsAvailableTrueAndStatus(DriverStatus status);

    // Added method to find driver locations by userId
    List<DriverLocation> findByUserId(String userId);
}
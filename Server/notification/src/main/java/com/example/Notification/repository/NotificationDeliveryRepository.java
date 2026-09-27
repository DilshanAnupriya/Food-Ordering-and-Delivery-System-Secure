// SECURITY FIX: store and look up the shared database delivery ledger.
package com.example.Notification.repository;

import com.example.Notification.entity.NotificationDelivery;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NotificationDeliveryRepository extends JpaRepository<NotificationDelivery, Long> {
    Optional<NotificationDelivery> findByEventKey(String eventKey);
}

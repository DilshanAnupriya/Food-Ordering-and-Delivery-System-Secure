package com.OrderManagement.OrderManagement.audit;

import org.springframework.data.repository.Repository;
import java.util.List;

// AUDIT FIX: no application update/delete API and no public controller exposing this repository.
// Production DB grants and retention controls are also needed; @Immutable is not tamper-proof storage.
public interface SecurityAuditRepository extends Repository<SecurityAuditEvent, String> {
    List<SecurityAuditEvent> findByOrderIdOrderByOccurredAtAsc(Long orderId);
    List<SecurityAuditEvent> findByRequestId(String requestId);
    long count();
}

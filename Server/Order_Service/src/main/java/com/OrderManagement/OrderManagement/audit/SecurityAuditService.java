package com.OrderManagement.OrderManagement.audit;

import com.OrderManagement.OrderManagement.model.OrderStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import static com.OrderManagement.OrderManagement.audit.SecurityAuditEvent.Action;

@Service
public class SecurityAuditService {
    @PersistenceContext private EntityManager entityManager;

    // AUDIT FIX: commit with the order transaction. Audit failure rolls the business change back.
    @Transactional(propagation = Propagation.MANDATORY)
    public void success(Action action, Long orderId, OrderStatus previousStatus, OrderStatus newStatus, int status) {
        append(new SecurityAuditEvent(AuditContext.current(), action, orderId, "SUCCESS", status,
                "COMPLETED", previousStatus, newStatus));
    }

    // AUDIT FIX: called by the HTTP exception handler after the failed business transaction unwinds.
    // REQUIRES_NEW prevents a rejection record from disappearing with a business rollback.
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void rejected(Action action, Long orderId, int status, String reasonCode) {
        append(new SecurityAuditEvent(AuditContext.current(), action, orderId,
                status == 401 || status == 403 ? "DENIED" : "REJECTED", status, reasonCode, null, null));
    }

    private void append(SecurityAuditEvent event) {
        entityManager.persist(event);
        entityManager.flush();
    }
}

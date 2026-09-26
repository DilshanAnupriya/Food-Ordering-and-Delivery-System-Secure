// SECURITY FIX: enforce quotas and claim a semantic event before any SMTP work.
package com.example.Notification.service;

import com.example.Notification.entity.NotificationDelivery;
import com.example.Notification.repository.NotificationDeliveryRepository;
import com.example.Notification.security.NotificationRateLimiter;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Clock;
import java.util.HexFormat;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ProtectedNotificationService {
    private final NotificationRateLimiter rateLimiter;
    private final NotificationDeliveryRepository deliveries;
    private final Clock clock;

    public DeliveryResult deliver(HttpServletRequest request, String kind, String objectId,
                                  String recipient, String state, Runnable send) {
        // Trust a server-established principal or the socket peer, never a client-supplied IP header.
        String caller = request.getUserPrincipal() == null ? "ip:" + request.getRemoteAddr()
                : "principal:" + request.getUserPrincipal().getName();
        rateLimiter.acquire(caller, recipient);
        String eventKey = eventKey(kind, objectId, recipient, state);
        var existing = deliveries.findByEventKey(eventKey);
        if (existing.isPresent()) {
            return result(existing.get());
        }
        NotificationDelivery claim;
        try {
            // The unique event_key constraint arbitrates simultaneous requests, including across JVMs.
            claim = deliveries.saveAndFlush(new NotificationDelivery(eventKey, clock.instant()));
        } catch (DataIntegrityViolationException duplicate) {
            var concurrent = deliveries.findByEventKey(eventKey);
            if (concurrent.isEmpty()) {
                throw duplicate;
            }
            return result(concurrent.get());
        }
        try {
            send.run();
        } catch (RuntimeException failure) {
            // A failed send must not permanently prevent a later retry.
            deliveries.deleteById(claim.getId());
            throw failure;
        }
        claim.setStatus(NotificationDelivery.Status.SENT);
        deliveries.saveAndFlush(claim);
        return DeliveryResult.SENT;
    }

    private DeliveryResult result(NotificationDelivery delivery) {
        return delivery.getStatus() == NotificationDelivery.Status.SENT
                ? DeliveryResult.ALREADY_SENT : DeliveryResult.PROCESSING;
    }

    private String eventKey(String kind, String objectId, String recipient, String state) {
        // Callers cannot supply an arbitrary idempotency key. Mutable amounts, names and
        // descriptions do not make a repeat of the same semantic event into a new event.
        String canonical = String.join("\n", kind, objectId.strip(),
                recipient.strip().toLowerCase(Locale.ROOT), state);
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(canonical.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException impossible) {
            throw new IllegalStateException("SHA-256 is unavailable", impossible);
        }
    }

    public enum DeliveryResult { SENT, ALREADY_SENT, PROCESSING }
}

package com.OrderManagement.OrderManagement.exception;

import org.springframework.http.ResponseEntity;
import com.OrderManagement.OrderManagement.audit.SecurityAuditService;
import com.OrderManagement.OrderManagement.audit.SecurityAuditEvent.Action;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.servlet.HandlerMapping;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @Autowired private SecurityAuditService securityAudit;

    @ExceptionHandler(OrderException.class)
    // ORIGINAL: public ResponseEntity<Object> handleOrderException(OrderException ex) {
    // AUDIT FIX: preserve the response while recording the rejection after business rollback.
    public ResponseEntity<Object> handleOrderException(OrderException ex, HttpServletRequest request) {
        int status = ex.getStatus().value();
        recordRejection(request, status, status == 403 ? "ACCESS_DENIED"
                : status == 404 ? "ORDER_NOT_FOUND" : "ORDER_RULE_REJECTED");
        Map<String, Object> body = new HashMap<>();
        body.put("message", ex.getMessage());
        body.put("status", ex.getStatus().value());

        return new ResponseEntity<>(body, ex.getStatus());
    }

    // AUDIT FIX: invalid JSON, validation failures and invalid parameter types may never enter
    // the controller. Record a fixed reason code, never raw submitted values or exception text.
    @ExceptionHandler({MethodArgumentNotValidException.class, HandlerMethodValidationException.class,
            HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class,
            MissingServletRequestParameterException.class})
    public ResponseEntity<Object> handleInvalidRequest(Exception ex, HttpServletRequest request) {
        recordRejection(request, 400, "INVALID_REQUEST");
        return ResponseEntity.badRequest().body(Map.of("message", "Invalid request", "status", 400));
    }

    private void recordRejection(HttpServletRequest request, int status, String reason) {
        // A matched order route supplies the ID; never retain arbitrary URLs/query strings.
        Object variables = request.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE);
        Long orderId = null;
        if (variables instanceof Map<?, ?> map && map.get("orderId") != null) {
            try { orderId = Long.valueOf(map.get("orderId").toString()); }
            catch (NumberFormatException ignored) { /* Invalid IDs are not copied into the audit store. */ }
        }
        Action action = switch (request.getMethod()) {
            case "POST" -> Action.CREATE_ORDER;
            case "PUT" -> Action.UPDATE_ORDER;
            case "PATCH" -> Action.CHANGE_STATUS;
            case "DELETE" -> Action.DELETE_ORDER;
            case "GET" -> Action.READ_ORDER;
            default -> Action.ORDER_REQUEST;
        };
        securityAudit.rejected(action, orderId, status, reason);
    }
}

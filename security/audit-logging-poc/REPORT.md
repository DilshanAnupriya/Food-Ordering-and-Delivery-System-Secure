### 4.X Vulnerability X: Security Logging & Monitoring Failures – Missing Audit Trail for Order Changes and Deletions

([Your index number] – Vidura [Your full name])

- **OWASP Category:** OWASP Top 10:2021 – [A09: Security Logging and Monitoring Failures](https://owasp.org/Top10/2021/A09_2021-Security_Logging_and_Monitoring_Failures/)
- **CWE Identifier:** [CWE-778: Insufficient Logging](https://cwe.mitre.org/data/definitions/778.html)
- **Severity:** Medium (qualitative assessment; dependent on deployment and incident-response requirements)
- **CVSS v3.1 Score:** Not assigned. The PoC demonstrates an auditability gap; it does not independently establish direct confidentiality, integrity or availability impact suitable for a justified base vector.
- **Affected Component:** `Order_Service`
- **Affected Files:**
  - `Server/Order_Service/src/main/java/com/OrderManagement/OrderManagement/service/OrderService.java`
  - `Server/Order_Service/src/main/java/com/OrderManagement/OrderManagement/controller/OrderController.java`
  - `Server/Order_Service/src/main/java/com/OrderManagement/OrderManagement/exception/GlobalExceptionHandler.java`

#### Technical Description & Root Cause

The order service performs sensitive operations, including changes to an order's status and permanent deletion, without generating a dedicated application security audit event. In `OrderService.java`, `deleteOrder()` removes the record and returns success. `updateOrderStatus()` saves the new status and timestamp but does not preserve an audit entry describing the change. `GlobalExceptionHandler.java` returns business-rule errors to the caller without emitting a corresponding application security event.

SQL and infrastructure logs exist, but the tested paths do not record a structured audit event linking the actor, action, affected order and outcome. An order's `lastUpdated` field is not an event history and disappears with the deleted record. This gap can hinder detection and investigation of misuse. It does not itself grant permission to modify or delete orders; authorization is a separate control.

```java
// OrderService.java: selected original code after deletion validation.
orderRepository.deleteById(orderId);
return true;
// No application security audit event is emitted for this deletion.
```

```java
// OrderService.java: selected original status-update code.
validateStatusTransition(existingOrder.getStatus(), status);
existingOrder.setStatus(status);
existingOrder.setLastUpdated(LocalDateTime.now());
return orderRepository.save(existingOrder);
// No separate event records the actor, old/new status and outcome.
```

#### Proof of Concept (PoC) Scenario — Executed

The test ran on **26 September 2026** against the actual original source at commit `fe9136d015079d44d70707cc493ef1a88b53ee58`. Java HTTP Client sent seven requests through the already-running **ZAP Desktop 2.17.0** loopback proxy. The service used a temporary H2 database containing one synthetic order. No real customer data, live database or gateway was used.

1. **Create and inspect a disposable order.** `POST /api/v1/orders` returned HTTP 201 and created order ID **1**. A subsequent GET returned HTTP 200 with status `PLACED`.
2. **Perform a valid change.** A PATCH containing `{"status":"CONFIRMED"}` returned HTTP 200 and persisted the updated state.
3. **Trigger a rejected change.** A PATCH containing `{"status":"DELIVERED"}` returned HTTP 400 because the transition skipped required states:

```http
PATCH /api/v1/orders/1/status HTTP/1.1
Host: 127.0.0.1:51012
Content-Type: application/json

{"status":"DELIVERED"}
```

```json
{"message":"Order in CONFIRMED status can only transition to PREPARING or CANCELLED","status":400}
```

4. **Cancel and delete the fixture.** A PATCH to `CANCELLED` succeeded. `DELETE /api/v1/orders/1` then returned HTTP 204. A subsequent GET returned HTTP 404, and the repository check confirmed the order no longer existed.
5. **Inspect the audit evidence.** The test captured Logback events over the complete request interval. It retained the original relevant logging levels (`com.OrderManagement=DEBUG`, Spring Web and root at INFO) and enabled SQL output. Two explicitly labelled test-harness control messages verified that log capture was active at both boundaries. Five Logback events were captured: two harness controls and three framework initialization messages. **Zero events were emitted by the order application package.** The source review also found no dedicated audit logger or audit entity in these paths. SQL statements remain visible separately in the full Maven console log.

#### Actual ZAP Results

| ZAP History ID | Request | HTTP status |
| --- | --- | --- |
| 35 | POST `/api/v1/orders` | 201 |
| 37 | GET `/api/v1/orders/1` | 200 |
| 38 | PATCH `/api/v1/orders/1/status` | 200 |
| 39 | PATCH `/api/v1/orders/1/status` | 400 |
| 40 | PATCH `/api/v1/orders/1/status` | 200 |
| 41 | DELETE `/api/v1/orders/1` | 204 |
| 42 | GET `/api/v1/orders/1` | 404 |

| Audit verification | Observed result |
| --- | --- |
| Controlled requests | 7 |
| Order exists after deletion | No |
| Logging capture control messages | 2 |
| Total captured Logback events within test interval | 5 |
| Order application package log events | 0 |
| Automated PoC | 1 test passed, 0 failures/errors |

A passing test means the original missing audit trail was reproduced. The original before-fix observations are preserved here. **The remediation is now implemented and separately verified; see [REMEDIATION.md](REMEDIATION.md).** The result is limited to the local service and observation interval; it does not establish that every deployment lacks external access logs, database auditing or security monitoring. The synthetic request's `userId` is data, not evidence of an authenticated caller. No absence-of-alerts claim was tested.

#### Figures to Include

- **Figure X.1 — Successful order deletion.** Select **ZAP History ID 41**. Capture the DELETE request and its HTTP **204** response, using separate Request/Response screenshots if necessary.
- **Figure X.2 — Confirmation that the order was removed.** Select **History ID 42**. Capture the GET request and HTTP **404** response containing `Order not found with ID: 1`.
- **Figure X.3 — Rejected invalid state transition.** Select **History ID 39**. Capture the request body `{"status":"DELIVERED"}` and HTTP **400** response. This supports the observation that a rejected operation was also included in the audit-capture interval.
- **Figure X.4 — Missing application audit events during the controlled sequence.** Capture `evidence/zap-run/verification.txt` and the portion of `observations/application.log` between `POC_CAPTURE_BEGIN` and `POC_CAPTURE_END`. Show both control markers and the framework messages between them. Identify the markers as harness instrumentation, not application audit records.
- **Optional Figure X.5 — Root cause in source.** Capture `OrderService.java` around `deleteOrder()` (original lines 216–233) to show the deletion path without an audit event.

ZAP screenshots establish the HTTP operations and outcomes. **The application log capture and source review provide the evidence of insufficient audit logging.** An empty ZAP Alerts tab is not evidence for this finding.

#### Remediation & Code Diff

The secure repository now records structured security events for successful order changes/deletions and relevant failures. See [the implementation, code diff, tested results and after-fix figures](REMEDIATION.md). The following describes the design and remaining operational controls: Include a server-verified actor identity when available, event timestamp, action, affected order ID, outcome and correlation ID. Preserve permitted before/after status values where useful. Use a protected audit destination with retention and restricted write/read access; avoid recording passwords, tokens or unnecessary personal data. Emit success events consistently with committed database changes, and record denied operations even when their transaction fails. Where repeated suspicious failures need detection, configure an alert rule and test it separately. These controls follow the [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html).

#### Evidence Files

- [Verified ZAP summary](evidence/zap-run/zap-summary.json)
- [Raw ZAP messages](evidence/zap-run/zap-messages.json)
- [ZAP HAR](evidence/zap-run/zap-messages.har)
- [Human-readable verification](evidence/zap-run/verification.txt)
- [Application log](evidence/zap-run/observations/application.log)
- [Captured logging events](evidence/zap-run/observations/captured-logging-events.json)
- [Full PoC/Maven log including SQL output](evidence/zap-run/maven-run.log)
- [Original source hashes](evidence/zap-run/source-manifest.json)

The exported ZAP session snapshot includes the existing desktop session; the JSON and HAR contain only these seven selected requests. No automated GUI screenshots were created. The service shuts down after the test; the saved ZAP History messages remain available for screenshots.

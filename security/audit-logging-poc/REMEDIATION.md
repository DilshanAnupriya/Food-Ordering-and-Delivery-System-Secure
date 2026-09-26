# Remediation: persistent security audit trail for orders

Implemented in **Food-Ordering-and-Delivery-System-Secure**, on the existing `vidura` branch. Replaced Java statements are retained as `ORIGINAL` comments; `AUDIT FIX` comments explain the additions. The original vulnerable repository and before-fix evidence are unchanged.

## Report-ready explanation

The remediation adds structured, persistent audit records for order creation, updates, status changes and deletion. Each record contains a UTC timestamp, action, order identifier, outcome, HTTP status, server-generated request identifier and verified JWT actor when available. Status-changing operations also retain the previous and new status. Request bodies, bearer tokens, signing keys, delivery addresses and phone numbers are excluded from the audit record.

Successful events are written in the same database transaction as the order change. If audit storage fails, the business operation rolls back rather than committing an unaudited change. Business-rule, authorization and supported request-validation rejections are recorded by the exception handler in an independent transaction, so a business rollback does not erase the rejection. The audit table has no foreign-key/cascade relationship to orders, allowing investigation after an order is deleted.

The audit filter independently verifies JWT signatures and expiry using the gateway's configured `JWT_SECRET`. It does not treat a request-body `userId` or an `X-Auth-User-Id` header as verified identity. Missing, invalid or unverifiable tokens are labelled `UNVERIFIED`; internal service calls are labelled `SYSTEM`. This filter supplies audit context, not a replacement authorization policy.

## Files changed

All application paths below are under `Server/Order_Service/`.

| File | Purpose |
| --- | --- |
| `src/main/java/com/OrderManagement/OrderManagement/service/OrderService.java` | Add transactional success audit calls to creation, update, status change and deletion; retain previous status before mutation. |
| `src/main/java/com/OrderManagement/OrderManagement/controller/OrderController.java` | Route missing/null/blank/invalid status values through the audited exception handler. Preserve existing access checks. |
| `src/main/java/com/OrderManagement/OrderManagement/exception/GlobalExceptionHandler.java` | Audit business-rule, access-denial, missing-order and supported validation/JSON/type errors with fixed reason codes; keep sensitive request values out of records. |
| `src/main/java/com/OrderManagement/OrderManagement/audit/AuditContext.java` **new** | Carry immutable request identity and correlation data, with explicit internal/unverified attribution. |
| `src/main/java/com/OrderManagement/OrderManagement/audit/SecurityAuditRequestFilter.java` **new** | Verify actor JWTs and generate a fresh response `X-Request-ID`. |
| `src/main/java/com/OrderManagement/OrderManagement/audit/SecurityAuditEvent.java` **new** | Define immutable ORM audit rows, status history and indexes; no relationship that cascades order deletion. |
| `src/main/java/com/OrderManagement/OrderManagement/audit/SecurityAuditRepository.java` **new** | Supply internal read/count queries without save/delete methods or a public endpoint. |
| `src/main/java/com/OrderManagement/OrderManagement/audit/SecurityAuditService.java` **new** | Persist success events in the existing transaction and rejections using `REQUIRES_NEW`; flush so storage failures are detected. |
| `src/main/resources/application.properties` | Read audit JWT verification key from `JWT_SECRET`, without committing a key. |
| `pom.xml` | Include JJWT verification dependencies matching the existing gateway version. |

Supporting changes: `security/resource-consumption-poc/pom.xml` includes those dependencies because it compiles the actual Order Service source; `security/audit-logging-poc/fixed/` contains a separate fixed-source test harness, runner and ZAP exporter. README/report documents and `evidence/fixed-zap-run/` describe and preserve the observed results. The original PoC remains independently reproducible.

## Representative code change

```diff
- return orderRepository.save(existingOrder);
+ // ORIGINAL: return orderRepository.save(existingOrder);
+ // AUDIT FIX: retain both states and the verified caller for later investigation.
+ OrderModel saved = orderRepository.save(existingOrder);
+ securityAudit.success(CHANGE_STATUS, orderId, previousStatus, saved.getStatus(), 200);
+ return saved;
```

`previousStatus` is captured before mutation. The service method already has `@Transactional`, and the audit writer uses `Propagation.MANDATORY`, so this event participates in the same transaction.

```java
@Transactional(propagation = Propagation.REQUIRES_NEW)
public void rejected(Action action, Long orderId, int status, String reasonCode) {
    append(new SecurityAuditEvent(AuditContext.current(), action, orderId,
            status == 401 || status == 403 ? "DENIED" : "REJECTED",
            status, reasonCode, null, null));
}
```

This separation follows [Spring transaction propagation semantics](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-propagation.html). The event fields and excluded sensitive data follow the [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html).

## Verification performed on 26 September 2026

**18 automated tests passed:** 3 audit integration/control tests and all 15 existing resource-consumption protection tests. The Order Service Maven package build also passed (packaging used `-DskipTests`; tests ran separately).

The fixed PoC sent **13 real HTTP requests through ZAP Desktop 2.17.0** to an isolated instance of the actual secure service. The deleted order retained **11 database audit rows: 5 successful operations, 1 denial and 5 rejections**. A separate unverified-identity request produced a twelfth row. All 12 rows survived application shutdown and restart using a file-backed H2 database; the deleted order remained absent.

Additional controls verified that rollback removes both a business change and its success event; a rejection survives outer transaction rollback; an intentionally failed audit insert rolls back the status change; malformed, expired, incorrectly signed, non-expiring and unsafe-identifier JWTs are not treated as verified identities; missing verification configuration remains explicitly unverified. A SQL constraint error in the successful Maven test log is deliberate fault injection.

- [Observed verification](evidence/fixed-zap-run/verification.txt)
- [Database audit rows](evidence/fixed-zap-run/observations/audit-records.json)
- [CSV for a screenshot/table](evidence/fixed-zap-run/observations/audit-records.csv)
- [ZAP history mapping](evidence/fixed-zap-run/zap-summary.json)
- [ZAP messages, tokens redacted](evidence/fixed-zap-run/zap-messages-redacted.json)
- [Audit test log](evidence/fixed-zap-run/maven-run.log)
- [Tested source hashes](evidence/fixed-zap-run/source-manifest.json)

## Figures to add yourself

1. **Successful audited change:** ZAP History **60**, PATCH `CONFIRMED`, HTTP 200. Show its response `X-Request-ID` alongside the corresponding `CHANGE_STATUS` audit row (`PLACED` → `CONFIRMED`).
2. **Rejected change recorded:** History **61**, PATCH `DELIVERED`, HTTP 400. Show the matching `REJECTED` audit row. History **63** additionally demonstrates a 403 `DENIED` event.
3. **History survives deletion:** History **68** (DELETE, 204) and **69** (GET, 404), alongside `audit-records.csv` showing the retained order history.
4. **Persistence and rollback verification:** capture `verification.txt` and the successful Maven test summary. These are observed test outputs, not ZAP scan alerts.

The response request ID connects each HTTP screenshot to its database audit record. Screenshots alone cannot establish transaction rollback or persistence after restart; use the automated verification evidence too. No GUI screenshots were generated.

## Run the fixed verification again

With ZAP listening on loopback port 8080:

```bash
bash security/audit-logging-poc/fixed/run.sh
python3 security/audit-logging-poc/fixed/export-zap.py
```

The exporter refuses to overwrite the saved evidence directory. Choose a new output directory in the script before archiving another run. The local service stops at test completion, but ZAP History remains available. Authorization headers are redacted in exported evidence; the temporary test tokens expire after two minutes.

## Deployment configuration and limits

- Set `JWT_SECRET` for Order Service to the same protected value used by the gateway. If absent, records explicitly say `UNVERIFIED`. No secret was changed or committed.
- Current `spring.jpa.hibernate.ddl-auto=update` creates the audit table on startup. The test verifies H2 persistence, not a production MySQL migration. For production, use a reviewed schema migration and separate schema-owner credentials, with runtime Hibernate set to `validate`.
- Restrict runtime audit-table access to the required INSERT/SELECT privileges; remove inherited/schema-wide privileges that would still allow UPDATE/DELETE/DROP. Keep maintenance/retention and investigation privileges separate. ORM immutability and absence of an API do **not** prevent privileged database tampering.
- Define retention, backups, storage-capacity monitoring, failure alerts and centralized protected collection operationally. These deployment controls and suspicious-event alert rules have not been provisioned or tested here. Rejected-request logging can increase storage usage and needs deployment traffic/storage limits.
- Existing authorization trusts gateway-derived `X-Auth-*` headers. Restrict direct service access to the trusted gateway; the audit change does not independently fix direct-header authorization bypasses. The test deliberately supplies those headers locally and uses synthetic JWTs for verified audit attribution.
- This implements audit coverage for the listed order operations and handled rejections. It is not a claim of complete A09 remediation across every microservice, gateway authentication failure, unexpected server exception or deployment monitoring system. Legitimate successful reads are not audited by this change.

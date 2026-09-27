# Vidura: resource-consumption remediation

## Remediation & Code Diff

Implemented in `Food-Ordering-and-Delivery-System-Secure`, following the supplied SE4030 assignment's requirement to explain the original vulnerability, attempted fixes, verification and remaining limitations. Original replaced code remains commented out beside the secured implementation, with `ORIGINAL` and `FIX` descriptions. The original repository's tracked source has been restored. Before-test evidence is retained unchanged.

1. **Bound pagination before database work.** Order controller parameters enforce `page >= 0` and `1 <= size <= 100` using Jakarta validation. The order service also rejects unpaged/oversized `Pageable` values. The restaurant and both food-listing services call a shared `PaginationLimits` validator before counting records, updating search history or fetching results. Invalid requests return HTTP 400.
2. **Apply notification quotas before SMTP.** Every notification endpoint, including the legacy `/api/orders/confirm`, invokes `ProtectedNotificationService`. An atomic fixed-window limiter allows five accepted requests per caller and five per recipient per 60 seconds, with a global limit of 100. The caller comes from a server-established principal or the socket peer, never an untrusted `X-Forwarded-For` header. Recipient keys are case-normalized. Quota failures return HTTP 429 with a server-calculated `Retry-After`, without sending an email. Duplicate requests also consume request quota.
3. **Suppress duplicate semantic events.** The service derives a SHA-256 event key from notification kind, object ID, normalized recipient and state. Amounts and display names do not change the identity. A persistent ledger with a unique event-key constraint atomically claims delivery across concurrent requests. A completed repeat returns `ALREADY_SENT`; a concurrent in-progress delivery returns HTTP 202 with `PROCESSING`. Both order routes share the same event identity. Definite send failures release their claim for retry.
4. **Validate and bound notification inputs.** Jakarta annotations validate email, ID syntax, status values and text lengths before notification work. Invalid and non-finite amounts return HTTP 400. Registration forms now look up the saved restaurant ID and include it in the email request so legitimate registration notifications have a stable event identity. These constraints do not implement HTML sanitization; that is the separate XSS contribution.
5. **Persist receipts and bound blocking work.** The default H2 delivery ledger uses a file rather than an ephemeral in-memory database. SMTP connect/read/write timeouts are five seconds. Runtime database files are ignored by Git. Configure a durable shared database through `NOTIFICATION_DB_URL` for deployment.

Representative change (the complete original method remains in source comments):

```java
// ORIGINAL: return orderRepository.findAll(pageable);
// FIX: refuse expensive unbounded queries before the repository is called.
if (pageable == null || pageable.isUnpaged() || pageable.getPageSize() > MAX_PAGE_SIZE) {
    throw new OrderException("Page size must be between 1 and " + MAX_PAGE_SIZE,
            HttpStatus.BAD_REQUEST);
}
return orderRepository.findAll(pageable);
```

## Actual before/after verification

| Test | Original application | Secured application |
| --- | --- | --- |
| Orders, `size=10` | HTTP 200, 10 orders | HTTP 200, 10 orders |
| Orders, `size=200` | HTTP 200, 200 orders | HTTP 400, 0 orders |
| Six identical payment-notification POSTs | Six HTTP 200 responses, six captured emails | Five HTTP 200 responses, sixth HTTP 429; 1 captured email |
| Change amount on a repeated event | Repeated sends allowed | `ALREADY_SENT`, including after service restart |
| Oversized restaurant/food pages | Unrestricted requested page size in source | HTTP 400 before repository work |

**15 backend regression tests passed:** three order/restaurant/food checks using Boot 3.4.3; twelve notification/limiter checks using Boot 3.4.5. The harness compiles the actual secure application sources with JDK 21, uses disposable H2 databases and captures SMTP with local GreenMail. Tests cover negative/zero/maximum page sizes, all listing routes, all notification routes, the legacy alias, distinct-event throttling, changing forwarded-IP headers, invalid inputs, concurrent quotas and duplicate claims, a definite send failure, and receipt persistence after restart. This is bounded functional verification, not a load test. Real provider delivery, MySQL and the gateway were not used.

ZAP Desktop 2.17.0 separately captured eight real HTTP messages through its local proxy: the baseline GET, blocked oversized GET and six notification POSTs. See [ZAP after-fix results](ZAP_FIXED_RESULTS.md).

The frontend `npm run build` exits 2 with **250 TypeScript diagnostics** in both the original baseline and secured client. Their diagnostic lists are identical after normalizing shifted line numbers; no new diagnostic was introduced by these changes. Existing client errors remain unresolved. Raw output and the comparison are in `evidence/fixed-run/`.

Re-run the fixed checks:

```bash
cd security/resource-consumption-poc
./run-fixed.sh
```

## Remaining limits and reasons

- Quotas are held in bounded memory per service instance and reset on restart. They are not a distributed rate-limit implementation. Multiple replicas need shared quotas or equivalent gateway controls; the current assignment PoC runs one instance.
- The notification service still accepts browser-supplied object IDs and states. Deduplication does **not** prove ownership or verify a real order/payment transition. Authenticated authorization and authoritative server-generated events remain necessary; the service currently lacks those trusted event inputs. A new fabricated ID can bypass deduplication, but not the caller/recipient/global quotas within the instance.
- IP-based callers can share a quota behind a proxy/NAT. The service intentionally does not trust arbitrary forwarded-IP headers. Deployment needs a configured trusted proxy boundary or a verified authenticated principal for fair attribution.
- A database claim and SMTP delivery cannot form one atomic transaction. A crash during delivery can leave `PROCESSING` for operator reconciliation, and an ambiguous SMTP error after acceptance can allow a retry to duplicate mail. This implementation does not promise exactly-once delivery. Retention/reconciliation and durable outbox processing remain future deployment work.
- A repeated state cycle, such as driver `APPROVED -> REJECTED -> APPROVED`, has no authoritative transition revision in the existing DTO and can suppress the second approval notification. A trusted event revision is needed to distinguish legitimate repeated transitions without allowing arbitrary client idempotency keys.
- Pagination caps bound work per request. They do not by themselves stop many simultaneous small listing requests. Global ingress/concurrency limits remain a deployment concern.
- The existing driver form uses `driverName` as its email address. A non-email name is now rejected; correcting the driver data model/email sourcing is outside this resource-consumption fix.

## Assignment submission notes

The supplied assignment also requires at least seven distinct group findings, an OAuth/OIDC feature, group names/index numbers, original/modified GitHub links, detailed commit history, a maximum-20-minute video, a PDF report and a single ZIP submission. This change completes the resource-consumption implementation and evidence only; it does not claim the other group deliverables are complete. No commit, push or publication was performed.

Suggested detailed fix commits: `Reject oversized order, restaurant and food pagination before queries`; `Guard every notification route with quotas and persistent duplicate claims`; `Record resource-consumption before/after tests and remaining limits`.

See [changed-file inventory](CHANGED_FILES.md) for every application/configuration file changed.

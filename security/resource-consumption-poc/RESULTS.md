# Observed PoC results — Vidura

This file describes the original direct-client run. A subsequent test through
the laptop's installed ZAP Desktop is documented separately in
[ZAP_RESULTS.md](ZAP_RESULTS.md).

Executed on **26 September 2026**, using the original application Java sources
at the commit recorded in [source-manifest.json](evidence/observed-run/source-manifest.json).
No order-service or notification-service source files were changed for this PoC.

Both reproduction tests passed. This means the original vulnerable behaviour was
observed; it does not mean the vulnerabilities have been fixed.

## 1. Client-controlled pagination

The real `OrderService` created 250 synthetic orders in an isolated H2 database.
Two real HTTP requests were then sent to the order controller:

| Request | HTTP status | Orders returned | Response body size |
|---|---:|---:|---:|
| `GET /api/v1/orders?page=0&size=10` | 200 | 10 | 4,791 bytes |
| `GET /api/v1/orders?page=0&size=200` | 200 | 200 | 94,460 bytes |

Changing one query parameter returned **20 times as many orders** and approximately
**19.7 times as many response bytes**. The default page size of 10 was not enforced
as a maximum, and a request exceeding the proposed remediation maximum of 100 was
accepted.

Evidence:

- [Recorded statuses, headers, counts, timing, and runtime version](evidence/observed-run/pagination/summary.json)
- [Baseline request](evidence/observed-run/pagination/baseline-request.http) and [response](evidence/observed-run/pagination/baseline-response.json)
- [Oversized request](evidence/observed-run/pagination/oversized-request.http) and [response](evidence/observed-run/pagination/oversized-response.json)
- [Successful execution log](evidence/observed-run/pagination-run.log)

The recorded response times were 148 ms and 43 ms respectively. They are not a
benchmark: startup and warm-up effects mean this run does not demonstrate latency
degradation. Record counts and response sizes establish the oversized retrieval.

## 2. Repeated notification delivery

Six identical requests were sent sequentially to
`POST /api/notifications/payment-confirmation`, specifying the same synthetic
recipient and order identifier. The real mail sender delivered to a local SMTP
catcher.

| Measurement | Observed result |
|---|---:|
| HTTP requests | 6 |
| HTTP 200 responses | 6 |
| HTTP 429 responses | 0 |
| Captured emails | 6 |
| Total request sequence duration | 5,209 ms |

All captured messages addressed `vidura-test@example.test` and used the subject
`Payment Confirmation - Order #TEST-ORDER-001`.

Evidence:

- [Request and synthetic payload](evidence/observed-run/notifications/request.http)
- [All response statuses and captured-email count](evidence/observed-run/notifications/summary.json)
- [First captured email](evidence/observed-run/notifications/message-1.eml) and [sixth captured email](evidence/observed-run/notifications/message-6.eml)
- [Successful execution log](evidence/observed-run/notifications-run.log)

The tested sequence was neither throttled nor deduplicated. Six requests alone
cannot exclude a higher rate-limit threshold; the source review separately found
no application limiter in the supplied notification path.

## Report-ready outcome

> A local proof of concept reproduced unrestricted resource consumption patterns
> in the order and notification services. Increasing the order-listing `size`
> parameter from 10 to 200 produced HTTP 200 responses containing 10 and 200 orders,
> respectively, with response bodies of 4,791 and 94,460 bytes. Separately, six
> identical payment-confirmation requests completed in 5.209 seconds, returned six
> HTTP 200 responses, and caused six emails to be delivered to a local SMTP
> catcher. These results demonstrate acceptance of oversized page requests and
> repeated email delivery without throttling in the tested sequence. Potential
> impacts include increased database/serialization work and consumption of email
> quotas. Service outages, resource exhaustion, and real-provider quota depletion
> were not demonstrated.

## Test boundaries

- Java 21.0.9; Spring Boot 3.4.3 for orders and 3.4.5 for notifications, matching
  the service POM versions.
- Actual application controllers, services, repositories, and SMTP sending code;
  no mocks for these components.
- H2 in MySQL compatibility mode replaces the production MySQL database. Service
  discovery and gateway behaviour were not tested.
- HTTP and SMTP bound to loopback addresses on temporary ports, which were closed
  after the tests. Saved `.http` files record historical requests; those ports
  will not remain available after the run.
- Only synthetic orders and local captured emails were used. No real messages
  were sent and no existing database was modified.
- The restaurant-service pagination issue was not exercised by this runtime PoC.

See [README.md](README.md) to repeat the test. New runs write to `target/evidence/`;
this `evidence/observed-run/` snapshot remains available for the report.

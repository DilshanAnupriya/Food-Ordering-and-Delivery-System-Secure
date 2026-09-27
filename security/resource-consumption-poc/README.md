# Secure repository: resource-consumption remediation

This directory belongs to `Food-Ordering-and-Delivery-System-Secure`. Run `./run-fixed.sh` (or `./run.sh`) to verify the secured source. The original reproduction class is kept but disabled here because it expects vulnerable behaviour; use the archived test against the original repository source to reproduce that baseline.

Read [REMEDIATION.md](REMEDIATION.md) for the actual before/after results, [CHANGED_FILES.md](CHANGED_FILES.md) for the implementation file list, and [ZAP_FIXED_RESULTS.md](ZAP_FIXED_RESULTS.md) for the after-fix ZAP capture.

The following original PoC notes and all files under `evidence/observed-run` and `evidence/zap-desktop-run` are retained as historical **before-fix** evidence. Their original-repository paths and vulnerable results describe the baseline, not this secured working tree.

---

# Vidura's resource-consumption PoC

This runs the repository's actual order and notification application code in an
isolated local environment and captures evidence for the assignment. It does not
implement the security fixes. A passing reproduction test means the original
vulnerable behaviour was observed.

The completed run and report-ready wording are in [RESULTS.md](RESULTS.md).
Its raw evidence is preserved in `evidence/observed-run/`, separately from the
overwritable `target/evidence/` directory used by new runs.

The later reproduction through the installed ZAP Desktop proxy is documented in
[ZAP_RESULTS.md](ZAP_RESULTS.md), with ZAP-exported HTTP messages, a HAR file, and a
session snapshot in `evidence/zap-desktop-run/`.

## Run

From the repository root, with Java 17 or 21 and Maven installed:

```sh
bash security/resource-consumption-poc/run.sh
```

The first run downloads Maven dependencies. No Docker, existing database, running
gateway, SMTP credentials, or other running services are required. Application
HTTP and SMTP ports are allocated automatically on `127.0.0.1`. Each application,
database, and mail catcher shuts down when its test ends, including on failure.

On macOS, the runner selects an installed JDK 21 (or 17) if `JAVA_HOME` is unset.
Elsewhere, point `JAVA_HOME` at JDK 17 or 21. The original Lombok versions may not
support newer JDKs such as 25.

The runner matches the original Spring Boot versions: **3.4.3** for orders and
**3.4.5** for notifications. The harness compiles the original Java source files
directly. It excludes production property files and uses temporary H2 databases
instead of MySQL. Service discovery and the gateway are outside this test.

Email delivery uses [GreenMail](https://greenmail-mail-test.github.io/greenmail/),
a local, non-forwarding SMTP test server. Only synthetic fixture data and
`example.test` email addresses are used.

## Demonstrations

### 1. Client-controlled page size

The test creates 250 synthetic orders through the existing `OrderService`, then
sends two real HTTP requests to the existing controller:

```http
GET /api/v1/orders?page=0&size=10
GET /api/v1/orders?page=0&size=200
```

The original code is expected to return HTTP 200 with 10 and 200 records,
respectively. The assertions check the actual `orders` array length, not the
`totalItems` field (which describes the whole dataset).

This demonstrates that the default size of 10 is not an enforced maximum. A
proposed future maximum of 100 is a remediation policy, not an existing contract.
The experiment does not prove every possible page size is accepted.

### 2. Repeated notification delivery

The test sends six identical, sequential HTTP requests to the notification service:

```http
POST /api/notifications/payment-confirmation
Content-Type: application/json

{"email":"vidura-test@example.test","orderId":"TEST-ORDER-001","amount":25.00,"paymentStatus":"SUCCESS"}
```

It checks for six HTTP 200 responses and six messages actually received by the
SMTP catcher, with the same recipient and order confirmation subject. The real
controller, email service, and JavaMail sender execute; none is mocked.

Six accepted requests establish that this particular sequence is not throttled
or deduplicated. They do not rule out a higher threshold in a different deployment.
The source review separately found no limiter in the supplied notification path.
The illustrative limit of five requests per minute discussed in the assignment
plan is a proposed control, not a limit claimed to exist in the original code.

## Evidence for your report

After a successful run, open:

- `target/evidence/pagination/summary.json`: status, records returned, byte counts,
  elapsed times, framework version, and timestamp.
- `target/evidence/pagination/*-request.http`: actual requests, including the
  temporary local port.
- `target/evidence/pagination/*-response.json`: complete synthetic responses.
- `target/evidence/notifications/summary.json`: all six response statuses and
  headers, elapsed time, and captured email count.
- `target/evidence/notifications/request.http`: repeated request payload.
- `target/evidence/notifications/message-1.eml` through `message-6.eml`: captured
  messages; open these with an email viewer or text editor.
- `target/pagination-run.log` and `target/notifications-run.log`: execution logs
  containing assertion results and concise `POC` result lines.

For a presentation, show the source lines, run the command, show the two summary
files and captured messages, then explain the proposed fixes. Save a copy of the
evidence before rerunning; each run overwrites files with the same names. Evidence
under `target/` is ignored by Git.

## Interpretation and limitations

This is a bounded functional demonstration, **not a load test**. It makes only two
listing requests and six email requests. It establishes oversized result retrieval
and repeated email delivery. It does **not** demonstrate an outage, CPU/memory
exhaustion, real provider quota depletion, or financial loss. Response times include
startup/warm-up effects and must not be treated as comparative performance results.

The restaurant service has a similar source-level pagination finding, but this
runtime PoC tests the order service only. Direct-service results do not establish
the behaviour of a separately deployed reverse proxy or gateway.

After implementing fixes, replace the reproduction assertions with regression
expectations: an oversized page is rejected or capped, requests exceeding the
chosen quota return 429 before sending mail, and duplicate events do not send
additional messages. Add recovery-after-window and quota-isolation checks then.

## Source locations

- [OrderController.java](../../Server/Order_Service/src/main/java/com/OrderManagement/OrderManagement/controller/OrderController.java), lines 29–39.
- [OrderService.java](../../Server/Order_Service/src/main/java/com/OrderManagement/OrderManagement/service/OrderService.java), lines 32–33.
- [NotificationController.java](../../Server/notification/src/main/java/com/example/Notification/controller/NotificationController.java), lines 16–26.
- [EmailService.java](../../Server/notification/src/main/java/com/example/Notification/service/EmailService.java), lines 110–141.

Classification: [OWASP API4:2023](https://api-security.owasp.org/editions/2023/en/0xa4-unrestricted-resource-consumption/),
[CWE-770](https://cwe.mitre.org/data/definitions/770.html), and
[CWE-799](https://cwe.mitre.org/data/definitions/799.html).

# PoC verified through ZAP Desktop

Executed on **26 September 2026** through the laptop's already-running **ZAP
Desktop 2.17.0**, listening on `127.0.0.1:8080`.

The Java HTTP Client sent requests through ZAP's proxy, and the ZAP API exported
the recorded HTTP messages. The original order-service and notification-service
Java sources executed with synthetic data, temporary H2 databases, and a local
GreenMail SMTP catcher. This run did not use the GUI Requester add-on or an active
scan; it is an automated proxy-based reproduction with independently checked ZAP
history evidence.

## Pagination

| Requested page size | HTTP status | Orders returned | Response body size | ZAP History ID |
|---|---:|---:|---:|---:|
| 10 | 200 | 10 | 4,790 bytes | 1 |
| 200 | 200 | 200 | 94,478 bytes | 3 |

Both requests queried the same database of **250 synthetic orders**. The request
parameter change returned 20 times as many records. Counts, statuses, and byte
sizes were verified against the response bodies stored by ZAP, as well as the Java
client's observations.

The byte sizes differ slightly from the earlier direct-client run in `RESULTS.md`
because newly seeded orders contain new timestamps. These are separate runs;
use the figures in this file when reporting the ZAP test.

## Notifications

Six identical payment-confirmation POSTs returned **six HTTP 200 responses**,
produced **six captured emails**, and completed in **5.204 seconds**. No request
returned HTTP 429. The ZAP History IDs are **6, 10, 11, 12, 13, and 14**.

Each request used the same synthetic recipient (`vidura-test@example.test`) and
order identifier (`TEST-ORDER-001`). Each captured email had the corresponding
payment-confirmation subject. Export validation checked that all six request
bodies and response statuses in ZAP matched the test.

ZAP also creates internal Sites tree entries. Those are not additional network
requests and were excluded from the exported set of eight actual HTTP messages.

## Evidence and desktop review

- [ZAP summary and History IDs](evidence/zap-desktop-run/zap-summary.json)
- [Eight HTTP messages exported by ZAP](evidence/zap-desktop-run/zap-messages.json)
- [ZAP HAR export](evidence/zap-desktop-run/zap-messages.har)
- [Pagination measurements](evidence/zap-desktop-run/pagination/summary.json)
- [Notification measurements](evidence/zap-desktop-run/notifications/summary.json)
- [Captured email 1](evidence/zap-desktop-run/notifications/message-1.eml) and
  [captured email 6](evidence/zap-desktop-run/notifications/message-6.eml)

A ZAP session snapshot is saved alongside these files as `zap-session` with ZAP's
associated session files. The existing desktop session was not reset or switched.
The requests remain visible in the desktop's History tab. Select ID **1** or **3**
and open Request/Response to inspect the pagination PoC; select the notification
IDs to inspect the repeated POSTs.

macOS screen-capture and Accessibility permissions were not granted to this
execution environment. No desktop mouse/keyboard interaction or native screenshot
was performed. The evidence above was obtained from the actual running ZAP API.

## Report-ready wording

> ZAP Desktop 2.17.0 was used as an intercepting HTTP proxy during controlled local
> testing. Two order-listing requests with page sizes of 10 and 200 returned HTTP
> 200 responses containing 10 and 200 orders, with response bodies of 4,790 and
> 94,478 bytes respectively. Six identical payment-confirmation requests completed
> in 5.204 seconds, returned six HTTP 200 responses, and delivered six emails to a
> local SMTP catcher. ZAP's recorded request and response messages were exported
> through its API and cross-checked against the test assertions. These results
> demonstrate acceptance of oversized page requests and repeated email delivery
> without throttling in the tested sequence. The tests did not demonstrate a
> service outage or exhaustion of real email-provider quotas.

## Repeat

With ZAP Desktop running locally and its API enabled:

```sh
POC_ZAP_PROXY=http://127.0.0.1:8080 bash security/resource-consumption-poc/run.sh
python3 security/resource-consumption-poc/export-zap.py --output security/resource-consumption-poc/evidence/new-zap-run
```

The export directory must be new, so earlier evidence cannot be overwritten. The
exporter reads the local ZAP API key from its configuration file without writing
or displaying it. `--zap-config` supports another configuration-file location.

The local test services and SMTP catcher shut down after their assertions. ZAP
Desktop remains running for review. No production code has been fixed by this PoC.

# ZAP Desktop: after-fix evidence

Recorded at `2026-09-26T11:50:59.321468+00:00` with ZAP Desktop 2.17.0 using the actual **secure repository working-tree source**. Requests were sent by Java HTTP Client through ZAP's loopback proxy and exported using its API. No automated GUI interaction or native screenshot was performed. Tests used synthetic records, temporary H2 and local GreenMail only.

| ZAP History ID | Request | HTTP status |
| --- | --- | --- |
| 15 | baseline | 200 |
| 19 | oversized | 400 |
| 26 | notification | 200 |
| 30 | notification | 200 |
| 31 | notification | 200 |
| 32 | notification | 200 |
| 33 | notification | 200 |
| 34 | notification | 429 |

| Observation | Result |
| --- | --- |
| `size=10` | 10 orders, 4,791 bytes |
| `size=200` | HTTP 400; no orders returned, 104 bytes |
| Six identical notification POSTs | First `SENT`, next four `ALREADY_SENT`, sixth HTTP 429 with `Retry-After` |
| Local SMTP messages captured | 1 |

Evidence: [ZAP JSON messages](evidence/zap-fixed-run/zap-messages.json), [HAR](evidence/zap-fixed-run/zap-messages.har), [summary and source hashes](evidence/zap-fixed-run/zap-summary.json), and `evidence/zap-fixed-run/zap-session.*`. Original before-fix results remain in [ZAP_RESULTS.md](ZAP_RESULTS.md).

For report screenshots, select History **ID 19** and show its Request (`size=200`) and Response (`400`). Then select **ID 34** and show the Response (`429`, `Retry-After`), keeping IDs 26–34 visible in History. Capture the single local SMTP message or use its saved `.eml` as separate duplicate-suppression evidence. Pair these with the earlier before-fix screenshot; the History table alone does not establish how many emails were delivered.

The exported snapshot includes the existing ZAP session, while the JSON and HAR select only the eight exact PoC messages. The active session was not reset or switched. These checks confirm the configured protections on sampled requests; they do not measure throughput or establish complete denial-of-service resistance.

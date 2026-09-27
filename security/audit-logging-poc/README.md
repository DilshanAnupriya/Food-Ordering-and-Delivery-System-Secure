# Missing audit-logging PoC

Read [REPORT.md](REPORT.md) for the report-ready finding, actual ZAP results and figure instructions.

This harness lives in the **secure repository**, but compiles and exercises the actual **original Order_Service** in the sibling `Food-Ordering-Delivery-System` checkout. No production code is modified. It binds a temporary service to loopback, creates one synthetic order in disposable H2, and sends seven bounded HTTP requests through local ZAP. It preserves the original relevant logging levels and SQL output while adding file/event capture and two labelled test-harness control messages.

## Reproduce

Prerequisites: JDK 17/21, Maven, the original sibling repository, and ZAP listening at `http://127.0.0.1:8080`.

```bash
./run.sh
```

The macOS runner selects JDK 21 when JAVA_HOME is unset. Passing means the original audit gap was reproduced, not remediated. The default source path can be changed with Maven's `-Doriginal.source=/absolute/path/to/Order_Service/src/main/java` if your checkout layout differs.

`python3 export-zap.py` verifies the seven exact requests against ZAP, exports their HAR/JSON and snapshots the session. It reads the local ZAP API key without printing it. The existing `evidence/zap-run` directory is intentionally never overwritten; use a different output directory in the script for another archived run.

`./show-results.sh` displays the saved, observed results for a terminal screenshot. This does not rerun the test.

## Scope

No gateway, external monitoring system, live SMTP, production MySQL or real customer records were used. Ordinary SQL and framework logs are present. The demonstrated gap is missing application audit events for the tested order operations. The synthetic userId is not authenticated caller evidence. The original test did not apply a fix. A separate secure-repository remediation and fixed-source harness are now available in [REMEDIATION.md](REMEDIATION.md) and `fixed/`. No commit or push was made.

## Implemented remediation

Read [REMEDIATION.md](REMEDIATION.md) for every changed file, comments preserving replaced code, deployment settings, actual fixed ZAP results and screenshot guidance. Run `bash fixed/run.sh` for the secure-source tests. Before evidence remains in `evidence/zap-run/`; after evidence is in `evidence/fixed-zap-run/`.

# Food-Ordering-and-Delivery-System

## Vidura: unrestricted resource consumption remediation

The notification service now limits requests and suppresses duplicate deliveries. Order, restaurant and food pagination reject sizes outside 1–100. Replaced implementations are retained as comments beside the secure code.

- Original project: https://github.com/DilshanAnupriya/Food-Ordering-Delivery-System
- Modified project: https://github.com/DilshanAnupriya/Food-Ordering-and-Delivery-System-Secure
- Implementation, evidence and known limits: [Remediation notes](security/resource-consumption-poc/REMEDIATION.md)
- Individual changed-file inventory: [Changed files](security/resource-consumption-poc/CHANGED_FILES.md)
- Verification: `cd security/resource-consumption-poc && ./run-fixed.sh`

The assignment also requires the group's member names/index numbers, detailed fix commits, a video of at most 20 minutes, a PDF report, at least seven distinct vulnerability findings, and an OAuth/OIDC feature. Those group deliverables still need to be completed; this section covers the resource-consumption contribution only. No commits or remote publication were performed by this change.

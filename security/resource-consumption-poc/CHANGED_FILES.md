# Files changed in the secure repository

Repository: `/Users/vidurahewaduwa/Documents/GitHub/Food-Ordering-and-Delivery-System-Secure`. Original repository tracked source was restored; its before-test artifacts remain available.

## Modified application and configuration files

- [`Client/src/pages/Restaurant/RestaurantCreate.tsx`](../../Client/src/pages/Restaurant/RestaurantCreate.tsx) — Looks up the saved restaurant ID and includes it in registration notifications.
- [`Client/src/pages/Restaurant/resCreate.tsx`](../../Client/src/pages/Restaurant/resCreate.tsx) — Applies the same restaurant-ID notification change to the alternate form.
- [`README.md`](../../README.md) — Links the original/secure projects, verification steps and assignment contribution notes.
- [`Server/Order_Service/src/main/java/com/OrderManagement/OrderManagement/controller/OrderController.java`](../../Server/Order_Service/src/main/java/com/OrderManagement/OrderManagement/controller/OrderController.java) — Validates page >= 0 and size 1–100 before creating a Pageable; original parameters are commented.
- [`Server/Order_Service/src/main/java/com/OrderManagement/OrderManagement/service/OrderService.java`](../../Server/Order_Service/src/main/java/com/OrderManagement/OrderManagement/service/OrderService.java) — Rejects unpaged or oversized repository requests; original method is retained in comments.
- [`Server/Restaurant_Service/src/main/java/com/Restaurant_Management/System/service/impl/FoodItemServiceImpl.java`](../../Server/Restaurant_Service/src/main/java/com/Restaurant_Management/System/service/impl/FoodItemServiceImpl.java) — Validates both food listing and category pagination before any query; original methods remain commented.
- [`Server/Restaurant_Service/src/main/java/com/Restaurant_Management/System/service/impl/RestaurantServiceImpl.java`](../../Server/Restaurant_Service/src/main/java/com/Restaurant_Management/System/service/impl/RestaurantServiceImpl.java) — Validates restaurant pagination before queries or search-history changes; original method remains commented.
- [`Server/notification/pom.xml`](../../Server/notification/pom.xml) — Adds Spring Boot Jakarta validation support.
- [`Server/notification/src/main/java/com/example/Notification/api/OrderController.java`](../../Server/notification/src/main/java/com/example/Notification/api/OrderController.java) — Protects the legacy order-confirmation route with shared quotas and duplicate suppression; original class remains commented.
- [`Server/notification/src/main/java/com/example/Notification/controller/NotificationController.java`](../../Server/notification/src/main/java/com/example/Notification/controller/NotificationController.java) — Routes all four notification endpoints through the protection service and validates inputs; original class remains commented.
- [`Server/notification/src/main/java/com/example/Notification/dto/DriverConfirmationRequest.java`](../../Server/notification/src/main/java/com/example/Notification/dto/DriverConfirmationRequest.java) — Validates driver recipient, ID, name length and permitted status values.
- [`Server/notification/src/main/java/com/example/Notification/dto/PaymentConfirmationRequest.java`](../../Server/notification/src/main/java/com/example/Notification/dto/PaymentConfirmationRequest.java) — Validates payment recipient, order ID, status and finite non-negative amount.
- [`Server/notification/src/main/java/com/example/Notification/dto/RestaurantConfirmationRequest.java`](../../Server/notification/src/main/java/com/example/Notification/dto/RestaurantConfirmationRequest.java) — Requires recipient/name/restaurant ID and bounds optional text lengths.
- [`Server/notification/src/main/resources/application.properties`](../../Server/notification/src/main/resources/application.properties) — Configures quotas, a persistent delivery database and five-second SMTP timeouts; existing settings are preserved.

## New protection files

- [`.gitignore`](../../.gitignore) — Excludes local runtime notification databases.
- [`Server/Restaurant_Service/src/main/java/com/Restaurant_Management/System/util/PaginationLimits.java`](../../Server/Restaurant_Service/src/main/java/com/Restaurant_Management/System/util/PaginationLimits.java) — Shared restaurant/food page-size validator; throws HTTP 400 for invalid values.
- [`Server/notification/src/main/java/com/example/Notification/entity/NotificationDelivery.java`](../../Server/notification/src/main/java/com/example/Notification/entity/NotificationDelivery.java) — Persistent PROCESSING/SENT delivery record with a unique event-key constraint.
- [`Server/notification/src/main/java/com/example/Notification/repository/NotificationDeliveryRepository.java`](../../Server/notification/src/main/java/com/example/Notification/repository/NotificationDeliveryRepository.java) — Saves delivery claims and looks up existing event keys.
- [`Server/notification/src/main/java/com/example/Notification/security/NotificationExceptionHandler.java`](../../Server/notification/src/main/java/com/example/Notification/security/NotificationExceptionHandler.java) — Converts quota failures into HTTP 429 responses with Retry-After.
- [`Server/notification/src/main/java/com/example/Notification/security/NotificationProtectionConfig.java`](../../Server/notification/src/main/java/com/example/Notification/security/NotificationProtectionConfig.java) — Registers validated configuration and an injectable clock.
- [`Server/notification/src/main/java/com/example/Notification/security/NotificationProtectionProperties.java`](../../Server/notification/src/main/java/com/example/Notification/security/NotificationProtectionProperties.java) — Configurable caller, recipient, global, storage and fixed-window limits.
- [`Server/notification/src/main/java/com/example/Notification/security/NotificationRateLimitException.java`](../../Server/notification/src/main/java/com/example/Notification/security/NotificationRateLimitException.java) — Carries the calculated retry interval.
- [`Server/notification/src/main/java/com/example/Notification/security/NotificationRateLimiter.java`](../../Server/notification/src/main/java/com/example/Notification/security/NotificationRateLimiter.java) — Atomically checks caller/recipient/global quotas using bounded storage.
- [`Server/notification/src/main/java/com/example/Notification/service/ProtectedNotificationService.java`](../../Server/notification/src/main/java/com/example/Notification/service/ProtectedNotificationService.java) — Checks quotas, derives event identity, atomically claims delivery, suppresses duplicates and permits definite failed-send retries.

## Verification and report files

- `security/resource-consumption-poc/src/test/java/local/security/ResourceConsumptionFixTest.java`: HTTP before/after comparison and pagination boundary tests.
- `security/resource-consumption-poc/src/test/java/local/security/RestaurantPaginationFixTest.java`: all restaurant/food listing routes plus checks that invalid requests perform no repository calls.
- `security/resource-consumption-poc/src/test/java/local/security/NotificationProtectionTest.java`: actual local SMTP, shared aliases, distinct events, invalid inputs, persistent receipts, concurrent claims and failed-send retry.
- `security/resource-consumption-poc/src/test/java/local/security/NotificationRateLimiterTest.java`: caller, recipient, global and storage quotas, expiry and concurrent quota enforcement.
- `security/resource-consumption-poc/src/test/resources/logback-poc.xml`: isolated test logging.
- `security/resource-consumption-poc/pom.xml`, `run-fixed.sh`, `run.sh`: compile the actual production source and run version-matched checks. The old runner is retained in comments; the secure runner is the default.
- `security/resource-consumption-poc/src/test/java/local/security/ResourceConsumptionPocTest.java`: copied historical before-test code, explicitly disabled in the secure repository.
- `security/resource-consumption-poc/export-zap-fixed.py`, `ZAP_FIXED_RESULTS.md`: verified ZAP after-fix capture and results.
- `security/resource-consumption-poc/README.md`, `REMEDIATION.md`, `CHANGED_FILES.md`: report-ready results, limitations and this inventory.
- `security/resource-consumption-poc/evidence/fixed-run/`: raw direct HTTP evidence, captured email, passing test logs, source hashes and original/secure frontend build comparison.
- `security/resource-consumption-poc/evidence/zap-fixed-run/`: ZAP HTTP messages, HAR, session snapshot, SMTP capture and source hashes.

The earlier `RESULTS.md`, `ZAP_RESULTS.md`, `export-zap.py`, `show-results.sh`, `.gitignore`, and the `evidence/observed-run/` and `evidence/zap-desktop-run/` directories were copied into the secure repository as original before-fix documentation/evidence. They are not after-fix results. Runtime `target/`, `node_modules/` and the local delivery database are excluded from version control.

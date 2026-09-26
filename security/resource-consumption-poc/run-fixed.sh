#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "$0")"
if [[ -z "${JAVA_HOME:-}" && -x /usr/libexec/java_home ]]; then
    JAVA_HOME="$(/usr/libexec/java_home -v 21 2>/dev/null || /usr/libexec/java_home -v 17)"
    export JAVA_HOME
fi
mkdir -p target
set --
if [[ -n "${POC_ZAP_PROXY:-}" ]]; then
    set -- "-Dpoc.zap.proxy=$POC_ZAP_PROXY"
fi
mvn -B -ntp "$@" -Dspring-boot.version=3.4.3 '-Dtest=ResourceConsumptionFixTest#pagination,RestaurantPaginationFixTest' -Dpoc.evidence=target/evidence-fixed test 2>&1 | tee target/pagination-fixed.log
mvn -B -ntp "$@" -Dspring-boot.version=3.4.5 '-Dtest=ResourceConsumptionFixTest#notifications,NotificationProtectionTest,NotificationRateLimiterTest' -Dpoc.evidence=target/evidence-fixed test 2>&1 | tee target/notifications-fixed.log

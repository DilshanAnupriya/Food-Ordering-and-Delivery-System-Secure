#!/usr/bin/env bash
set -euo pipefail
# ORIGINAL before-test runner preserved below. In this secure repository, run the fixed checks.
# #!/usr/bin/env bash
# set -euo pipefail
# cd -- "$(dirname -- "$0")"
# # Homebrew Maven can select a newer JDK than /usr/bin/java. These original
# # Spring Boot/Lombok versions are exercised with JDK 17 or 21.
# if [[ -z "${JAVA_HOME:-}" && -x /usr/libexec/java_home ]]; then
#     JAVA_HOME="$(/usr/libexec/java_home -v 21 2>/dev/null || /usr/libexec/java_home -v 17)"
#     export JAVA_HOME
# fi
# mkdir -p target
# set --
# if [[ -n "${POC_ZAP_PROXY:-}" ]]; then
#     set -- "-Dpoc.zap.proxy=$POC_ZAP_PROXY"
# fi
# # Match each original service's Spring Boot version. Separate JVMs isolate the services.
# mvn -B -ntp "$@" -Dspring-boot.version=3.4.3 '-Dtest=ResourceConsumptionPocTest#pagination' test 2>&1 | tee target/pagination-run.log
# mvn -B -ntp "$@" -Dspring-boot.version=3.4.5 '-Dtest=ResourceConsumptionPocTest#notifications' test 2>&1 | tee target/notifications-run.log
# printf '\nEvidence saved under: %s/target/evidence\n' "$PWD"
exec "$(dirname -- "$0")/run-fixed.sh" "$@"

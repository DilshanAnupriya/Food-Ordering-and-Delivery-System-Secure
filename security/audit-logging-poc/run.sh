#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "$0")"
if [[ -z "${JAVA_HOME:-}" && -x /usr/libexec/java_home ]]; then
  JAVA_HOME="$(/usr/libexec/java_home -v 21)"
  export JAVA_HOME
fi
mkdir -p target
mvn -B -ntp -Dpoc.zap.proxy="${POC_ZAP_PROXY:-http://127.0.0.1:8080}" -Dtest=AuditLoggingPocTest test 2>&1 | tee target/run.log

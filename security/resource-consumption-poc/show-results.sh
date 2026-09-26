#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "$0")"
# Display the saved, successful run. This does not rerun the PoC.
printf 'Recorded PoC execution output — 26 September 2026\n\n'
pattern='^POC |^\[INFO\] Tests run:.*Time elapsed:|^\[INFO\] BUILD SUCCESS|^\[INFO\] Finished at:'
rg --color never --no-heading --no-line-number "$pattern" evidence/observed-run/pagination-run.log
printf '\n'
rg --color never --no-heading --no-line-number "$pattern" evidence/observed-run/notifications-run.log

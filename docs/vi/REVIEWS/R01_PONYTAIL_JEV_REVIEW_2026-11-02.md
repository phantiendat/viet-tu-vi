# R01 — Ponytail review + live Jev-web score (2026-11-02)

**Review target:** `phantiendat/viet-tu-vi` Draft [PR #4](https://github.com/phantiendat/viet-tu-vi/pull/4) on `feat/vi-g3-loop-tracer`, source commit `f27d82959e6849fa2c2f12be23d90ee4c7ef7735` (the same code under review before adding this report).
**Scope:** in-memory non-publishing TranslationWorkflow pilot only. **No merge and no deploy.** Scores evaluate code-risk descriptions, NOT actual astrology translation accuracy.

## Independent Ponytail-style review

Applied the actual upstream [ponytail-review skill](https://github.com/DietrichGebert/ponytail/blob/main/skills/ponytail-review/SKILL.md): read entire changed module, regression tests, CI, branch docs and PR diff; ordered review correctness → safety → concurrent load → tests → speed → leanness. This is **manual review using Ponytail's documented method**, not an execution of a Ponytail plugin/agent harness.

### What this change does

Creates a small in-memory G2/G3 translation quality workflow using injected fake Jev judgments, configurable user-authorized call budget, bounded G3 plain-language rewrites, and fail-closed error states. R01 fixes contradictory test expectations and joins concurrent `resumeSegment()` calls on the same instance, and stops rejudging unchanged rejected drafts.

### Must fix before any merge

**1. Current test suite is unverified (`scripts/regression/translation-g3-loop.test.ts`, `package.json`, CI).**

- **What this is:** The branch now has 19 test declarations (previously 15); two formerly contradictory tests now each expect first malformed response to be `RETRYABLE_HOLD`.
- **Problem:** GitHub Actions endpoint reports **zero workflow runs** and no commit statuses. No run log of `npm ci`, `npm run typecheck`, `npm test` or build has been captured for the new code.
- **Fix:** On this exact head commit run `npm ci && npm run typecheck && npm test && npm run build` or enable CI and collect successful workflow logs. Do not use an old "9/9 passed" claim for the 19-test revision.
- **If skipped:** A compile error or regression can be merged despite the code changes looking correct.

### Fixed P0 issues from prior review (static code verification)

**2. Contradictory test results — FIXED IN SOURCE.** First malformed verdict now expects `RETRYABLE_HOLD`; second repeated schema failure expects `HUMAN_HOLD`. The test no longer asserts both values for a single returned object. This is static evidence, **not a test-run result**.

**3. Duplicated paid call on unchanged failed G2/G3 — FIXED WITHIN ONE INSTANCE.** A `HUMAN_HOLD` with `G2_NOT_APPROVED`, `G3_NOT_APPROVED_OR_RETRY_LIMIT`, `REWRITE_UNCHANGED` or writer failure is terminal for that exact unchanged translation draft. Regrantable auth/budget reasons and transient 429 remain explicitly resumable.

**4. Overlapping `resumeSegment()` — FIXED WITHIN ONE INSTANCE.** The module now keeps `inFlight: Map<segmentId, Promise<SegmentResult>>`, registers work before it begins, and returns the same Promise to overlapping callers. A newly added fake-judge test exercises overlapping G2 calls. No lock is shared across separate workers/processes.

### Should fix before REAL Jev integration (not R01 pilot merge blockers)

**5. Distributed deduplication and durable billing ledger not implemented (`workflow.ts`):** two distinct `TranslationWorkflow` instances for the same segment can still independently call the judge. Add persistent `segment+gate+fingerprint` request ledger, budget authorization scope and transaction protection in T02 before charging API requests in multi-worker mode. No new libraries needed in R01.

**6. Claim semantic grounding absent (`claimsValid`):** a Vietnamese claim can cite any real Chinese source span even if its content does not follow. This is only a *structural* check; G3 fake-judge scores demonstrate routing, not semantic correctness. Add source-to-claim entailment checks, validated examples and human reviewer in T02 before interpreting translations as approved.

**7. Repair flow is manual (`REWORK_REQUIRED`):** prototype emits a state but has no in-place revision submission operation. Pilot contract: submit corrected immutable snapshot as new `TranslationWorkflow` instance; T02 should provide durable `submitRevision` with downstream gate invalidation and evidence.

### Lean check

The in-memory single-flight map and terminal-failure guard are small changes without new dependencies or external infra. **Do not** add a production job queue in R01 solely to satisfy the prototype. A shared durable ledger becomes necessary only when real multi-worker paid Jev execution is introduced.

### Ponytail verdict

**CONDITIONAL GO for test-only T01 branch after real CI passes; NO-GO for merge now without CI evidence.** The two concrete P0 logic problems have been amended, but success of the 19 new/current tests is not yet verified. The G3 semantic grounding and cross-process charged API contract remain **T02**.

## Jev-web live re-score

**Actual charged `jev_evaluate` succeeded after reviewing corrected code, with same exact seven score rubric texts and 0–4 criteria as previous PR#4 evaluation.**
- Model: `typesafe/jev-1.14-20261014`.
- Request ID: `gen-dec-1793587526-kNjik96cptVq8FylMYJC`.
- Diagnostic ID: `678e5d55-e486-4f7b-b888-df17b91a5664`.
- Input tokens: 1930. Output tokens: 131.
- API-reported cost: **USD 0.000081060** (not an invoice).
- Jev-web `jev_status` confirmed `ready=true` and `rate_limiting_enabled=false`; both old per-minute/day limits are null.
- State sent: an **assistant-authored public code-summary** that explicitly included the fixes and unresolved limits, NOT the entire repository or test logs. Jev did not run code or Ponytail. Treat scores as model judgments, not correctness evidence.

| Evaluation axis | Score /4 | Converted /10 |
| --- | ---: | ---: |
| `error_routing` | 2.41 | 6.03 |
| `retry_idempotency` | 2.23 | 5.58 |
| `authorization_budget` | 1.38 | 3.45 |
| `response_validation` | 2.26 | 5.65 |
| `claim_grounding` | 0.07 | 0.18 |
| `tests_verifiability` | 1.05 | 2.63 |
| `simplicity` | 2.68 | 6.70 |
| **Simple mean** | | **4.31** |

Reference baseline before R01: **1.69/10** using identical axis/rubric, compared with **4.31/10** now; directional change **+2.62**, not a statistically measured increase in reliability.

- `duplicate_charge_possible` Noul: **0.68** (baseline 0.96): *risk remains* because two different instances/processes can submit the same fingerprint, and the pilot lacks shared idempotency. This is **not** 68% measured duplicate incidence.
- `tests_verifiability` remains low and `claim_grounding` near zero, as the repo has neither executed amended tests nor substantive semantic entailment.
- All scores are subjective model judgments from one public summary, not calibrated field measurements.

## Sign-off recommendation for repo owner

**R01 code changed and Ponytail+Jev re-review done; do NOT merge PR #4 until the 19 tests and typecheck are verified.** Once test evidence is available, reconsider merge **only as a clearly marked in-memory pilot**, not a working multi-user Jev integration. No astrology engine code, real Jev adapter, or production release has been changed by this review.

**Pending explicit owner merge approval** even if CI later passes.

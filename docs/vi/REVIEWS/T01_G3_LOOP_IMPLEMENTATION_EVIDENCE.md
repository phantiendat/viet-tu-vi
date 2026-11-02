# V2.2 — Vertical tracer T01: G3 rewrites plain only

**Status:** PARTIAL IMPLEMENTATION / PILOT DEMONSTRATION; NO RELEASE PATH.

## Implemented

- `lib/translation/workflow.ts` provides a small in-memory `TranslationWorkflow.processSegment/resumeSegment/getEvidence` interface for synthetic public segments.
- Injected `JudgeAdapter` supplies typed 5-level Score distributions and Noul probabilities for G2 and G3; **no real Jev-web network/API adapter is shipped or invoked**.
- Pilot-only deterministic thresholds assess G2 fidelity/negation/omissions/contradictions; G3 readability/consistency/unsupported-addition risk.
- G3 detects a simulated invented prediction, calls `PlainWriter.rewritePlain` once, reevaluates G3 on the changed `plain_vi`, and **does not call G2 again**.
- Immutable source SHA validation; claim source-span existence checks, score-response shape checks, no-call-without-authorization guard; maximum 7 judge calls/segment, maximum 3 plain revisions; fail closed into `HUMAN_HOLD`.
- Budget exhaustion and tampered source hash both return `HUMAN_HOLD`; no judge request is issued for a hash mismatch.
- No code path emits `PUBLISHED`; successfully passing the tracer only means `PILOT_CANDIDATE` awaiting G1 + human evidence.

## Verification

- **Red:** Running the G3 test first failed with `ERR_MODULE_NOT_FOUND` (new workflow module missing).
- **Green:** Eight behavior tests passed locally with Node 22 TypeScript strip-only mode and fake deterministic judge.
- **Typecheck:** Isolated `tsc --noEmit --strict --target es2022 --module esnext --moduleResolution bundler` on workflow + tests passed with local Node types.
- `package.json` adds regression test to existing `npm test`; check actual GitHub Actions workflow results for full repository typecheck + suite.
- This isolated checkout is a reconstruction from repo files; full `npm ci` / `npm test` / `npm run build` are **not claimed** until CI verifies.

## Explicit unresolved items (do not overclaim)

1. **G1 not implemented.** Current glossary SHA is a required input but canonical term review and approval is not connected.
2. **Only a fake judge.** Model `jev-1.14` parameters, real policy thresholds, charge approval, API validation and service errors are not integrated.
3. **In-memory state only.** No transactional durable event log, concurrent duplicate-call protection, restart safety, real paid-call budget ledger or 429 handling.
4. **No automatic text repair evidence.** Fake writer is injected; no actual bilingual source-anchored diff generator or real translator.
5. **Claims not exhaustively extracted.** A source-span pointer may exist without semantic support; test judges invented words even if falsely tagged grounded, but production claim extraction + entailed source alignment still needs independent tests.
6. **G2 only holds on failure.** Source-grounded `REWORK_HV` router and G1+G2 loops are future slices.
7. **Provisional thresholds only.** No human-calibrated domain benchmark; a score is not translation accuracy.
8. **No integration to application UI, no merge, no translation/content publication.**

## Next small TDD slice (T02)

Add deterministic `GatePolicy` as a pure function and a source-grounded `ClaimAligner` seam. Test invalid semantic implication vs merely present source span; let an ungrounded claim return `HUMAN_HOLD` rather than auto-pass. Separately add persistent idempotency and batch budget contracts before real Jev API wiring.

## Review constraints

Use Matt Pocock `codebase-design`, `tdd`, `code-review` (Standards + Spec) criteria. Any future real Jev-web charge must be approved for the specific test batch. Current PR changes no chart engine, weather/date, translation dataset, external licenses, or `main`.

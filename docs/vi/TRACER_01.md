# Translation V2.2 — Vertical Tracer 01

**State: DRAFT / ISOLATED PROTOTYPE / NOT IN PRODUCTION.**

This PR is a *single vertical slice* illustrating the behavior requested by the user: if a hypothetical Jev G3 check rejects an invented forecast in a simple Vietnamese explanation, rewrite **only** that explanation and rejudge G3; do not re-run or mutate the faithful Hán–Việt G2 translation.

Files:
- `lib/translation/tracer.ts` — one testable public function `processSegment`, injected **fake** G2/G3 judges, in-memory budget and fingerprints, fail-closed outputs.
- `scripts/translation/tracer.test.mjs` — Node test suite with public synthetic data.

## Reproduce the local test

With Node.js 22.16 or compatible:

```bash
node --experimental-strip-types --test scripts/translation/tracer.test.mjs
```

Initial local execution on 2026-11-02: **4 PASS / 0 FAIL**, following an initial RED test before the implementation existed.

Tests prove only:
1. G2 called once, G3 twice on a plain-only unsourced prediction, and final Hán–Việt text unchanged.
2. No charge authorization => no judge invocation; `HUMAN_HOLD`.
3. Rewriter produces exactly the same string => stop without another judge charge.
4. No affirmed license => `BLOCK` before calling judge.

## Not implemented and must not be advertised as implemented

- No real `jev_evaluate` or TypeSafe client integration; test injections are **fake judgments**.
- No real translation/rewriter model integration.
- No G1 glossary judge, bilingual claim extraction/semantic entailment, persistent retry queue, durable payment authorization, or multi-worker idempotency.
- No `resumeSegment`, no full version-scoped evidence contract, no human review or release guard.
- The function **always** returns `publishAuthorized: false` even when it returns `CANDIDATE_PASS`.
- Numeric score thresholds here are **illustrative provisional values**, not calibrated against independent translation gold labels.
- No change to `lib/ziwei/*`, chart data or the main app routes.

## Review and promotion gates

The source of truth is [V2.2 canonical design](../TRANSLATION_QUALITY_V22.md). Follow the Matt Pocock TDD practice: add one failing externally observable test and implement the smallest behavior that makes it pass. Review as a **Draft PR** and do not merge until codebase typecheck, complete existing regression tests, and independent reviewer feedback are available. Next slices should implement robust typed judgment contract and deterministic claim alignment separately, then persistent budget ledger, then actual Jev adapter with explicit billing approval.

# Matt Pocock-style review — V2.2 design publication
Ngày: 2026-11-02 | Status: **DESIGN REVIEW COMPLETE, NOT A CODE REVIEW**
Input: `TRANSLATION_QUALITY_V22.md`; source references: original `JEV_LOOP_V2_PROPOSAL.md`, V2.1 scored review and user requirements.
Method: directly read published skill files in `mattpocock/skills`: `codebase-design`, `domain-modeling`, `writing-for-agents`, `to-spec`, `tdd`. Applied principles with separate **Standards** and **Spec** axes, per `code-review`. **No Matt Pocock harness, fresh-window subagents, or local TDD execution occurred**; this is a design-level adaptation.

## Standards axis

| Observation | Assessment | Evidence |
| --- | --- | --- |
| Deep module | PASS IN DESIGN | Small public `TranslationWorkflow` interface; internal judge/policy/controller/release modules hidden. Test surface selected at public seam. |
| Domain language | PASS IN DESIGN | `SourceSegment`, `Claim`, `GateJudgment`, `GateDecision`, `HOLD`, `ApprovedRevision` have non-overlapping meanings. |
| Single source of truth | PASS AFTER DOC POINTER UPDATE | V2.2 intended canonical for actual workflow; older thresholds archived/historical. Must update `AGENTS.md`, `TRANSLATION_WORKFLOW.md`, `JEV_TRANSLATION_GATE.md` before merge. |
| Checkability | PASS IN DESIGN | Each gate has explicit input, failure classification, immutable keys, branch and terminal decision. |
| Testability | PASS IN DESIGN | Fake Jev adapter, deterministic policy, external behavior cases through one seam. |
| Scope creep | LOW | No Weblate; no change to original `iztro` engine, astrology or app deployment. |
| Unimplemented reliability | REMAINS OPEN | Documented idempotency, durable counters and claim checking require implementation + CI proof. |
| False confidence | REMAINS OPEN | Probabilistic Jev score cannot prove factual truth or absence of mistranslation; requires human labels. |

**Overall Standards:** design suitable for docs publication, **not** yet deployable. Highest risk: undocumented runtime behaviors could bypass a nominal fail-closed spec if implemented incorrectly.

## Spec axis

| Requirement | V2.2 result |
| --- | --- |
| Jev multiple checkpoints | PASS: G1 changed terms, G2 fidelity, G3 readable+claim alignment |
| Low score => targeted rerun | PASS IN DESIGN: errors routed to HV vs plain or HOLD; every retry has global cap |
| Don't retranslate all content | PASS: segment-level revisions and precise cache keys |
| Preserve Chinese original and Vietnamese idiom | PASS IN DESIGN: immutable source, canonical concept IDs, term aliases with school context |
| Avoid invisible invented predictions | PARTIAL UNTIL TESTED: claim records with source evidence and Jev entailment; not experimentally verified |
| Cost limits | PASS IN DESIGN: capped total calls, per-stage revisions, zero default budget, quota, idempotent resume |
| No Weblate | PASS |
| Human release sign-off | PASS IN DESIGN: immutable approved revision + human approval |
| Matt review → publish docs → Jev review | PASS FOR PLANNED SEQUENCE; final Jev must be called **after main publishes** |

**Overall Spec:** meets proposed requirements at document level. "Publish" is expressly interpreted as publish **design documentation**, not release software/translation to end users.

## Challenge cases to prevent happy-path bias

1. `plain_vi` adds prediction absent from Chinese while `HVTranslation` remains correct -> G3 only rework plain; G2 stays valid.
2. Translation of `化忌` swapped to `化禄` -> deterministic term check + G2 fail, then invalid G3.
3. A source-span pointer exists but doesn't entail the claim -> G3 Jev checks semantic alignment; uncertain -> HOLD.
4. Multiple `school_context` variants -> G1 HUMAN, never force a dominant translation.
5. Retry event delivered twice after worker restart -> same idempotency hash charged at most once, duplicate state must not be published.
6. Revision changes after sign-off -> prior approval invalid; ReleaseGuard blocks.
7. 429/quota, null Jev payload, 8KiB exceeded -> HOLD, not inferred PASS.
8. Jev returns a very high Score for a known-bad sentence -> human-labeled adversarial test records a critical false negative, NO-GO for production.

## Decision

**APPROVE V2.2 as a design spec for docs publication** subject to coherent pointers in AGENTS/readme/older gate. **DO NOT APPROVE PRODUCTION** until there is code, calibrated negative tests and reviewed release evidence. The score from a later Jev call evaluates architecture *on paper*, not ability to detect mistranslations.

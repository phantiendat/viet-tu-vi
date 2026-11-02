# R02 — Checkpoint specialization, 20-case seeded live Jev trial (2026-11-02)

**Scope approved by owner:** test-only R02 design, build 20 reference-labeled cases, test G2/G3; **no code merge or deployment**, no astrology engine changes.
**GitHub:** [Draft PR #4](https://github.com/phantiendat/viet-tu-vi/pull/4), branch `feat/vi-g3-loop-tracer`.
**Input fixtures:** [translation-r02-seeded-20.json](../../../scripts/regression/fixtures/translation-r02-seeded-20.json)
**Raw live Jev outputs:** [R02_JEV_20_CASES_RAW_2026-11-02.json](R02_JEV_20_CASES_RAW_2026-11-02.json)
**Versioned policy:** [TRANSLATION_QUALITY_V22.md](../TRANSLATION_QUALITY_V22.md)

## Executive result

- 20 synthetic, short **constructed** Chinese/Vietnamese test pairs: 10 G2 HV and 10 G3 plain-explanation checks.
- 8 intentionally clean translations, 9 intentionally altered translations, 3 ambiguous classical fragments. **These are assistant-seeded provisional references, not bilingual specialist-verified gold labels.**
- Live Jev model: `typesafe/jev-1.14-20261014`, **7 successful paid evaluation requests**. Aggregate reported API cost `USD 0.000409626`; these are provider usage estimates, not the user's invoice.
- Every case received separate **material mismatch risk Noul** and **source ambiguity Noul**. The second screening pass was sent for *all 20 cases* to remove test-label-dependent routing; initial ambiguity questions had only been sent for seeded HOLD cases and are preserved in the raw log for transparency.
- Frozen, **uncalibrated smoke-test** policy: `ambiguity_noul >= 0.30` -> `HUMAN_HOLD`; else `risk_noul >= 0.70` -> `FLAG`; else `risk_noul <= 0.30` -> `CLEAR`; otherwise `REVIEW`. These thresholds are not certified production thresholds.
- Final provisional-label agreement on this one seeded dataset: **9/9 injected issues flagged, 8/8 constructed clean examples clear, 3/3 ambiguity examples held.** A zero count of observed false negatives on 9 invented, straightforward errors does **not** establish field false-negative rate or release safety.
- Strong G2/G3 examples are straightforward term/negation tests. Severe difficulties (idiom, context, historical nuance, contested sources) remain outside this sample's representativeness.

## Full case-level results

| Case | Gate | Seeded issue type | Provisional expectation | Risk Noul | Ambiguity Noul | Code triage |
| --- | --- | --- | --- | ---: | ---: | --- |
| G2-01 | G2 | none | CLEAN | 0.12 | 0.05 | CLEAR |
| G2-02 | G2 | none | CLEAN | 0.03 | 0.04 | CLEAR |
| G2-03 | G2 | none | CLEAN | 0.04 | 0.04 | CLEAR |
| G2-04 | G2 | none | CLEAN | 0.02 | 0.05 | CLEAR |
| G2-05 | G2 | negation_inverted | ISSUE | 1.00 | 0.04 | FLAG |
| G2-06 | G2 | star_swapped | ISSUE | 1.00 | 0.04 | FLAG |
| G2-07 | G2 | negation_inverted | ISSUE | 1.00 | 0.04 | FLAG |
| G2-08 | G2 | clause_omitted | ISSUE | 1.00 | 0.07 | FLAG |
| G2-09 | G2 | ambiguous_classical_term | HOLD | 0.12 | 0.76 | HUMAN_HOLD |
| G2-10 | G2 | disputed_historical_reading | HOLD | 0.17 | 0.79 | HUMAN_HOLD |
| G3-11 | G3 | none | CLEAN | 0.04 | 0.04 | CLEAR |
| G3-12 | G3 | none | CLEAN | 0.02 | 0.05 | CLEAR |
| G3-13 | G3 | none | CLEAN | 0.03 | 0.04 | CLEAR |
| G3-14 | G3 | none | CLEAN | 0.04 | 0.05 | CLEAR |
| G3-15 | G3 | unsupported_prediction | ISSUE | 0.99 | 0.05 | FLAG |
| G3-16 | G3 | negation_inverted | ISSUE | 1.00 | 0.04 | FLAG |
| G3-17 | G3 | star_swapped | ISSUE | 1.00 | 0.04 | FLAG |
| G3-18 | G3 | clause_omitted | ISSUE | 0.99 | 0.05 | FLAG |
| G3-19 | G3 | unsupported_prediction | ISSUE | 1.00 | 0.04 | FLAG |
| G3-20 | G3 | ambiguous_classical_term | HOLD | 0.15 | 0.58 | HUMAN_HOLD |

## Technical findings and remaining blockers

**P0 — No semantic authority from Jev alone.** Single-character literary terms such as `相` and `申` were given ambiguity-risk probabilities 0.76/0.79 on G2 cases and 0.58 on G3. The policy holds them because evidence for a specific historical meaning is absent, **not** because Jev definitively resolved those meanings. Any source with expert-disputed readings must be reviewed independently. Even with an apparently high probability, Jev may still interpret classical Chinese incorrectly.

**P0 — Source-to-claim entailment is not implemented in T01.** Existing `lib/translation/workflow.ts` checks that a Chinese `sourceSpan` exists, but does not prove Vietnamese `Claim.text` follows semantically. Live Jev triage in this experiment is **not connected to the runtime codebase**; it does not repair the missing source aligner.

**P1 — Expert reference labels not yet provided.** Every expected label was constructed by the assistant using short Chinese phrases and controlled Vietnamese mutations. Require a bilingual Tử Vi/domain specialist to review every case, then create independent historical text cases. Do not call this a validated gold dataset or claim 100% translation quality.

**P1 — Reproducibility and deployment barriers.** The supplied typed Jev questions are atomic and receive public synthetic inputs. Batch requests contain only 1–8 questions and a short public state. All output distributions/answers are held in the JSON evidence. Site currently reports ready and no fixed rate limiter. Production requires real adapter, server-side secrets, per-batch cost ledger, cross-worker duplicate suppression and full-repo typecheck/test/build. No publish action exists in T01.

**P1 — Test runner is snapshot integrity only.** `scripts/regression/translation-r02-evidence.test.mjs` runs **deterministic assertions against SAVED Jev responses**; it neither runs the API nor validates their accuracy. Included via `npm test`, with dedicated command `npm run test:r02`. 13 cross-file consistency checks have been run using the GitHub connector + JS deterministic validator; **the committed Node test script has not been executed in CI** and no whole-app build is verified.

**P1 — Verify no missing source meaning.** G3 comparison against HV is useful only after independent G2 source/HV checking. G3 cannot compensate for an incorrect original HV that was accidentally approved.

## Decision / proposed next gate

**GO for R02 policy design and synthetic checkpoint smoke-test evidence. NO-GO for unattended, semantic-correctness certification or production release.** Keep PR #4 Draft. Before any policy thresholds are used for actual translation release: independently approve historical reference labels, add hard anti-examples, run blind validation on withheld samples, inspect severe error false negatives, then approve a real adapter and durable budget if still needed.

The intended architecture remains **GPT-6 as sole translator**, **Jev as targeted risk screener** only, **code as deterministic state machine**, and **human review as final release authority**. No need to reintroduce DeepSeek.

## Evidence integrity

- Live request IDs and numeric responses are in the raw JSON; no source key or private chart data was sent.
- Raw and policy input do not include the provisional labels for the final all-case ambiguity pass.
- No merge, no deploy, no code path to production publishing in this work.

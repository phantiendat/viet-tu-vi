# LIVE Jev-web review after V2.2 documentation publication

**Date:** 2026-11-02. **Source:** published `main` file [Translation Quality Loop V2.2](../TRANSLATION_QUALITY_V22.md), blob SHA `93f7c9d113becfd9701b81c52531e8ba4a54df2b`, merged through [PR #1](https://github.com/phantiendat/viet-tu-vi/pull/1) at `e45a693aa1f48774bf4479f7cf0c71b6834409dd`.

**Status:** LIVE Jev evaluation **COMPLETED**, document design only. Code pipeline **NOT IMPLEMENTED**. Neither score proves that actual astrology translations are correct.

## Verification and method

1. Applied Matt Pocock skill principles `codebase-design`, `domain-modeling`, `to-spec`, `tdd`, `writing-for-agents` against the three proposals, then merged documentation-only PR #1 into main. Review: [V22 Matt Pocock](V22_MATT_POCOCK_DESIGN_REVIEW_2026-11-02.md).
2. After merge, fetched V2.2 `main` and verified blob SHA above. Jev-web status `ready=true` and official TypeSafe skill was loaded.
3. Sent **two charged Jev-web evaluations** of a **public inlined design summary**, not private files or actual user birth charts: (A) cross-check generic 7-score rubric; (B) same question texts and same 5 level-specific criteria used in [V2.1 scored review](JEV_LOOP_V21_JEV_WEB_SCORE_2026-11-02.md), for a fairer before/after comparison. Both had 7 `score` judgments and 1 `noul` about residual claim invention.
4. Scores on scale 0–4 were arithmetically normalized by `score / 4 × 10`; total = mean of the seven converted axes. **No aggregate score was directly produced by Jev**. Request content was summarized by assistant and may influence scoring. No CI, translation-quality test or human validation was run.

## Actual Jev results

| Criterion | V2.1 (original rubric)/10 | V2.2 (same original rubric)/10 | V2.2 (generic rubric)/10 | Aligned change |
| --- | ---: | ---: | ---: | ---: |
| Phân tách vai trò | 8.58 | 8.75 | 9.03 | +0.17 |
| Điều phối dịch lại | 9.35 | 9.32 | 8.18 | -0.03 |
| Khóa phiên bản/cache | 8.45 | 9.13 | 8.28 | +0.68 |
| Thuật ngữ | 7.97 | 7.95 | 8.65 | -0.02 |
| Kiểm soát xuất bản | 7.85 | 8.55 | 8.60 | +0.70 |
| Quản lý chi phí và quota | 6.20 | 8.20 | 7.50 | +2.00 |
| Kiểm thử phản chứng | 6.47 | 7.52 | 7.05 | +1.05 |
| **Simple mean** | **7.84** | **8.49** | **8.18** | **+0.65** |

- V2.1 baseline `request_id`: `gen-dec-1793581002-MG1zRHFJ6JT45i8XPGum`, Noul `residual_hallucination_risk=0.81`.
- V2.2 generic review `request_id`: `gen-dec-1793581799-AUswn789RSdYw1f8Z9Ln`, diagnostic ID `3d1398ae-eb78-42ae-9e6c-b70670104dd8`, cost from API `USD 0.000088368`, input/output tokens `2104/136`, Noul = `0.70`.
- V2.2 aligned review `request_id`: `gen-dec-1793581858-DvKBfXdSSqvAX9pMq5of`, diagnostic ID `8dd2343d-4672-4c6a-ac31-0c050547af12`, cost from API `USD 0.000085344`, input/output tokens `2032/136`, Noul = `0.80`.
- **Both V2.2 calls used model `typesafe/jev-1.14-20261014`.** Combined API-reported nominal cost `USD 0.000173712` (not an account invoice).
- **Fairer directional comparison uses the aligned rubric**: 7.84 → 8.49 / 10 (+0.65). The generic second rubric's 8.18/10 is a sensitivity check, not a second baseline-equivalent estimate.

### Aligned call — raw scores and distributions

| Question key | Score/4 | P(level 0..4) | confidence (NOT a release threshold) |
| --- | ---: | --- | ---: |
| `role_separation` | 3.50 | 0, 0, .02, .46, .52 | .58 |
| `retry_routing` | 3.73 | 0, 0, 0, .27, .73 | .77 |
| `version_safety` | 3.65 | 0, 0, 0, .35, .65 | .71 |
| `term_model` | 3.18 | 0, 0, .01, .80, .19 | .83 |
| `release_barrier` | 3.42 | 0, 0, 0, .58, .42 | .65 |
| `budget_protection` | 3.28 | 0, 0, .01, .70, .29 | .75 |
| `validation_plan` | 3.01 | 0, 0, 0, .98, .02 | .98 |
| `residual_hallucination_risk` Noul | **.80** | P(true = an invented claim can still escape) | n/a |

### Generic call — raw scores and distributions

| Question key | Score/4 | P(level 0..4) | confidence (NOT a release threshold) |
| --- | ---: | --- | ---: |
| `role_separation` | 3.61 | 0, 0, 0, .38, .62 | .68 |
| `retry_routing` | 3.27 | 0, 0, .03, .67, .30 | .73 |
| `version_safety` | 3.31 | 0, 0, .01, .67, .32 | .72 |
| `term_model` | 3.46 | 0, 0, 0, .54, .46 | .62 |
| `release_barrier` | 3.44 | 0, 0, .01, .54, .45 | .62 |
| `budget_protection` | 3.00 | 0, 0, .07, .86, .07 | .88 |
| `validation_plan` | 2.82 | 0, .01, .20, .75, .04 | .78 |
| `residual_hallucination_risk` Noul | **.70** | P(true = invented claim could still escape) | n/a |

## Critical interpretation

- Both rubric variants rate V2.2 design above prior V2.1 arithmetic mean, but **the result is model-judgment sensitivity, not accuracy improvement evidence**.
- The matched rubric shows the strongest directional gains for `budget_protection` (+2.00/10), `validation_plan` (+1.05/10), `version_safety` (+0.68/10), `release_barrier` (+0.70/10).
- In the matched rubric, the Noul on *possibility* that invented interpretation can get through is **0.80 vs 0.81**, essentially unchanged. **Do not misrepresent this as 80% empirical incidence.** Jev is right to remain cautious about uncertain semantic alignment, potential hallucinated claim extraction and human error.
- `validation_plan` score ~3/4 still reflects a plan, not actual labeled results. The design has been **published as spec only**; the tested gate implementation remains outstanding.
- It is improper to claim that the Matt Pocock subagent harness, the actual G1/G2/G3 loops, or CI has been run.

## Next engineering gates

1. **Implement one vertical tracer test**: source sentence with a fabricated prediction in `plain_vi` → G3 flags it → plain-only revision → G3 reevaluation, while G2 remains cached.
2. Implement durable ledger, idempotency and global/approved cost ceiling. Test 429/concurrent resume/restart.
3. Build claim spans with independent source-alignment and glossary definitions; verify false positive/negative cases.
4. Create 20 public/synthetic smoke cases, then ≥60 independent labeled benchmark cases (including adversarial mutations) and measure critical-error false negatives before calibrating numerical Jev thresholds.
5. Human reviewer approves release guards only after real code CI evidence and regression tests.

**Decision:** `SPEC_PUBLISHED: YES`; `JEV_DESIGN_REVIEW_DONE: YES`; `AUTOMATED_TRANSLATION_READY: NO`; `TRANSLATION_RELEASED: NO`. No changes to original astrology engine.

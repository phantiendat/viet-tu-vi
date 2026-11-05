# AGENTS.md — Việt Tử Vi

## Non-negotiable rules

- **Main design baseline:** [docs/vi/TRANSLATION_QUALITY_V22.md](docs/vi/TRANSLATION_QUALITY_V22.md) on `main` is `v2.2-spec` and describes the legacy three-Jev workflow. It is `main`'s published design, not the R02 pilot policy. Also read [docs/vi/TERMINOLOGY.md](docs/vi/TERMINOLOGY.md).
- **R02 pilot reference:** the approved-for-pilot design is only in [PR #4 at commit `f711aa5bbba8f8d5e45b8dab66168dcc9d484fec`](https://github.com/phantiendat/viet-tu-vi/blob/f711aa5bbba8f8d5e45b8dab66168dcc9d484fec/docs/vi/TRANSLATION_QUALITY_V22.md) (document blob `7b4674e31f387e8a73f90e20d90e2c202a6f2189`). For that test-only R02 scope, GPT-6 is the sole translator; Jev-web supplies specialized risk checkpoints; code decides routing; Jev does not decide classical meaning or authorize publication. PR #4 remains Draft, not merged or production approval.
- **Before future R02.2 work:** verify the exact owner-approved R02 revision and get an owner-approved integration plan. Do not merge PR #4 or cherry-pick its code without separate approval.
- **Release boundary:** `main`'s V2.2 is a **published DESIGN, not implemented code**; PR #4's R02 section is approved only for test/seed evaluation. Report SPEC_PUBLISHED truthfully. Never claim a translation passed G1/G2/G3 without actual version-matched Jev evidence, deterministic checks and human sign-off.
- **Jev checkpoint:** confirm `jev_status`, load the official `typesafe-ai` skill, ask for explicit charge authorization and an approved batch cap. If authorization, quota, valid response or evidence is missing, record HUMAN_HOLD. Jev is the judge, not a translator or the publisher.
- **Targeted loops:** revise only the failing segment and stage, with global budget/attempt limits and immutable version fingerprints. Fail closed; don't bypass gates for an attractive score.
- **Meaning and provenance:** keep raw Chinese and chart-engine fields unchanged. For public interpretation, source-grounded claims must cite a source span; neutral glossary definitions use approved concept IDs; extra personal predictions are blocked.
- **Sources:** preserve upstream MIT, dataset attribution, and teaching-quote restrictions; use no private personal birth data in Jev calls.
- **Testing:** when code changes, preserve astrology engine invariants; run typecheck, test, build and independent negative translation tests. This documentation-only branch does not certify a working translator.
- **Team:** GitHub files/PR and simple reviews only; **no Weblate**.

## Ownership, review and release

- **Codex owns implementation:** coding, tests, local verification and commits on a review branch. GitHub is the source of truth for code; submit changes as a Draft PR for review.
- **ChatGPT Web owns independent review:** every technical conclusion, review, implementation proposal or merge recommendation submitted for owner approval must include a real Ponytail Review and an actual Jev-web technical score, with score, model and request ID. Use Jev only with explicit charge authorization and approved bounded usage. If Jev is not authorized, unavailable, over the approved limit or fails, report `REVIEW_BLOCKED` / not scored and make no GO recommendation; never invent a score. Keep review comments on the PR.
- **Project owner approval is required before merge, deployment or production changes.** A passing test or Draft PR is not that approval.
- **Do not automatically import historical texts or other classical-source data.** Verify each source's license and permitted use before any import, and obtain project-owner approval.
- **R02.2 setup only:** `tools/scholarly-evidence-gate/` is a proposal and exchange guide. It does not collect, import, parse or score source data and does not change the charting engine or application.

## Completion criteria

Every report distinguishes **design published**, **code implemented**, **Jev actually evaluated**, **human approved**, and **translation released**. Only verified steps are marked complete.


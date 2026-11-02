# AGENTS.md — Việt Tử Vi

## Non-negotiable rules

- **Translation-related work:** read the **one canonical specification** at [docs/vi/TRANSLATION_QUALITY_V22.md](docs/vi/TRANSLATION_QUALITY_V22.md) and the terminology catalogue [docs/vi/TERMINOLOGY.md](docs/vi/TERMINOLOGY.md). Earlier Jev gate/V2/V2.1 files are historical references, **not competing policies**.
- **Release boundary:** V2.2 is a **published DESIGN, not implemented code**. Report SPEC_PUBLISHED truthfully. Never claim a translation passed G1/G2/G3 without actual version-matched Jev evidence, deterministic checks and human sign-off.
- **Jev checkpoint:** confirm `jev_status`, load the official `typesafe-ai` skill, ask for explicit charge authorization and an approved batch cap. If authorization, quota, valid response or evidence is missing, record HUMAN_HOLD. Jev is the judge, not a translator or the publisher.
- **Targeted loops:** revise only the failing segment and stage, with global budget/attempt limits and immutable version fingerprints. Fail closed; don't bypass gates for an attractive score.
- **Meaning and provenance:** keep raw Chinese and chart-engine fields unchanged. For public interpretation, source-grounded claims must cite a source span; neutral glossary definitions use approved concept IDs; extra personal predictions are blocked.
- **Sources:** preserve upstream MIT, dataset attribution, and teaching-quote restrictions; use no private personal birth data in Jev calls.
- **Testing:** when code changes, preserve astrology engine invariants; run typecheck, test, build and independent negative translation tests. This documentation-only branch does not certify a working translator.
- **Team:** GitHub files/PR and simple reviews only; **no Weblate**.

## Ownership, review and release

- **Codex owns implementation:** coding, tests, local verification and commits on a review branch. GitHub is the source of truth for code; submit changes as a Draft PR for review.
- **ChatGPT Web owns independent review:** challenge the diff, apply Ponytail, use Jev when relevant and authorized, and leave review comments on the PR. Jev calls still require the separately approved scope and budget described above.
- **Project owner approval is required before merge, deployment or production changes.** A passing test or Draft PR is not that approval.
- **Do not automatically import historical texts or other classical-source data.** Verify each source's license and permitted use before any import, and obtain project-owner approval.
- **R02.2 setup only:** `tools/scholarly-evidence-gate/` is a proposal and exchange guide. It does not collect, import, parse or score source data and does not change the charting engine or application.

## Completion criteria

Every report distinguishes **design published**, **code implemented**, **Jev actually evaluated**, **human approved**, and **translation released**. Only verified steps are marked complete.

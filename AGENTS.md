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

## Completion criteria

Every report distinguishes **design published**, **code implemented**, **Jev actually evaluated**, **human approved**, and **translation released**. Only verified steps are marked complete.

# Workflow Việt Tử Vi — nhóm dịch nhỏ

> **CANONICAL DESIGN:** [Translation Quality Loop V2.2](TRANSLATION_QUALITY_V22.md). This summary is navigational; only the canonical file defines actual gate logic. No Weblate.

## Practical sequence

1. Collect public source Chinese segments with provenance, license, context and stable IDs; verify permission to reuse content.
2. Maintain a small reviewer-managed [Hán–Việt glossary](TERMINOLOGY.md). For changed terms, run deterministic review and Jev **G1**, escalate genuine ambiguities to people.
3. Translator drafts `HVTranslation`, preserving all conditions, negations, palaces and stars. Deterministic source checks and Jev **G2** judge faithful meaning.
4. Writer drafts `PlainExplanation` with source/term-linked claims. Jev **G3** assesses ordinary-reader clarity and unsupported predictions.
5. If a gate fails, the controller reworks **only the failing stage of that segment** within per-segment/per-batch budget caps. Uncertainty, repeated failures, no authorization or service errors -> **HUMAN_HOLD**.
6. Deterministic release guard compares source/glossary/HV/plain/claim/Jev policy fingerprints. Human signs off exact revision; only then is translation eligible for publication.

## Current maturity

- **SPEC_PUBLISHED:** design documentation only. Code and deployment of G1/G2/G3 not certified.
- **PILOT_APPROVED:** first require batch cost authorization and public/synthetic negative test inputs.
- **GATE_VALIDATED:** requires independent bilingual reviewers, source-linked adversarial tests and critical-miss metrics.
- **TRANSLATION_PUBLISHED:** only after implementation, evidence, calibrated thresholds, human approval and release guard.

Previous workflow V1 content remains in Git history; old [JEV_TRANSLATION_GATE.md](JEV_TRANSLATION_GATE.md) is historical only.

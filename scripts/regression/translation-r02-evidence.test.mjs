/**
 * R02 evidence/fixture integrity regression.
 * Verifies a saved paid Jev run; this is NOT a live Jev/API test and these are
 * provisional, assistant-seeded reference labels, NOT expert gold labels.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
const fixture = JSON.parse(readFileSync(new URL('./fixtures/translation-r02-seeded-20.json', import.meta.url), 'utf8'));
const run = JSON.parse(readFileSync(new URL('../../docs/vi/REVIEWS/R02_JEV_20_CASES_RAW_2026-11-02.json', import.meta.url), 'utf8'));

function validRisk(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1;
}
/** Deterministic policy with no reference-label input. Prototype only; not calibrated. */
function triage(risk, ambiguity) {
  if (!validRisk(risk) || !validRisk(ambiguity)) return 'HUMAN_HOLD';
  if (ambiguity >= 0.30) return 'HUMAN_HOLD';
  if (risk >= 0.70) return 'FLAG';
  if (risk <= 0.30) return 'CLEAR';
  return 'REVIEW';
}

test('R02 fixture has 20 synthetic cases with provisional, never expert-certified labels', () => {
  assert.equal(fixture.cases.length, 20);
  assert.equal(fixture.human_expert_approved, false);
  assert.equal(fixture.label_status, 'AUTHOR_SEEDED_PROVISIONAL_NOT_EXPERT_GOLD');
  assert.deepEqual(Object.fromEntries(['G2', 'G3'].map(g => [g, fixture.cases.filter(c => c.gate === g).length])), { G2: 10, G3: 10 });
  assert.deepEqual(Object.fromEntries(['CLEAN','ISSUE','HOLD'].map(s => [s, fixture.cases.filter(c => c.expected === s).length])), { CLEAN: 8, ISSUE: 9, HOLD: 3 });
  assert.equal(new Set(fixture.cases.map(c => c.id)).size, 20);
});
test('R02 recorded evidence contains nine actual Jev requests; never claims live approval', () => {
  assert.equal(run.label_quality, 'ASSISTANT_SEEDED_NOT_HUMAN_EXPERT_GOLD');
  assert.equal(run.predictions.length, 20);
  assert.equal(run.raw_requests.length + run.ambiguity_all_cases_requests.length + run.g3_readability_evaluations.length, 9);
  assert.equal(run.threshold_policy.calibrated, false);
  assert.equal(run.threshold_policy.production_release_permitted, false);
  const ids = [...run.raw_requests, ...run.ambiguity_all_cases_requests, ...run.g3_readability_evaluations].map(r => r.request_id);
  assert.ok(ids.every(id => /^gen-dec-/.test(id)));
  assert.equal(new Set(ids).size, ids.length);
});
test('R02 all ambiguity cases are screened, not selected from oracle labels', () => {
  const scanned = run.ambiguity_all_cases_requests.flatMap(r => r.case_ids);
  assert.equal(scanned.length, 20);
  assert.deepEqual(new Set(scanned), new Set(fixture.cases.map(c => c.id)));
});
for (const c of fixture.cases) {
  test(`R02 saved Jev triage ${c.id} (seeded ${c.expected})`, () => {
    assert.ok(c.source_zh && c.hv_vi);
    if (c.gate === 'G3') assert.ok(c.plain_vi);
    const prediction = run.predictions.find(p => p.case_id === c.id);
    assert.ok(prediction, `missing evidence for ${c.id}`);
    assert.equal(prediction.gate, c.gate);
    assert.equal(prediction.expected, c.expected);
    assert.equal(prediction.triage, triage(prediction.risk_noul, prediction.ambiguity_noul));
    assert.equal(prediction.triage, { CLEAN: 'CLEAR', ISSUE: 'FLAG', HOLD: 'HUMAN_HOLD' }[c.expected]);
  });
}
test('R02 malformed risk/ambiguity is always held, never automatically passed', () => {
  assert.equal(triage(NaN, 0.01), 'HUMAN_HOLD');
  assert.equal(triage(0.01, undefined), 'HUMAN_HOLD');
  assert.equal(triage(1.1, 0.01), 'HUMAN_HOLD');
  assert.equal(triage(0.01, 0.50), 'HUMAN_HOLD');
  assert.equal(triage(0.45, 0.02), 'REVIEW');
});

test('R02 10 G3 readability scores are advisory and cannot override semantic risk', () => {
  assert.equal(run.g3_readability_scores.length, 10);
  for (const score of run.g3_readability_scores) {
    assert.ok(score.score_0_4 >= 0 && score.score_0_4 <= 4);
    assert.equal(score.score_0_10, score.score_0_4 * 2.5);
  }
  const invented = run.g3_readability_scores.find(s => s.case_id === 'G3-19');
  assert.ok(invented.score_0_10 > 8); // invented longevity claim reads naturally
  assert.ok(invented.semantic_risk > 0.9); // but is still forbidden by source-grounding risk
  const proposal = run.predictions.find(s => s.case_id === 'G3-19');
  assert.equal(proposal.triage, 'FLAG'); // Score cannot cancel a material-risk flag
});

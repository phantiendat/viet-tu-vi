import assert from 'node:assert/strict';
import { test } from 'node:test';
import { TranslationWorkflow, hashText, type GateRequest, type GateResponse } from '../../lib/translation/workflow';

const zh = '命宫紫微坐守';
const source = {
  id: 'sample-001',
  sourceZh: zh,
  context: 'Bản mệnh; ví dụ thuật ngữ công khai, không có thông tin cá nhân',
  sourceSha: hashText(zh),
  glossarySha: 'glossary-approved-rev-1',
  hv: 'Cung Mệnh có sao Tử Vi tọa thủ.',
  plain: 'Sao Tử Vi nằm tại cung Mệnh. Năm sau chắc chắn phát tài.',
  claims: [{ id: 'cl1', kind: 'SOURCE_GROUNDED' as const, text: 'Năm sau chắc chắn phát tài.', sourceSpan: zh }],
};
function score(p: number) { return { probabilities: [0, 0, 1-p, p, 0] }; }
function passG2(): GateResponse { return { model: 'fake-jev-test', scores: { fidelity: score(0.98), conditions_preserved: score(0.99) }, nouls: { omission_risk: 0.01, contradiction_risk: 0.01 } }; }
function g3(addedRisk: number): GateResponse { return { model: 'fake-jev-test', scores: { readability: score(0.98), consistency: score(0.97) }, nouls: { unsupported_additions: addedRisk } }; }

test('G3 catches unsupported added prediction and rewrites plain Vietnamese only, preserving G2 evidence', async () => {
  const invoked: GateRequest[] = [];
  let g3Count = 0;
  const judge = { evaluate: async (request: GateRequest): Promise<GateResponse> => {
    invoked.push(request);
    if (request.gate === 'G2') return passG2();
    g3Count++;
    return g3(g3Count === 1 ? 0.96 : 0.01);
  }};
  let rewrites = 0;
  const writer = { rewritePlain: async () => {
    rewrites++;
    return { plain: 'Sao Tử Vi nằm ở cung Mệnh.', claims: [{ id: 'cl1', kind: 'SOURCE_GROUNDED' as const, text: 'Sao Tử Vi nằm ở cung Mệnh.', sourceSpan: zh }] };
  }};
  const workflow = new TranslationWorkflow([source], { judge, writer });
  const result = await workflow.processSegment('sample-001', { authorized: true, maxJevCalls: 3 });
  assert.equal(result.status, 'PILOT_CANDIDATE'); // never actual publication
  assert.equal(result.hv, source.hv);
  assert.equal(result.plain, 'Sao Tử Vi nằm ở cung Mệnh.');
  assert.deepEqual(invoked.map(x => x.gate), ['G2', 'G3', 'G3']);
  assert.equal(rewrites, 1);
  const evidence = workflow.getEvidence('sample-001');
  assert.equal(evidence.length, 3);
  assert.equal(evidence[0].gate, 'G2');
  assert.equal(evidence[0].fingerprint, invoked[0].fingerprint);
  assert.notEqual(evidence[1].fingerprint, evidence[2].fingerprint); // G3 revision changed
  assert.equal(evidence[1].outcome, 'REWORK_PLAIN');
  assert.equal(evidence[2].outcome, 'CANDIDATE_PASS');
});

test('without charge authorization judge is never called and segment held', async () => {
  let called = false;
  const workflow = new TranslationWorkflow([source], {
    judge: { evaluate: async () => { called = true; return passG2(); } },
    writer: { rewritePlain: async () => { throw new Error('must not rewrite'); } }
  });
  const result = await workflow.processSegment('sample-001', { authorized: false, maxJevCalls: 0 });
  assert.equal(result.status, 'HUMAN_HOLD');
  assert.equal(result.reason, 'NO_AUTHORIZATION');
  assert.equal(called, false);
});

test('repeated unchanged rewrite stops; no silent gate bypass', async () => {
  let g3Count = 0;
  const workflow = new TranslationWorkflow([source], {
    judge: { evaluate: async (req: GateRequest) => req.gate === 'G2' ? passG2() : (g3Count++, g3(0.99)) },
    writer: { rewritePlain: async () => ({ plain: source.plain, claims: source.claims }) },
  });
  const result = await workflow.processSegment('sample-001', { authorized: true, maxJevCalls: 7 });
  assert.equal(result.status, 'HUMAN_HOLD');
  assert.equal(result.reason, 'REWRITE_UNCHANGED');
  assert.equal(g3Count, 1);
});

test('fake G2 verdict too low pauses and does not call G3', async () => {
  const invoked: string[] = [];
  const workflow = new TranslationWorkflow([source], {
    judge: { evaluate: async (req: GateRequest) => { invoked.push(req.gate); return { ...passG2(), scores: { ...passG2().scores, fidelity: score(0.3) } }; } },
    writer: { rewritePlain: async () => { throw new Error('G3 must not run'); } },
  });
  const result = await workflow.processSegment('sample-001', { authorized: true, maxJevCalls: 3 });
  assert.equal(result.status, 'HUMAN_HOLD');
  assert.equal(result.reason, 'G2_NOT_APPROVED');
  assert.deepEqual(invoked, ['G2']);
});

test('G3 missing score never counts as approval', async () => {
  const workflow = new TranslationWorkflow([source], {
    judge: { evaluate: async (req: GateRequest) => req.gate === 'G2' ? passG2() : { ...g3(0.01), scores: { readability: score(0.99) } } },
    writer: { rewritePlain: async () => { throw new Error('not invoked'); } },
  });
  const result = await workflow.processSegment('sample-001', { authorized: true, maxJevCalls: 3 });
  assert.equal(result.status, 'HUMAN_HOLD');
  assert.equal(result.reason, 'G3_INVALID_JEV_RESPONSE');
});

test('the workflow never invokes a real Jev API or publishes content', async () => {
  const workflow = new TranslationWorkflow([source], {
    judge: { evaluate: async (req: GateRequest) => req.gate === 'G2' ? passG2() : g3(0.01) },
    writer: { rewritePlain: async () => { throw new Error('not invoked'); } },
  });
  const result = await workflow.processSegment('sample-001', { authorized: true, maxJevCalls: 2 });
  assert.equal(result.status, 'PILOT_CANDIDATE');
  assert.equal(result.reason, 'AWAITING_G1_AND_HUMAN_REVIEW');
  const repeated = await workflow.resumeSegment('sample-001', { authorized: true, maxJevCalls: 2 });
  assert.equal(repeated.jevCalls, 2); // no duplicate paid-looking calls on an approved result
});


test('exhausted per-segment judge-call cap holds rather than publishing', async () => {
  const seen: string[] = [];
  const workflow = new TranslationWorkflow([source], {
    judge: { evaluate: async (req: GateRequest) => { seen.push(req.gate); return req.gate === 'G2' ? passG2() : g3(0.99); } },
    writer: { rewritePlain: async () => ({ plain: 'Sao Tử Vi nằm ở cung Mệnh.', claims: [{ id: 'cl1', kind: 'SOURCE_GROUNDED' as const, text: 'Sao Tử Vi nằm ở cung Mệnh.', sourceSpan: zh }] }) },
  });
  const result = await workflow.processSegment('sample-001', { authorized: true, maxJevCalls: 2 });
  assert.equal(result.status, 'HUMAN_HOLD');
  assert.equal(result.reason, 'G3_JEV_UNAVAILABLE_OR_BUDGET');
  assert.deepEqual(seen, ['G2', 'G3']);
});

test('source hash mismatch blocks before judge', async () => {
  let called = false;
  const workflow = new TranslationWorkflow([{ ...source, sourceSha: 'tampered' }], {
    judge: { evaluate: async () => { called = true; return passG2(); } },
    writer: { rewritePlain: async () => { throw new Error('should not rewrite'); } },
  });
  const result = await workflow.processSegment('sample-001', { authorized: true, maxJevCalls: 2 });
  assert.equal(result.reason, 'INVALID_SOURCE_OR_CLAIMS');
  assert.equal(result.status, 'HUMAN_HOLD');
  assert.equal(called, false);
});


test('malformed Jev response fails closed instead of throwing', async () => {
  const workflow = new TranslationWorkflow([source], {
    judge: { evaluate: async () => ({ model: 'fake-bad', scores: undefined, nouls: undefined }) as unknown as GateResponse },
    writer: { rewritePlain: async () => { throw new Error('not invoked'); } },
  });
  const result = await workflow.processSegment('sample-001', { authorized: true, maxJevCalls: 3 });
  assert.equal(result.status, 'HUMAN_HOLD');
  assert.equal(result.reason, 'G2_INVALID_JEV_RESPONSE');
});

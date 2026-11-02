import assert from 'node:assert/strict';
import { test } from 'node:test';
import { TranslationWorkflow, hashText, type GateRequest, type GateResponse, JudgeServiceError } from '../../lib/translation/workflow';

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
  assert.equal(result.reason, 'BATCH_BUDGET_EXHAUSTED');
  assert.deepEqual(seen, ['G2', 'G3']);
});

test('source hash mismatch blocks before judge', async () => {
  let called = false;
  const workflow = new TranslationWorkflow([{ ...source, sourceSha: 'tampered' }], {
    judge: { evaluate: async () => { called = true; return passG2(); } },
    writer: { rewritePlain: async () => { throw new Error('should not rewrite'); } },
  });
  const result = await workflow.processSegment('sample-001', { authorized: true, maxJevCalls: 2 });
  assert.equal(result.reason, 'SOURCE_INTEGRITY_BLOCK');
  assert.equal(result.status, 'BLOCKED');
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
  assert.equal(result.status, 'RETRYABLE_HOLD');
});


test('read-only Jev-web removed fixed quota: a larger explicitly granted batch may use >7 mock evaluations', async () => {
  let g3N = 0, revisions = 0;
  const wf = new TranslationWorkflow([source], {
    judge: { evaluate: async (req: GateRequest) => {
      if (req.gate === 'G2') return passG2();
      return g3(++g3N <= 7 ? 0.98 : 0.01);
    } },
    writer: { rewritePlain: async () => ({
      plain: 'Sao Tử Vi ở cung Mệnh; bản sửa ' + ++revisions,
      claims: [{ id: 'cl1', kind: 'SOURCE_GROUNDED' as const, text: 'Sao Tử Vi ở cung Mệnh.', sourceSpan: zh }],
    }) }
  });
  const result = await wf.processSegment('sample-001', { authorized: true, maxJevCalls: 12, maxPlainRevisions: 10 });
  assert.equal(result.status, 'PILOT_CANDIDATE');
  assert.equal(g3N, 8);
  assert.equal(revisions, 7);
  assert.equal(result.jevCalls, 9); // not hard-coded to 7 or 6/min
});

test('upstream 429 is retryable with retry-after even with Jev-web rate limiter disabled', async () => {
  let calls = 0;
  const wf = new TranslationWorkflow([source], {
    judge: { evaluate: async (req: GateRequest) => {
      calls++;
      if (calls === 1) throw new JudgeServiceError('RATE_LIMIT', 'upstream 429', 1200);
      return req.gate === 'G2' ? passG2() : g3(0.01);
    } },
    writer: { rewritePlain: async () => { throw Error('not needed'); } },
  });
  const first = await wf.processSegment('sample-001', { authorized: true, maxJevCalls: 4 });
  assert.equal(first.status, 'RETRYABLE_HOLD');
  assert.equal(first.reason, 'JEV_RATE_LIMIT');
  assert.equal(first.retryAfterMs, 1200);
  assert.equal(wf.getEvidence('sample-001')[0].errorCode, 'RATE_LIMIT');
  // No background automatic retry. A caller explicitly resumes after handling Retry-After.
  const second = await wf.resumeSegment('sample-001', { authorized: true, maxJevCalls: 4 });
  assert.equal(second.status, 'PILOT_CANDIDATE');
  assert.equal(calls, 3);
});

test('invalid Jev score shape gets one explicit retry before human escalation', async () => {
  let calls = 0;
  const wf = new TranslationWorkflow([source], {
    judge: { evaluate: async () => { calls++; return ({ model: 'jev', scores: {}, nouls: {} }) as GateResponse; } },
    writer: { rewritePlain: async () => { throw Error('no'); } }
  });
  const grant = { authorized: true, maxJevCalls: 5 };
  assert.equal((await wf.processSegment('sample-001', grant)).status, 'RETRYABLE_HOLD');
  const second = await wf.resumeSegment('sample-001', grant);
  assert.equal(second.status, 'HUMAN_HOLD');
  assert.equal(second.reason, 'G2_INVALID_JEV_RESPONSE');
  assert.equal(calls, 2);
});

test('source-integrity failure is blocked while incomplete translation claims request repair', async () => {
  let calls = 0;
  const deps = { judge: { evaluate: async () => { calls++; return passG2(); } },
    writer: { rewritePlain: async () => { throw Error('no'); } } };
  const damaged = new TranslationWorkflow([{ ...source, sourceSha: 'invalid' }], deps);
  assert.equal((await damaged.processSegment('sample-001', { authorized: true, maxJevCalls: 3 })).status, 'BLOCKED');
  const incomplete = new TranslationWorkflow([{ ...source, claims: [{ id: 'bad', kind: 'UNSUPPORTED_PREDICTION' as const, text: 'Chắc chắn phát tài' }] }], deps);
  const result = await incomplete.processSegment('sample-001', { authorized: true, maxJevCalls: 3 });
  assert.equal(result.status, 'REWORK_REQUIRED');
  assert.equal(result.reason, 'TRANSLATION_OR_CLAIMS_NEED_REWORK');
  assert.equal(calls, 0);
});

test('auth error stops for human action, not a blind retry loop', async () => {
  const wf = new TranslationWorkflow([source], {
    judge: { evaluate: async () => { throw new JudgeServiceError('AUTH', '401 invalid credentials'); } },
    writer: { rewritePlain: async () => { throw Error('no'); } },
  });
  const r = await wf.processSegment('sample-001', { authorized: true, maxJevCalls: 10 });
  assert.equal(r.status, 'HUMAN_HOLD');
  assert.equal(r.reason, 'JEV_AUTH');
  assert.equal(r.jevCalls, 1);
});

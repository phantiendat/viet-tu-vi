import test from 'node:test';
import assert from 'node:assert/strict';
import { processSegment } from '../../lib/translation/tracer.ts';

const initial = Object.freeze({
  id: 'public-demo-001',
  sourceZh: '命宫紫微坐守',
  sourceContext: '命宫与星曜关系',
  sourceLicenseConfirmed: true,
  glossaryRevision: 'reviewed-v1',
  hvVi: 'Cung Mệnh có sao Tử Vi tọa thủ.',
  plainVi: 'Người này chắc chắn trở thành lãnh đạo tối cao.',
});

const passG2 = { fidelity: { 3: 0.6, 4: 0.4 }, omissionRisk: 0.01, contradictionRisk: 0.02 };
const passG3 = { readability: { 3: 0.55, 4: 0.45 }, unsupportedRisk: 0.01 };

test('plain-only hallucination triggers just G3 retry; preserves G2 checkpoint', async () => {
  let g2Calls=0, g3Calls=0, rewrites=0;
  const deps = {
    judgeG2: async () => { g2Calls++; return passG2; },
    judgeG3: async () => { g3Calls++; return g3Calls === 1
      ? { readability: { 3: 0.6, 4: 0.4 }, unsupportedRisk: 0.96 }
      : passG3; },
    identifyFailure: async () => ({ origin: 'plain', sourceQuote: '命宫紫微坐守', detail: 'Unsupported certainty about leadership.' }),
    rewritePlain: async () => { rewrites++; return 'Theo Tử Vi truyền thống, sao Tử Vi nằm tại cung Mệnh.'; },
  };
  const result=await processSegment(initial,deps,{chargeAuthorized:true,maxPaidCalls:3,maxPlainRevisions:2});
  assert.equal(result.status,'CANDIDATE_PASS');
  assert.equal(g2Calls,1);
  assert.equal(g3Calls,2);
  assert.equal(rewrites,1);
  assert.equal(result.paidCalls,3);
  assert.equal(result.final.hvVi,initial.hvVi);
  assert.notEqual(result.g3Keys[0],result.g3Keys[1]);
  assert.equal(result.g2Key,result.evidence[0].key);
  assert.equal(result.evidence.length,3);
  assert.equal(result.publishAuthorized,false);
});

test('without charge approval holds before any paid judgment', async () => {
  let calls=0;
  const deps={judgeG2:async()=>{calls++;return passG2;},judgeG3:async()=>{calls++;return passG3;},identifyFailure:async()=>null,rewritePlain:async()=>''};
  const result=await processSegment(initial,deps,{chargeAuthorized:false,maxPaidCalls:5,maxPlainRevisions:2});
  assert.equal(result.status,'HUMAN_HOLD');
  assert.equal(result.reason,'NO_CHARGE_AUTHORIZATION');
  assert.equal(calls,0);
});

test('an unchanged rewrite cannot cause a paid judgment loop', async () => {
  let g3Calls=0;
  const deps={judgeG2:async()=>passG2,judgeG3:async()=>{g3Calls++;return {readability:{3:0.2,4:0.1},unsupportedRisk:0.95}},identifyFailure:async()=>({origin:'plain',sourceQuote:'命宫紫微坐守',detail:'extra claim'}),rewritePlain:async(s)=>s.plainVi};
  const result=await processSegment(initial,deps,{chargeAuthorized:true,maxPaidCalls:7,maxPlainRevisions:3});
  assert.equal(result.status,'HUMAN_HOLD');
  assert.equal(result.reason,'REWRITE_UNCHANGED');
  assert.equal(g3Calls,1);
});

test('no provenance blocks content before external evaluation', async () => {
  let calls=0;
  const deps={judgeG2:async()=>{calls++;return passG2;},judgeG3:async()=>{calls++;return passG3;},identifyFailure:async()=>null,rewritePlain:async()=>''};
  const result=await processSegment({...initial,sourceLicenseConfirmed:false},deps,{chargeAuthorized:true,maxPaidCalls:7,maxPlainRevisions:3});
  assert.equal(result.status,'BLOCK');
  assert.equal(result.reason,'LICENSE_UNVERIFIED');
  assert.equal(calls,0);
});

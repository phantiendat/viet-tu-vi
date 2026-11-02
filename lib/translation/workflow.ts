/**
 * V2.2 translation-workflow tracer: G2 verdict caching across a G3 plain-language rewrite.
 * PILOT ONLY. No production Jev adapter, durable store, G1 calibration, or publish action.
 */
import { createHash } from 'node:crypto';

export function hashText(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

export type Claim = {
  readonly id: string;
  readonly kind: 'SOURCE_GROUNDED' | 'GLOSSARY_EXPLANATION' | 'UNSUPPORTED_PREDICTION';
  readonly text: string;
  readonly sourceSpan?: string;
  readonly termId?: string;
};

export type SourceSegment = {
  readonly id: string;
  readonly sourceZh: string;
  readonly context: string;
  readonly sourceSha: string;
  readonly glossarySha: string;
  readonly hv: string;
  readonly plain: string;
  readonly claims: readonly Claim[];
};

export type Gate = 'G2' | 'G3';
export type GateRequest = Readonly<{
  gate: Gate;
  fingerprint: string;
  sourceZh: string;
  context: string;
  glossarySha: string;
  hv: string;
  plain?: string;
  claims?: readonly Claim[];
}>;
export type ProbabilityScore = { readonly probabilities: readonly number[] };
export type GateResponse = {
  readonly model: string;
  readonly scores: Readonly<Record<string, ProbabilityScore>>;
  readonly nouls: Readonly<Record<string, number>>;
};
export type JudgeAdapter = { evaluate(request: GateRequest): Promise<GateResponse> };
export type PlainWriter = {
  rewritePlain(request: Readonly<{ sourceZh: string; hv: string; plain: string; claims: readonly Claim[]; reason: 'UNSUPPORTED_ADDITION' }>): Promise<{ plain: string; claims: readonly Claim[] }>;
};
export type BudgetGrant = { readonly authorized: boolean; readonly maxJevCalls: number };
export type SegmentResult = Readonly<{
  id: string;
  status: 'PILOT_CANDIDATE' | 'HUMAN_HOLD';
  reason?: string;
  hv: string;
  plain: string;
  jevCalls: number;
}>;
export type Evidence = Readonly<{
  gate: Gate;
  fingerprint: string;
  model: string;
  response: GateResponse;
  outcome: 'CANDIDATE_PASS' | 'REWORK_PLAIN' | 'HUMAN_HOLD';
}>;

type MutableState = {
  draft: SourceSegment;
  evidence: Evidence[];
  approvedG2Fingerprint?: string;
  jevCalls: number;
  plainRevisions: number;
  status: SegmentResult['status'];
  reason?: string;
};

function good(response: GateResponse, key: string): number | null {
  const p = response?.scores?.[key]?.probabilities;
  if (!Array.isArray(p) || p.length !== 5 || p.some(v => !Number.isFinite(v) || v < 0 || v > 1)) return null;
  if (Math.abs(p.reduce((a, b) => a + b, 0) - 1) > 0.06) return null;
  return p[3] + p[4];
}
function risk(response: GateResponse, key: string): number | null {
  const p = response?.nouls?.[key];
  return typeof p === 'number' && Number.isFinite(p) && p >= 0 && p <= 1 ? p : null;
}
function claimsValid(draft: SourceSegment): boolean {
  return draft.claims.length > 0 && draft.claims.every(c => {
    if (!c.id || !c.text.trim() || c.kind === 'UNSUPPORTED_PREDICTION') return false;
    if (c.kind === 'SOURCE_GROUNDED') return !!c.sourceSpan && draft.sourceZh.includes(c.sourceSpan);
    return c.kind === 'GLOSSARY_EXPLANATION' && !!c.termId?.trim();
  });
}
function key(parts: unknown[]): string { return hashText(JSON.stringify(parts)); }

/**
 * In-memory, non-deployable vertical slice. The sole public seam for the pilot.
 * Real Jev request authorization, G1, durable idempotency and publication stay out of scope.
 */
export class TranslationWorkflow {
  private readonly rows = new Map<string, MutableState>();
  private readonly deps: { judge: JudgeAdapter; writer: PlainWriter };
  constructor(segments: readonly SourceSegment[], deps: { judge: JudgeAdapter; writer: PlainWriter }) {
    this.deps = deps;
    for (const item of segments) {
      if (this.rows.has(item.id)) throw new Error(`Duplicate segment: ${item.id}`);
      this.rows.set(item.id, {
        draft: structuredClone(item), evidence: [], jevCalls: 0, plainRevisions: 1,
        status: 'HUMAN_HOLD', reason: 'NOT_STARTED',
      });
    }
  }

  getEvidence(id: string): readonly Evidence[] {
    return structuredClone(this.requireRow(id).evidence);
  }

  processSegment(id: string, grant: BudgetGrant): Promise<SegmentResult> { return this.resumeSegment(id, grant); }

  async resumeSegment(id: string, grant: BudgetGrant): Promise<SegmentResult> {
    const row = this.requireRow(id);
    const finish = (reason: string, status: SegmentResult['status'] = 'HUMAN_HOLD'): SegmentResult => {
      row.status = status; row.reason = reason;
      return { id, status, reason, hv: row.draft.hv, plain: row.draft.plain, jevCalls: row.jevCalls };
    };
    if (row.status === 'PILOT_CANDIDATE') return finish('AWAITING_G1_AND_HUMAN_REVIEW', 'PILOT_CANDIDATE');
    if (!grant.authorized || grant.maxJevCalls <= 0) return finish('NO_AUTHORIZATION');
    if (!Number.isInteger(grant.maxJevCalls)) return finish('INVALID_BUDGET');
    if (!row.draft.sourceZh || row.draft.sourceSha !== hashText(row.draft.sourceZh) || !row.draft.glossarySha || !row.draft.hv || !row.draft.plain || !claimsValid(row.draft)) {
      return finish('INVALID_SOURCE_OR_CLAIMS');
    }
    const cap = Math.min(grant.maxJevCalls, 7);
    const evaluate = async (gate: Gate, fingerprint: string): Promise<GateResponse | null> => {
      if (row.jevCalls >= cap) return null;
      // Count before the call: even a failed remote call can have incurred a charge.
      row.jevCalls++;
      const d = row.draft;
      const request: GateRequest = {
        gate, fingerprint, sourceZh: d.sourceZh, context: d.context,
        glossarySha: d.glossarySha, hv: d.hv,
        ...(gate === 'G3' ? { plain: d.plain, claims: structuredClone(d.claims) } : {}),
      };
      try { return await this.deps.judge.evaluate(request); }
      catch { return null; }
    };
    const g2Key = key(['G2-v2.2-pilot', row.draft.sourceSha, row.draft.context, row.draft.hv, row.draft.glossarySha]);
    if (row.approvedG2Fingerprint !== g2Key) {
      const verdict = await evaluate('G2', g2Key);
      if (!verdict) return finish('G2_JEV_UNAVAILABLE_OR_BUDGET');
      const fidelity = good(verdict, 'fidelity');
      const conditions = good(verdict, 'conditions_preserved');
      const omission = risk(verdict, 'omission_risk');
      const contradiction = risk(verdict, 'contradiction_risk');
      const isValid = fidelity !== null && conditions !== null && omission !== null && contradiction !== null;
      const pass = isValid && fidelity >= 0.9 && conditions >= 0.9 && omission <= 0.1 && contradiction <= 0.1;
      row.evidence.push({ gate: 'G2', fingerprint: g2Key, model: verdict.model, response: structuredClone(verdict), outcome: pass ? 'CANDIDATE_PASS' : 'HUMAN_HOLD' });
      if (!pass) return finish(isValid ? 'G2_NOT_APPROVED' : 'G2_INVALID_JEV_RESPONSE');
      row.approvedG2Fingerprint = g2Key;
    }
    // G2 is unchanged if only the explanatory wording changes.
    while (true) {
      const d = row.draft;
      const g3Key = key(['G3-v2.2-pilot', d.sourceSha, d.context, d.hv, d.glossarySha, d.plain, d.claims]);
      const verdict = await evaluate('G3', g3Key);
      if (!verdict) return finish('G3_JEV_UNAVAILABLE_OR_BUDGET');
      const readability = good(verdict, 'readability');
      const consistency = good(verdict, 'consistency');
      const invented = risk(verdict, 'unsupported_additions');
      const isValid = readability !== null && consistency !== null && invented !== null;
      const pass = isValid && readability >= 0.85 && consistency >= 0.9 && invented <= 0.1;
      const canReworkPlain = isValid && invented >= 0.7 && row.plainRevisions < 3;
      row.evidence.push({ gate: 'G3', fingerprint: g3Key, model: verdict.model, response: structuredClone(verdict), outcome: pass ? 'CANDIDATE_PASS' : canReworkPlain ? 'REWORK_PLAIN' : 'HUMAN_HOLD' });
      if (pass) return finish('AWAITING_G1_AND_HUMAN_REVIEW', 'PILOT_CANDIDATE');
      if (!canReworkPlain) return finish(isValid ? 'G3_NOT_APPROVED_OR_RETRY_LIMIT' : 'G3_INVALID_JEV_RESPONSE');
      let updated: { plain: string; claims: readonly Claim[] };
      try {
        updated = await this.deps.writer.rewritePlain({ sourceZh: d.sourceZh, hv: d.hv, plain: d.plain, claims: structuredClone(d.claims), reason: 'UNSUPPORTED_ADDITION' });
      } catch { return finish('PLAIN_REWRITE_FAILED'); }
      if (!updated?.plain?.trim() || !Array.isArray(updated.claims)) return finish('PLAIN_REWRITE_INVALID');
      if (updated.plain === d.plain && JSON.stringify(updated.claims) === JSON.stringify(d.claims)) return finish('REWRITE_UNCHANGED');
      row.draft = { ...d, plain: updated.plain, claims: structuredClone(updated.claims) };
      row.plainRevisions++;
      if (!claimsValid(row.draft)) return finish('INVALID_SOURCE_OR_CLAIMS');
    }
  }

  private requireRow(id: string): MutableState {
    const row = this.rows.get(id);
    if (!row) throw new Error(`Unknown segment: ${id}`);
    return row;
  }
}

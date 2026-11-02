/**
 * V2.2 vertical tracer ONLY. An injected fake judge proves the routing behavior;
 * this is not a live Jev integration, persistent ledger, or publication path.
 */
import { createHash } from 'node:crypto';

export interface TranslationSnapshot {
  id: string;
  sourceZh: string;
  sourceContext: string;
  sourceLicenseConfirmed: boolean;
  glossaryRevision: string;
  hvVi: string;
  plainVi: string;
}
export interface Gate2Judgment {
  fidelity: Record<number, number>;
  omissionRisk: number;
  contradictionRisk: number;
}
export interface Gate3Judgment {
  readability: Record<number, number>;
  unsupportedRisk: number;
}
export interface FailureEvidence {
  origin: 'plain' | 'hv' | 'unknown';
  sourceQuote: string;
  detail: string;
}
export interface TracerDependencies {
  judgeG2(snapshot: Readonly<TranslationSnapshot>): Promise<Gate2Judgment>;
  judgeG3(snapshot: Readonly<TranslationSnapshot>): Promise<Gate3Judgment>;
  identifyFailure(snapshot: Readonly<TranslationSnapshot>): Promise<FailureEvidence | null>;
  rewritePlain(snapshot: Readonly<TranslationSnapshot>, failure: FailureEvidence): Promise<string>;
}
export interface TracerBudget {
  chargeAuthorized: boolean;
  maxPaidCalls: number;
  maxPlainRevisions: number;
}
export type TracerStatus = 'CANDIDATE_PASS' | 'HUMAN_HOLD' | 'BLOCK';
export interface TracerEvidence {
  gate: 'G2' | 'G3';
  key: string;
  judgment: Gate2Judgment | Gate3Judgment;
}
export interface TracerResult {
  status: TracerStatus;
  reason?: string;
  paidCalls: number;
  evidence: TracerEvidence[];
  g2Key: string;
  g3Keys: string[];
  final: TranslationSnapshot;
  /** Tracer cannot publish. A future release guard requires human approval. */
  publishAuthorized: false;
}
function fingerprint(...parts: string[]): string {
  const hash = createHash('sha256');
  for (const part of parts) hash.update(String(part.length)).update(':').update(part);
  return hash.digest('hex');
}
function passingProbability(scores: Record<number, number>): number {
  return (scores[3] ?? 0) + (scores[4] ?? 0);
}
function g2Pass(j: Gate2Judgment): boolean {
  return passingProbability(j.fidelity) >= 0.9 &&
    j.omissionRisk <= 0.1 && j.contradictionRisk <= 0.1;
}
function g3Pass(j: Gate3Judgment): boolean {
  return passingProbability(j.readability) >= 0.85 && j.unsupportedRisk <= 0.1;
}
/**
 * Single-slice demonstration: semantic G2 is evaluated once; if G3 finds
 * a *source-grounded* plain-only fault, rewrite only plain text and rerun G3.
 * Any other kind of fault or missing charge authority fails closed.
 * No persistence, real API adapter or release authorization exists here.
 */
export async function processSegment(
  input: TranslationSnapshot,
  deps: TracerDependencies,
  budget: TracerBudget,
): Promise<TracerResult> {
  let snapshot: TranslationSnapshot = { ...input };
  let paidCalls = 0;
  const evidence: TracerEvidence[] = [];
  const g3Keys: string[] = [];
  const g2Key = fingerprint('G2-V22-tracer', input.sourceZh, input.sourceContext, input.hvVi, input.glossaryRevision);
  const finish = (status: TracerStatus, reason?: string): TracerResult => ({
    status, reason, paidCalls, evidence: evidence.slice(), g2Key,
    g3Keys: g3Keys.slice(), final: { ...snapshot }, publishAuthorized: false,
  });
  if (!input.sourceLicenseConfirmed || !input.sourceZh.trim()) return finish('BLOCK', 'LICENSE_UNVERIFIED');
  if (!budget.chargeAuthorized) return finish('HUMAN_HOLD', 'NO_CHARGE_AUTHORIZATION');
  if (!Number.isSafeInteger(budget.maxPaidCalls) || budget.maxPaidCalls < 1 ||
      !Number.isSafeInteger(budget.maxPlainRevisions) || budget.maxPlainRevisions < 0) {
    return finish('HUMAN_HOLD', 'INVALID_BUDGET');
  }
  try {
    paidCalls++;
    const g2 = await deps.judgeG2({ ...snapshot });
    evidence.push({ gate: 'G2', key: g2Key, judgment: g2 });
    if (!g2Pass(g2)) return finish('HUMAN_HOLD', 'G2_NOT_VERIFIED');
    for (let revision = 0; revision <= budget.maxPlainRevisions; revision++) {
      if (paidCalls >= budget.maxPaidCalls) return finish('HUMAN_HOLD', 'JEV_BUDGET_EXHAUSTED');
      const g3Key = fingerprint('G3-V22-tracer', input.sourceZh, input.sourceContext, input.hvVi, snapshot.plainVi, input.glossaryRevision);
      if (g3Keys.includes(g3Key)) return finish('HUMAN_HOLD', 'DUPLICATE_REVISION');
      g3Keys.push(g3Key);
      paidCalls++;
      const g3 = await deps.judgeG3({ ...snapshot });
      evidence.push({ gate: 'G3', key: g3Key, judgment: g3 });
      if (g3Pass(g3)) return finish('CANDIDATE_PASS');
      if (revision >= budget.maxPlainRevisions) return finish('HUMAN_HOLD', 'PLAIN_REVISION_CAP');
      const reason = await deps.identifyFailure({ ...snapshot });
      if (!reason || reason.origin !== 'plain' || !input.sourceZh.includes(reason.sourceQuote) || !reason.sourceQuote) {
        return finish('HUMAN_HOLD', 'ERROR_NOT_GROUNDED_TO_SOURCE');
      }
      const nextPlain = await deps.rewritePlain({ ...snapshot }, reason);
      if (!nextPlain.trim() || nextPlain === snapshot.plainVi) return finish('HUMAN_HOLD', 'REWRITE_UNCHANGED');
      snapshot = { ...snapshot, plainVi: nextPlain };
    }
  } catch {
    // A provider/tool error is never a positive judgment.
    return finish('HUMAN_HOLD', 'JUDGE_OR_REWRITER_ERROR');
  }
  return finish('HUMAN_HOLD', 'UNEXPECTED_TERMINATION');
}

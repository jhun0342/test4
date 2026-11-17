import type { Interest, Profile } from './types';

export interface ScoredCandidate {
  profile: Profile;
  score: number;
  sharedInterests: Interest[];
}

/** 점수 비중 (합 100). 자산은 보조 신호라 가장 낮다. */
export const WEIGHTS = { interest: 60, values: 22, asset: 18 } as const;

function overlap(a: Interest[], b: Interest[]): Interest[] {
  return a.filter((x) => b.includes(x));
}

/** 0 차이 → 만점, 1 차이 → 절반, 그 이상 → 0 (levels 값은 0~2). */
function closeness(a: number, b: number, max: number): number {
  const gap = Math.abs(a - b);
  return gap === 0 ? max : gap === 1 ? max / 2 : 0;
}

/**
 * 자산은 후보를 걸러내지 않고 점수만 조금 깎는다.
 * 한쪽이라도 미입력이면 중립(절반).
 */
function assetScore(a: Profile['assetBand'], b: Profile['assetBand']): number {
  const max = WEIGHTS.asset;
  if (a === null || b === null) return max / 2;
  const gap = Math.abs(a - b);
  return gap === 0 ? max : gap === 1 ? max * 0.7 : gap === 2 ? max * 0.35 : max * 0.1;
}

/**
 * 규칙 기반 점수 (0~100).
 * - 관심 분야(60): similar면 겹칠수록, different면 안 겹칠수록 가산. 양쪽 모드 평균.
 * - 가치관(22): 투자 성향 11 + 소비 성향 11
 * - 자산 구간(18): 보조 신호
 */
export function scorePair(me: Profile, other: Profile): ScoredCandidate {
  const shared = overlap(me.interests, other.interests);
  const union = new Set([...me.interests, ...other.interests]).size || 1;
  const similarity = shared.length / union;

  const modeScore = (mode: Profile['mode']) =>
    (mode === 'similar' ? similarity : 1 - similarity) * WEIGHTS.interest;
  const interestScore = (modeScore(me.mode) + modeScore(other.mode)) / 2;

  const valuesScore =
    closeness(me.risk, other.risk, WEIGHTS.values / 2) +
    closeness(me.lifestyle, other.lifestyle, WEIGHTS.values / 2);

  return {
    profile: other,
    score: Math.round(interestScore + valuesScore + assetScore(me.assetBand, other.assetBand)),
    sharedInterests: shared,
  };
}

/** 이미 수락/패스한 사람과 본인을 제외하고 점수순으로 상위 n명. */
export function recommend(
  me: Profile,
  pool: Profile[],
  excludeIds: Set<string>,
  n: number,
): ScoredCandidate[] {
  return pool
    .filter((p) => p.id !== me.id && !excludeIds.has(p.id))
    .map((p) => scorePair(me, p))
    .sort((a, b) => b.score - a.score || a.profile.id.localeCompare(b.profile.id))
    .slice(0, n);
}

import type { Interest, Profile } from './types';

export interface ScoredCandidate {
  profile: Profile;
  score: number;
  sharedInterests: Interest[];
}

function overlap(a: Interest[], b: Interest[]): Interest[] {
  return a.filter((x) => b.includes(x));
}

/**
 * 규칙 기반 점수 (0~100).
 * - 자산 구간 차이: 같으면 40, 1단계 차이 25, 2단계 10, 그 이상 0
 * - 관심 분야: similar 모드는 겹칠수록, different 모드는 겹치지 않을수록 가산 (최대 60)
 * 모드는 후보 본인의 선택도 존중하도록 양쪽 모드를 평균낸다.
 */
export function scorePair(me: Profile, other: Profile): ScoredCandidate {
  const gap = Math.abs(me.assetBand - other.assetBand);
  const assetScore = gap === 0 ? 40 : gap === 1 ? 25 : gap === 2 ? 10 : 0;

  const shared = overlap(me.interests, other.interests);
  const union = new Set([...me.interests, ...other.interests]).size || 1;
  const similarity = shared.length / union; // 0..1

  const modeScore = (mode: Profile['mode']) =>
    mode === 'similar' ? similarity * 60 : (1 - similarity) * 60;
  const interestScore = (modeScore(me.mode) + modeScore(other.mode)) / 2;

  return {
    profile: other,
    score: Math.round(assetScore + interestScore),
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

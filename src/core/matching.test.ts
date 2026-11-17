import { describe, expect, it } from 'vitest';
import { recommend, scorePair, WEIGHTS } from './matching';
import type { Profile } from './types';

const p = (over: Partial<Profile>): Profile => ({
  id: 'x', nickname: 'x', age: 30, assetBand: 3, risk: 1, lifestyle: 1,
  interests: ['주식'], mode: 'similar', intro: '', ...over,
});

describe('WEIGHTS', () => {
  it('합이 100이고 자산이 가장 낮다', () => {
    expect(WEIGHTS.interest + WEIGHTS.values + WEIGHTS.asset).toBe(100);
    expect(WEIGHTS.asset).toBeLessThan(WEIGHTS.values);
    expect(WEIGHTS.asset).toBeLessThan(WEIGHTS.interest);
  });
});

describe('scorePair', () => {
  it('모두 같으면 100, 모두 다르면 0에 가깝다', () => {
    const me = p({ id: 'me' });
    expect(scorePair(me, p({ id: 'a' })).score).toBe(100);
    const far = scorePair(me, p({ id: 'b', assetBand: 5, risk: 1, lifestyle: 1, interests: ['코인'] }));
    expect(far.score).toBeLessThan(40);
  });

  it('different 모드는 관심사가 안 겹칠수록 가산', () => {
    const me = p({ id: 'me', mode: 'different' });
    const a = scorePair(me, p({ id: 'a', mode: 'different', interests: ['부동산'] }));
    const b = scorePair(me, p({ id: 'b', mode: 'different', interests: ['주식'] }));
    expect(a.score).toBeGreaterThan(b.score);
  });

  it('자산 차이가 커져도 감점은 작다(최대 자산 가중치 이내)', () => {
    const me = p({ id: 'me', assetBand: 0 });
    const near = scorePair(me, p({ id: 'a', assetBand: 0 })).score;
    const far = scorePair(me, p({ id: 'b', assetBand: 5 })).score;
    expect(near - far).toBeLessThanOrEqual(WEIGHTS.asset);
    expect(far).toBeGreaterThan(80);
  });

  it('자산 미입력은 중립 처리', () => {
    const me = p({ id: 'me' });
    const nul = scorePair(me, p({ id: 'a', assetBand: null })).score;
    const same = scorePair(me, p({ id: 'b', assetBand: 3 })).score;
    const far = scorePair(me, p({ id: 'c', assetBand: 5 })).score;
    expect(nul).toBeLessThan(same);
    expect(nul).toBeGreaterThan(far);
  });

  it('투자·소비 성향이 비슷할수록 점수가 높다', () => {
    const me = p({ id: 'me', risk: 0, lifestyle: 0 });
    const close = scorePair(me, p({ id: 'a', risk: 0, lifestyle: 0 })).score;
    const diff = scorePair(me, p({ id: 'b', risk: 2, lifestyle: 2 })).score;
    expect(close).toBeGreaterThan(diff);
  });
});

describe('recommend', () => {
  it('본인과 제외 대상은 빠지고 n명만 반환', () => {
    const me = p({ id: 'me' });
    const pool = [me, p({ id: 'a' }), p({ id: 'b' }), p({ id: 'c' })];
    const r = recommend(me, pool, new Set(['a']), 1);
    expect(r).toHaveLength(1);
    expect(r[0].profile.id).not.toBe('me');
    expect(r[0].profile.id).not.toBe('a');
  });
});

import { describe, expect, it } from 'vitest';
import { recommend, scorePair } from './matching';
import type { Profile } from './types';

const p = (over: Partial<Profile>): Profile => ({
  id: 'x', nickname: 'x', age: 30, assetBand: 3, interests: ['주식'], mode: 'similar', intro: '', ...over,
});

describe('scorePair', () => {
  it('같은 구간·같은 관심사가 가장 높다', () => {
    const me = p({ id: 'me' });
    const same = scorePair(me, p({ id: 'a' }));
    const far = scorePair(me, p({ id: 'b', assetBand: 0, interests: ['코인'] }));
    expect(same.score).toBe(100);
    expect(far.score).toBe(0);
  });

  it('different 모드는 관심사가 안 겹칠수록 가산', () => {
    const me = p({ id: 'me', mode: 'different' });
    const a = scorePair(me, p({ id: 'a', mode: 'different', interests: ['부동산'] }));
    const b = scorePair(me, p({ id: 'b', mode: 'different', interests: ['주식'] }));
    expect(a.score).toBeGreaterThan(b.score);
  });

  it('자산 구간 차이가 커질수록 점수 하락', () => {
    const me = p({ id: 'me' });
    const s = (band: Profile['assetBand']) => scorePair(me, p({ id: 'a', assetBand: band })).score;
    expect(s(3)).toBeGreaterThan(s(4));
    expect(s(4)).toBeGreaterThan(s(5));
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

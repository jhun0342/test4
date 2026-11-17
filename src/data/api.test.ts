import { beforeEach, describe, expect, it } from 'vitest';
import { LocalApi } from './api';

class MemStorage {
  m = new Map<string, string>();
  getItem(k: string) { return this.m.get(k) ?? null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
}

let api: LocalApi;
beforeEach(async () => {
  api = new LocalApi(new MemStorage());
  await api.saveMe({ nickname: '나', age: 30, assetBand: 3, risk: 1, lifestyle: 1, interests: ['주식'], mode: 'similar', intro: '' });
});

describe('LocalApi', () => {
  it('초대 코드 없이는 미가입, 올바른 코드면 통과', async () => {
    expect(await api.hasInvite()).toBe(false);
    expect(await api.redeemInvite('wrong')).toBe(false);
    expect(await api.redeemInvite('gyeol-beta')).toBe(true);
    expect(await api.hasInvite()).toBe(true);
  });

  it('하루 추천은 3명이고 같은 날 반복 호출해도 동일', async () => {
    const a = await api.getDailyRecommendations();
    const b = await api.getDailyRecommendations();
    expect(a).toHaveLength(3);
    expect(b.map((c) => c.profile.id).sort()).toEqual(a.map((c) => c.profile.id).sort());
  });

  it('응답한 사람은 추천에서 빠진다', async () => {
    const [first] = await api.getDailyRecommendations();
    await api.respond(first.profile.id, false);
    const after = await api.getDailyRecommendations();
    expect(after.some((c) => c.profile.id === first.profile.id)).toBe(false);
  });

  it('높은 점수 상대를 수락하면 매칭 후 채팅 가능, 링크는 차단', async () => {
    const [top] = await api.getDailyRecommendations();
    const { matched } = await api.respond(top.profile.id, true);
    expect(matched).toBe(true);
    const [{ match }] = await api.listMatches();
    expect((await api.sendMessage(match.id, '반가워요')).ok).toBe(true);
    expect((await api.sendMessage(match.id, 'https://scam.example')).ok).toBe(false);
    expect(await api.listMessages(match.id)).toHaveLength(1);
  });
});

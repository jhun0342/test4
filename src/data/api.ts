import type { Match, Message, Profile } from '../core/types';
import { DAILY_RECOMMENDATIONS } from '../core/types';
import { checkMessage, isChatOpen } from '../core/chat';
import { recommend, type ScoredCandidate } from '../core/matching';
import { SEED_PROFILES } from './seed';

/**
 * 백엔드 경계. 지금은 localStorage 구현(LocalApi)이고,
 * 나중에 같은 인터페이스로 Supabase 구현체로 교체한다.
 */
export interface Api {
  getMe(): Promise<Profile | null>;
  saveMe(p: Omit<Profile, 'id'>): Promise<Profile>;
  getDailyRecommendations(): Promise<ScoredCandidate[]>;
  respond(partnerId: string, accept: boolean): Promise<{ matched: boolean }>;
  listMatches(): Promise<{ match: Match; partner: Profile }[]>;
  listMessages(matchId: string): Promise<Message[]>;
  sendMessage(matchId: string, text: string): Promise<{ ok: true } | { ok: false; reason: string }>;
  reset(): Promise<void>;
}

interface State {
  me: Profile | null;
  /** 날짜(YYYY-MM-DD) -> 그날 노출된 후보 id */
  daily: Record<string, string[]>;
  responded: Record<string, 'accept' | 'pass'>;
  matches: Match[];
  messages: Message[];
}

const KEY = 'gyeol.state.v1';
const empty = (): State => ({ me: null, daily: {}, responded: {}, matches: [], messages: [] });
const today = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2, 10);

export class LocalApi implements Api {
  constructor(private storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> = localStorage) {}

  private load(): State {
    const raw = this.storage.getItem(KEY);
    return raw ? { ...empty(), ...JSON.parse(raw) } : empty();
  }
  private save(s: State) {
    this.storage.setItem(KEY, JSON.stringify(s));
  }

  async getMe() {
    return this.load().me;
  }

  async saveMe(p: Omit<Profile, 'id'>) {
    const s = this.load();
    s.me = { ...p, id: s.me?.id ?? 'me' };
    this.save(s);
    return s.me;
  }

  async getDailyRecommendations() {
    const s = this.load();
    if (!s.me) return [];
    const key = today();
    let ids = s.daily[key];
    if (!ids) {
      const picks = recommend(s.me, SEED_PROFILES, new Set(Object.keys(s.responded)), DAILY_RECOMMENDATIONS);
      ids = picks.map((c) => c.profile.id);
      s.daily[key] = ids;
      this.save(s);
    }
    return recommend(s.me, SEED_PROFILES.filter((p) => ids.includes(p.id)), new Set(Object.keys(s.responded)), ids.length);
  }

  async respond(partnerId: string, accept: boolean) {
    const s = this.load();
    if (!s.me) throw new Error('프로필이 없어요');
    s.responded[partnerId] = accept ? 'accept' : 'pass';
    let matched = false;
    const partner = SEED_PROFILES.find((p) => p.id === partnerId);
    if (accept && partner) {
      // 프로토타입: 점수 50 이상이면 상대도 수락한 것으로 간주
      const { score } = recommend(partner, [s.me], new Set(), 1)[0] ?? { score: 0 };
      if (score >= 50) {
        matched = true;
        s.matches.push({ id: uid(), userId: s.me.id, partnerId, acceptedAt: Date.now() });
      }
    }
    this.save(s);
    return { matched };
  }

  async listMatches() {
    const s = this.load();
    return s.matches
      .map((match) => ({ match, partner: SEED_PROFILES.find((p) => p.id === match.partnerId)! }))
      .filter((x) => x.partner);
  }

  async listMessages(matchId: string) {
    return this.load().messages.filter((m) => m.matchId === matchId);
  }

  async sendMessage(matchId: string, text: string) {
    const s = this.load();
    const match = s.matches.find((m) => m.id === matchId);
    if (!match || !s.me) return { ok: false as const, reason: '대화를 찾을 수 없어요.' };
    if (!isChatOpen(match)) return { ok: false as const, reason: '대화 기간(7일)이 끝났어요.' };
    const check = checkMessage(text);
    if (!check.ok) return check;
    s.messages.push({ id: uid(), matchId, senderId: s.me.id, text: text.trim(), at: Date.now() });
    this.save(s);
    return { ok: true as const };
  }

  async reset() {
    this.storage.removeItem(KEY);
  }
}

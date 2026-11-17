import { CHAT_TTL_MS, type Match } from './types';

export const chatExpiresAt = (m: Match) => m.acceptedAt + CHAT_TTL_MS;
export const isChatOpen = (m: Match, now = Date.now()) => now < chatExpiresAt(m);

export function daysLeft(m: Match, now = Date.now()): number {
  return Math.max(0, Math.ceil((chatExpiresAt(m) - now) / (24 * 60 * 60 * 1000)));
}

/** 채팅 내 외부 링크·계좌번호·투자 권유 키워드를 차단 (로맨스 스캠 방지). */
const BLOCK_PATTERNS: RegExp[] = [
  /https?:\/\//i,
  /\bwww\./i,
  /t\.me\//i,
  /(카톡|카카오톡|오픈채팅|텔레그램|라인)\s*(아이디|id|주소|링크)?/i,
  /\d{2,6}-\d{2,6}-\d{2,8}/, // 계좌번호 형태
  /(수익\s*보장|원금\s*보장|리딩방|추천\s*종목|비상장|고수익)/,
];

export function checkMessage(text: string): { ok: true } | { ok: false; reason: string } {
  const t = text.trim();
  if (!t) return { ok: false, reason: '메시지를 입력해주세요.' };
  if (t.length > 500) return { ok: false, reason: '500자까지 보낼 수 있어요.' };
  if (BLOCK_PATTERNS.some((r) => r.test(t))) {
    return { ok: false, reason: '외부 링크, 계좌번호, 투자 권유성 표현은 보낼 수 없어요.' };
  }
  return { ok: true };
}

import { describe, expect, it } from 'vitest';
import { checkMessage, daysLeft, isChatOpen } from './chat';
import { CHAT_TTL_MS } from './types';

describe('checkMessage', () => {
  it('일반 메시지는 통과', () => expect(checkMessage('안녕하세요!').ok).toBe(true));
  it.each(['https://x.com', '이 종목 수익 보장', '123-456-789012', '카톡 아이디 알려줘'])(
    '차단: %s', (t) => expect(checkMessage(t).ok).toBe(false));
  it('빈 문자열 차단', () => expect(checkMessage('  ').ok).toBe(false));
});

describe('chat TTL', () => {
  const m = { id: 'm', userId: 'a', partnerId: 'b', acceptedAt: 1000 };
  it('7일 이내 열림', () => expect(isChatOpen(m, 1000 + CHAT_TTL_MS - 1)).toBe(true));
  it('7일 뒤 닫힘', () => expect(isChatOpen(m, 1000 + CHAT_TTL_MS)).toBe(false));
  it('남은 일수', () => expect(daysLeft(m, 1000)).toBe(7));
});

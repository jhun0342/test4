export const ASSET_BANDS = [
  { id: 0, label: '1천만원 미만' },
  { id: 1, label: '1천만~5천만원' },
  { id: 2, label: '5천만~1억원' },
  { id: 3, label: '1억~3억원' },
  { id: 4, label: '3억~10억원' },
  { id: 5, label: '10억원 이상' },
] as const;

export type AssetBand = 0 | 1 | 2 | 3 | 4 | 5;

export const INTERESTS = ['주식', '부동산', '예·적금', '코인', '절약·파이어족', '창업·사업'] as const;
export type Interest = (typeof INTERESTS)[number];

/** similar: 비슷한 분야 / different: 다른 분야 */
export type MatchMode = 'similar' | 'different';

export interface Profile {
  id: string;
  nickname: string;
  age: number;
  /** 자기신고 값. 인증되지 않음. */
  assetBand: AssetBand;
  interests: Interest[];
  mode: MatchMode;
  intro: string;
}

export interface Match {
  id: string;
  userId: string;
  partnerId: string;
  /** 수락 시각(ms). 채팅은 이 시점부터 7일. */
  acceptedAt: number;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  text: string;
  at: number;
}

export const CHAT_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const DAILY_RECOMMENDATIONS = 3;

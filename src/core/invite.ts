/** 초대 코드 형식 정규화: 공백 제거 + 대문자. */
export const normalizeInvite = (raw: string) => raw.replace(/\s+/g, '').toUpperCase();

export function isValidInvite(raw: string, codes: readonly string[]): boolean {
  const c = normalizeInvite(raw);
  return c.length > 0 && codes.includes(c);
}

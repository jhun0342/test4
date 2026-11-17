import { describe, expect, it } from 'vitest';
import { isValidInvite } from './invite';

describe('isValidInvite', () => {
  const codes = ['GYEOL-BETA'];
  it('대소문자·공백 무시', () => expect(isValidInvite(' gyeol-beta ', codes)).toBe(true));
  it('없는 코드 거절', () => expect(isValidInvite('NOPE', codes)).toBe(false));
  it('빈 문자열 거절', () => expect(isValidInvite('  ', codes)).toBe(false));
});

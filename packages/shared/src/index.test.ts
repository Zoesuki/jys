import { describe, it, expect } from 'vitest';
import { ERROR_CODES, Role } from './index';

describe('shared contracts', () => {
  it('error codes keep prototype-style NET code', () => {
    expect(ERROR_CODES.NET_TIMEOUT).toBe('NET-1004');
  });
  it('roles match SRS 2.3 matrix', () => {
    expect(Object.values(Role)).toHaveLength(5);
  });
});

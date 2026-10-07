import { describe, it, expect } from 'vitest';
import { ERROR_CODES } from '@jys/shared';

describe('web consumes shared package', () => {
  it('resolves workspace dependency', () => {
    expect(ERROR_CODES.SYS_INTERNAL).toBe('SYS-5000');
  });
});

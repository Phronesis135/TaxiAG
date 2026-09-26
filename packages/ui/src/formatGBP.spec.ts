import { formatGBP } from './formatGBP';

describe('formatGBP', () => {
  it('formats en-GB pounds with two decimals', () => {
    expect(formatGBP(18.5)).toBe('£18.50');
    expect(formatGBP(0)).toBe('£0.00');
    expect(formatGBP(1234.5)).toBe('£1,234.50');
  });
});

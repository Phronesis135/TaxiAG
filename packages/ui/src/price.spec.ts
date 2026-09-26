import { priceDisplayText } from './price';

describe('priceDisplayText (PRD §7)', () => {
  it('renders the three price types', () => {
    expect(priceDisplayText({ priceType: 'fixed', amount: 18.5 })).toBe(
      'Price locked — £18.50',
    );
    expect(
      priceDisplayText({ priceType: 'estimated', range: { min: 16, max: 21 } }),
    ).toBe('Estimated — £16.00–£21.00');
    expect(priceDisplayText({ priceType: 'metered', amount: 15 })).toBe(
      'From £15.00',
    );
  });
});

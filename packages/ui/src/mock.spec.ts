import { cheapestValue, mockBook, mockSearch } from './mock';

const JOURNEY = {
  pickup: { lat: 51.5074, lng: -0.1278 },
  dropoff: { lat: 51.47, lng: -0.4543 },
  when: new Date(Date.now() + 3600_000).toISOString(),
  passengers: 2,
};

describe('mockSearch (demo fallback)', () => {
  it('returns cheapest-first quotes with future validity', () => {
    const { quotes, count } = mockSearch(JOURNEY);
    expect(count).toBe(9);
    const values = quotes.map(cheapestValue);
    expect(values).toEqual([...values].sort((a, b) => a - b));
    const now = Date.now();
    for (const q of quotes) {
      expect(Date.parse(q.validUntil)).toBeGreaterThan(now);
    }
  });

  it('applies maxPrice filtering', () => {
    const { quotes } = mockSearch({ ...JOURNEY, maxPrice: 5 });
    for (const q of quotes) {
      expect(cheapestValue(q)).toBeLessThanOrEqual(5);
    }
  });

  it('mockBook produces a clearly-marked demo reference', () => {
    const { quotes } = mockSearch(JOURNEY);
    const booking = mockBook(quotes[0], 'Demo Rider');
    expect(booking.demo).toBe(true);
    expect(booking.ref.startsWith('demo-')).toBe(true);
    expect(booking.priceText).toContain('£');
  });
});

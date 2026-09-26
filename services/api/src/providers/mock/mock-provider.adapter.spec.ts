import type { JourneyInput } from '../provider-adapter.interface';
import { MockProviderAdapter } from './mock-provider.adapter';

const LHR: JourneyInput = {
  pickup: { lat: 51.5074, lng: -0.1278 },
  dropoff: { lat: 51.47, lng: -0.4543 },
  when: new Date(Date.now() + 3600_000).toISOString(),
  passengers: 2,
};

describe('MockProviderAdapter', () => {
  it('returns fixed, estimated and metered quotes with future validity', async () => {
    const adapter = new MockProviderAdapter();
    const quotes = await adapter.getQuote(LHR);
    expect(quotes.length).toBe(9); // 3 classes x 3 price types
    const types = new Set(quotes.map((q) => q.priceType));
    expect(types).toEqual(new Set(['fixed', 'estimated', 'metered']));
    const now = Date.now();
    for (const q of quotes) {
      expect(Date.parse(q.validUntil)).toBeGreaterThan(now);
      expect(q.currency).toBe('GBP');
      if (q.priceType === 'estimated') {
        expect(q.range!.min).toBeLessThan(q.range!.max);
      } else {
        expect(q.amount).toBeGreaterThan(0);
      }
    }
  });

  it('supports book, track and cancel lifecycle', async () => {
    const adapter = new MockProviderAdapter();
    const [quote] = await adapter.getQuote(LHR);
    const booking = await adapter.createBooking(LHR, quote);
    expect(booking.status).toBe('confirmed');
    expect(booking.route).toBe('direct');
    const events = await adapter.getTracking(booking.bookingId);
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].live).toBe(true);
    await expect(adapter.cancel(booking.bookingId)).resolves.toEqual({
      cancelled: true,
    });
    await expect(adapter.getTracking(booking.bookingId)).resolves.toEqual([]);
  });
});

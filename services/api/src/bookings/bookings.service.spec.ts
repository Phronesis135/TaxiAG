import { BookingsService } from './bookings.service';
import { ProvidersService } from '../providers/providers.service';
import type { JourneyInput } from '../providers/provider-adapter.interface';
import { MockProviderAdapter } from '../providers/mock/mock-provider.adapter';

const JOURNEY: JourneyInput = {
  pickup: { lat: 51.5074, lng: -0.1278 },
  dropoff: { lat: 51.47, lng: -0.4543 },
  when: new Date(Date.now() + 3600_000).toISOString(),
  passengers: 1,
};

const PASSENGER = { name: 'Test Rider', phone: '+447000000000' };

describe('BookingsService', () => {
  it('books a valid quote and retrieves it', async () => {
    const providers = new ProvidersService();
    const bookings = new BookingsService(providers);
    const { quotes } = await providers.search(JOURNEY);
    const out = await bookings.create(quotes[0].id, PASSENGER, false);
    expect('record' in out).toBe(true);
    if (!('record' in out)) return;
    expect(out.record.status).toBe('confirmed');
    expect(out.record.responsibility.support).toBeTruthy();
    expect(bookings.get(out.record.bookingId)?.bookingId).toBe(
      out.record.bookingId,
    );
  });

  it('returns a replacement quote instead of booking an expired one', async () => {
    const providers = new ProvidersService();
    const bookings = new BookingsService(providers);
    const adapter = new MockProviderAdapter();
    const [quote] = await adapter.getQuote(JOURNEY);
    quote.validUntil = new Date(Date.now() - 1000).toISOString();
    providers.register(adapter);
    providers.registerIssued(quote, JOURNEY);
    const out = await bookings.create(quote.id, PASSENGER, false);
    expect('revalidation' in out).toBe(true);
    if (!('revalidation' in out)) return;
    expect(Date.parse(out.revalidation.validUntil)).toBeGreaterThan(Date.now());
  });

  it('cancels a booking', async () => {
    const providers = new ProvidersService();
    const bookings = new BookingsService(providers);
    const { quotes } = await providers.search(JOURNEY);
    const out = await bookings.create(quotes[0].id, PASSENGER, true);
    if (!('record' in out)) throw new Error('expected record');
    const cancelled = await bookings.cancel(out.record.bookingId);
    expect(cancelled?.cancelledAt).toBeTruthy();
    expect(cancelled?.bookingId).toBe(out.record.bookingId);
  });
});

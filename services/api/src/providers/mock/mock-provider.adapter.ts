// Deterministic dev/test provider. NOT a real booking path — every quote is
// computed from straight-line distance so search → compare → book flows can be
// exercised before Tier A/B/C integrations land.
import { randomUUID } from 'crypto';
import type {
  BookingResult,
  JourneyInput,
  ProviderAdapter,
  ProviderCapabilities,
  Quote,
  TrackingEvent,
  VehicleClass,
} from '../provider-adapter.interface';

const RATE_PER_KM: Record<VehicleClass, number> = {
  standard: 1.8,
  executive: 2.9,
  xl: 2.4,
  wav: 2.0,
  electric: 2.0,
};

const QUOTE_TTL_MIN = 5;

function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export class MockProviderAdapter implements ProviderAdapter {
  readonly id = 'mock-local-taxis';
  readonly name = 'Mock Local Taxis';

  private readonly bookings = new Map<string, BookingResult>();

  getCapabilities(): ProviderCapabilities {
    return {
      id: this.id,
      name: this.name,
      vehicleClasses: ['standard', 'executive', 'xl', 'wav', 'electric'],
      tracking: true,
      bookingRoute: 'direct',
      verified: true,
      verifiedAt: '2026-09-01',
    };
  }

  async getQuote(journey: JourneyInput): Promise<Quote[]> {
    const km = Math.max(1, haversineKm(journey.pickup, journey.dropoff));
    const classes: VehicleClass[] = journey.vehicleClass
      ? [journey.vehicleClass]
      : ['standard', 'executive', 'xl'];
    const validUntil = new Date(
      Date.now() + QUOTE_TTL_MIN * 60_000,
    ).toISOString();

    return classes.flatMap((vehicleClass, i): Quote[] => {
      const base = +(km * RATE_PER_KM[vehicleClass]).toFixed(2);
      const common = {
        providerId: this.id,
        providerName: this.name,
        vehicleClass,
        currency: 'GBP' as const,
        validUntil,
        pickupEtaMin: 5 + i * 2,
        fees: [{ label: 'Booking fee', amount: 0 }],
        cancellationSummary:
          'Free cancellation up to 10 min before pickup.',
      };
      return [
        { ...common, id: randomUUID(), priceType: 'fixed', amount: base },
        {
          ...common,
          id: randomUUID(),
          priceType: 'estimated',
          range: {
            min: +(base * 0.9).toFixed(2),
            max: +(base * 1.2).toFixed(2),
          },
        },
        {
          ...common,
          id: randomUUID(),
          priceType: 'metered',
          amount: +(base * 0.8).toFixed(2),
        },
      ];
    });
  }

  async createBooking(
    _journey: JourneyInput,
    quote: Quote,
  ): Promise<BookingResult> {
    const result: BookingResult = {
      bookingId: randomUUID(),
      providerId: this.id,
      route: 'direct',
      status: 'confirmed',
      responsibility: {
        booking: `TaxiAG via ${quote.providerName}`,
        payment: `Pay securely through TaxiAG — £${quote.amount ?? quote.range?.max} ${quote.currency}`,
        cancellation: quote.cancellationSummary,
        refund: 'TaxiAG handles refunds for direct bookings.',
        support: 'TaxiAG customer support.',
      },
    };
    this.bookings.set(result.bookingId, result);
    return result;
  }

  async cancel(bookingId: string): Promise<{ cancelled: boolean }> {
    return { cancelled: this.bookings.delete(bookingId) };
  }

  async getTracking(bookingId: string): Promise<TrackingEvent[]> {
    if (!this.bookings.has(bookingId)) return [];
    return [
      {
        at: new Date().toISOString(),
        label: 'Driver assigned — live tracking (mock)',
        live: true,
      },
    ];
  }
}

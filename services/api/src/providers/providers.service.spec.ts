import { cheapestValue, ProvidersService } from './providers.service';
import type {
  JourneyInput,
  Quote,
  VehicleClass,
} from './provider-adapter.interface';

const JOURNEY: JourneyInput = {
  pickup: { lat: 51.5074, lng: -0.1278 },
  dropoff: { lat: 51.47, lng: -0.4543 },
  when: new Date(Date.now() + 3600_000).toISOString(),
  passengers: 2,
};

describe('ProvidersService', () => {
  it('ranks cheapest first (fixed amount / estimated min / metered from)', async () => {
    const service = new ProvidersService();
    const { quotes } = await service.search(JOURNEY);
    expect(quotes.length).toBeGreaterThan(0);
    const values = quotes.map(cheapestValue);
    const sorted = [...values].sort((a, b) => a - b);
    expect(values).toEqual(sorted);
  });

  it('applies maxPrice without auto-booking anything', async () => {
    const service = new ProvidersService();
    const { quotes } = await service.search({ ...JOURNEY, maxPrice: 5 });
    for (const q of quotes) {
      expect(cheapestValue(q)).toBeLessThanOrEqual(5);
    }
  });

  it('cheapestValue prefers the comparable figure per price type', () => {
    const base = {
      id: 'q',
      providerId: 'p',
      providerName: 'P',
      vehicleClass: 'standard' as VehicleClass,
      currency: 'GBP' as const,
      validUntil: new Date().toISOString(),
      pickupEtaMin: 5,
      fees: [] as Quote['fees'],
      cancellationSummary: '',
    };
    const fixed: Quote = { ...base, priceType: 'fixed', amount: 20 };
    const estimated: Quote = {
      ...base,
      priceType: 'estimated',
      range: { min: 16, max: 21 },
    };
    const metered: Quote = { ...base, priceType: 'metered', amount: 15 };
    expect(cheapestValue(fixed)).toBe(20);
    expect(cheapestValue(estimated)).toBe(16);
    expect(cheapestValue(metered)).toBe(15);
  });
});

// Browser-safe mock provider (mirrors services/api mock rates/logic).
// Used ONLY as a demo fallback when the API is unreachable (static hosting
// with no backend yet). Real flow always prefers the API.
import { priceDisplayText, type PriceType } from './price';

export type VehicleClass =
  | 'standard'
  | 'executive'
  | 'xl'
  | 'wav'
  | 'electric';

export interface MockJourney {
  pickup: { lat: number; lng: number };
  dropoff: { lat: number; lng: number };
  when: string;
  passengers: number;
  maxPrice?: number;
}

export interface MockQuote {
  id: string;
  providerId: string;
  providerName: string;
  vehicleClass: VehicleClass;
  priceType: PriceType;
  amount?: number;
  range?: { min: number; max: number };
  currency: 'GBP';
  validUntil: string;
  pickupEtaMin: number;
  fees: Array<{ label: string; amount: number }>;
  cancellationSummary: string;
}

export interface DemoBooking {
  ref: string;
  providerName: string;
  priceText: string;
  vehicleClass: VehicleClass;
  passengerName: string;
  demo: true;
}

const RATE_PER_KM: Record<VehicleClass, number> = {
  standard: 1.8,
  executive: 2.9,
  xl: 2.4,
  wav: 2.0,
  electric: 2.0,
};

const QUOTE_TTL_MIN = 5;

function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `mock-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

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

export function cheapestValue(q: Pick<MockQuote, 'priceType' | 'amount' | 'range'>): number {
  if (q.priceType === 'estimated') return q.range?.min ?? Infinity;
  return q.amount ?? Infinity;
}

export function mockSearch(journey: MockJourney): {
  quotes: MockQuote[];
  count: number;
  generatedAt: string;
} {
  const km = Math.max(1, haversineKm(journey.pickup, journey.dropoff));
  const classes: VehicleClass[] = ['standard', 'executive', 'xl'];
  const validUntil = new Date(Date.now() + QUOTE_TTL_MIN * 60_000).toISOString();
  const all = classes.flatMap((vehicleClass, i): MockQuote[] => {
    const base = +(km * RATE_PER_KM[vehicleClass]).toFixed(2);
    const common = {
      providerId: 'mock-local-taxis',
      providerName: 'Mock Local Taxis (demo)',
      vehicleClass,
      currency: 'GBP' as const,
      validUntil,
      pickupEtaMin: 5 + i * 2,
      fees: [{ label: 'Booking fee', amount: 0 }],
      cancellationSummary: 'Free cancellation up to 10 min before pickup.',
    };
    return [
      { ...common, id: uid(), priceType: 'fixed' as const, amount: base },
      {
        ...common,
        id: uid(),
        priceType: 'estimated' as const,
        range: { min: +(base * 0.9).toFixed(2), max: +(base * 1.2).toFixed(2) },
      },
      {
        ...common,
        id: uid(),
        priceType: 'metered' as const,
        amount: +(base * 0.8).toFixed(2),
      },
    ];
  });
  const filtered =
    typeof journey.maxPrice === 'number'
      ? all.filter((q) => cheapestValue(q) <= (journey.maxPrice as number))
      : all;
  filtered.sort((a, b) => cheapestValue(a) - cheapestValue(b));
  return { quotes: filtered, count: filtered.length, generatedAt: new Date().toISOString() };
}

export function mockBook(
  quote: MockQuote,
  passengerName: string,
): DemoBooking {
  return {
    ref: `demo-${uid().slice(0, 8)}`,
    providerName: quote.providerName,
    priceText: priceDisplayText({
      priceType: quote.priceType,
      amount: quote.amount,
      range: quote.range,
    }),
    vehicleClass: quote.vehicleClass,
    passengerName,
    demo: true,
  };
}

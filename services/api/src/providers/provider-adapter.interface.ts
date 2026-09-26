// ProviderAdapter contract (IMPLEMENTATION_PLAN.md §5).
// Every integration — Tier A API, Tier B portal, Tier C handoff, and this mock —
// implements this interface so tiers are interchangeable per journey.

export type PriceType = 'fixed' | 'estimated' | 'metered';

export type VehicleClass =
  | 'standard'
  | 'executive'
  | 'xl'
  | 'wav'
  | 'electric';

export interface GeoPoint {
  lat: number;
  lng: number;
  label?: string;
}

export interface JourneyInput {
  pickup: GeoPoint;
  dropoff: GeoPoint;
  /** ISO-8601 datetime of requested pickup. */
  when: string;
  passengers: number;
  vehicleClass?: VehicleClass;
  /** GBP budget cap — providers above it are filtered out, never auto-booked. */
  maxPrice?: number;
}

export interface Fee {
  label: string;
  /** GBP. */
  amount: number;
}

export interface Quote {
  id: string;
  providerId: string;
  providerName: string;
  vehicleClass: VehicleClass;
  priceType: PriceType;
  /** fixed total, or metered "from" amount. Undefined for estimated. */
  amount?: number;
  /** Estimated range. Defined only for estimated. */
  range?: { min: number; max: number };
  currency: 'GBP';
  /** ISO-8601 — quote must be revalidated after this (price protection). */
  validUntil: string;
  pickupEtaMin: number;
  fees: Fee[];
  cancellationSummary: string;
}

export interface BookingResult {
  bookingId: string;
  providerId: string;
  route: 'direct' | 'external';
  status: 'confirmed';
  responsibility: {
    booking: string;
    payment: string;
    cancellation: string;
    refund: string;
    support: string;
  };
}

export interface TrackingEvent {
  at: string;
  lat?: number;
  lng?: number;
  label: string;
  /** false = provider supplies limited info; UI must show "tracking unavailable". */
  live: boolean;
}

export interface ProviderCapabilities {
  id: string;
  name: string;
  vehicleClasses: VehicleClass[];
  tracking: boolean;
  bookingRoute: 'direct' | 'external';
  verified: boolean;
  verifiedAt: string;
}

export interface ProviderAdapter {
  readonly id: string;
  readonly name: string;
  getCapabilities(): ProviderCapabilities;
  getQuote(journey: JourneyInput): Promise<Quote[]>;
  createBooking(journey: JourneyInput, quote: Quote): Promise<BookingResult>;
  cancel(bookingId: string): Promise<{ cancelled: boolean }>;
  getTracking(bookingId: string): Promise<TrackingEvent[]>;
}

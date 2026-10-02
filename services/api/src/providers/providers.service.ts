import { Injectable } from '@nestjs/common';
import type {
  JourneyInput,
  ProviderAdapter,
  Quote,
} from './provider-adapter.interface';
import { MockProviderAdapter } from './mock/mock-provider.adapter';

export interface SearchResult {
  quotes: Quote[];
  count: number;
  generatedAt: string;
}

export interface Revalidation {
  valid: boolean;
  /** The usable quote: the original when valid, a fresh replacement when expired. */
  quote: Quote;
}

/** Cheapest-comparable value in GBP (PRD §6: default ranking is cheapest). */
export function cheapestValue(quote: Quote): number {
  if (quote.priceType === 'estimated') return quote.range?.min ?? Infinity;
  return quote.amount ?? Infinity;
}

@Injectable()
export class ProvidersService {
  private readonly adapters = new Map<string, ProviderAdapter>();
  /** Issued quotes awaiting booking. Dev store (single instance); moves to Postgres at scale. */
  private readonly issued = new Map<string, { quote: Quote; journey: JourneyInput }>();

  constructor() {
    // Phase 0.3: mock only. Tier A/B/C adapters register here as they land.
    const mock = new MockProviderAdapter();
    this.adapters.set(mock.id, mock);
  }

  register(adapter: ProviderAdapter): void {
    this.adapters.set(adapter.id, adapter);
  }

  getAdapter(providerId: string): ProviderAdapter | undefined {
    return this.adapters.get(providerId);
  }

  registerIssued(quote: Quote, journey: JourneyInput): void {
    this.issued.set(quote.id, { quote, journey });
  }

  getIssued(quoteId: string): { quote: Quote; journey: JourneyInput } | undefined {
    return this.issued.get(quoteId);
  }

  async search(journey: JourneyInput): Promise<SearchResult> {
    const settled = await Promise.all(
      [...this.adapters.values()].map((adapter) =>
        adapter.getQuote(journey).catch(() => [] as Quote[]),
      ),
    );
    const all = settled.flat();
    const filtered =
      typeof journey.maxPrice === 'number'
        ? all.filter((q) => cheapestValue(q) <= (journey.maxPrice as number))
        : all;
    // Cheapest first. Commercial fields must never influence this sort.
    filtered.sort((a, b) => cheapestValue(a) - cheapestValue(b));
    for (const q of filtered) this.registerIssued(q, journey);
    return {
      quotes: filtered,
      count: filtered.length,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Price protection (PRD §8): a quote is only bookable inside its validity
   * window. Expired quotes yield a fresh replacement — the customer must
   * confirm the new price, never silently pay it.
   */
  async revalidate(quoteId: string): Promise<Revalidation | undefined> {
    const found = this.issued.get(quoteId);
    if (!found) return undefined;
    if (Date.parse(found.quote.validUntil) > Date.now()) {
      return { valid: true, quote: found.quote };
    }
    const adapter = this.adapters.get(found.quote.providerId);
    if (!adapter) return undefined;
    const fresh = await adapter
      .getQuote(found.journey)
      .then(
        (quotes) =>
          quotes.find(
            (q) =>
              q.vehicleClass === found.quote.vehicleClass &&
              q.priceType === found.quote.priceType,
          ) ?? quotes[0],
      )
      .catch(() => undefined);
    if (!fresh) return { valid: false, quote: found.quote };
    this.registerIssued(fresh, found.journey);
    return { valid: false, quote: fresh };
  }
}

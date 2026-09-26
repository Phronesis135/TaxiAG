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

/** Cheapest-comparable value in GBP (PRD §6: default ranking is cheapest). */
export function cheapestValue(quote: Quote): number {
  if (quote.priceType === 'estimated') return quote.range?.min ?? Infinity;
  return quote.amount ?? Infinity;
}

@Injectable()
export class ProvidersService {
  private readonly adapters = new Map<string, ProviderAdapter>();

  constructor() {
    // Phase 0.3: mock only. Tier A/B/C adapters register here as they land.
    const mock = new MockProviderAdapter();
    this.adapters.set(mock.id, mock);
  }

  register(adapter: ProviderAdapter): void {
    this.adapters.set(adapter.id, adapter);
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
    return {
      quotes: filtered,
      count: filtered.length,
      generatedAt: new Date().toISOString(),
    };
  }
}

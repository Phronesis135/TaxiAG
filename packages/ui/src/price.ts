import { formatGBP } from './formatGBP';

export type PriceType = 'fixed' | 'estimated' | 'metered';

export interface PriceInput {
  priceType: PriceType;
  amount?: number;
  range?: { min: number; max: number };
}

// PRD §7 price display strings — single implementation for app + web.
export function priceDisplayText(price: PriceInput): string {
  switch (price.priceType) {
    case 'fixed':
      return `Price locked — ${formatGBP(price.amount ?? 0)}`;
    case 'estimated':
      return `Estimated — ${formatGBP(price.range?.min ?? 0)}–${formatGBP(price.range?.max ?? 0)}`;
    case 'metered':
      return `From ${formatGBP(price.amount ?? 0)}`;
  }
}

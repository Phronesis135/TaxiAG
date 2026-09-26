// All GBP rendering in TaxiAG goes through here (tokens.currency: en-GB/GBP).
export function formatGBP(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
}

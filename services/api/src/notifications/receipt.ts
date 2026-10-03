// Pure payment-receipt builder (email-client-safe: tables + inline styles).
// Tested in receipt.spec.ts; sent via EmailService.

export interface ReceiptData {
  bookingRef: string;
  captureId: string;
  providerName: string;
  /** Human price text, e.g. "Price locked — £18.50". */
  priceText: string;
  /** Amount actually charged, GBP. */
  amountGbp: number;
  pickupLabel: string;
  dropoffLabel: string;
  whenISO: string;
  paidAtISO: string;
  passengerName: string;
}

export function formatGBP(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
}

export function receiptHtml(r: ReceiptData): string {
  const row = (k: string, v: string) =>
    `<tr><td style="padding:8px 12px;color:#8a7a63;font-size:14px;">${k}</td>` +
    `<td style="padding:8px 12px;color:#1c1611;font-size:14px;font-weight:600;text-align:right;">${v}</td></tr>`;
  return (
    `<div style="font-family:Arial,sans-serif;background:#f7f3ea;padding:24px;">` +
    `<div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">` +
    `<div style="background:#1c1611;color:#f3ead9;padding:20px 24px;">` +
    `<div style="font-size:20px;font-weight:bold;">TaxiAG receipt</div>` +
    `<div style="font-size:13px;color:#c4b49c;">Payment confirmation — keep for your records</div>` +
    `</div>` +
    `<table style="width:100%;border-collapse:collapse;padding:12px;">` +
    row('Booking reference', r.bookingRef) +
    row('PayPal capture', r.captureId) +
    row('Provider', r.providerName) +
    row('From', r.pickupLabel) +
    row('To', r.dropoffLabel) +
    row('Pickup time', new Date(r.whenISO).toLocaleString('en-GB')) +
    row('Passenger', r.passengerName) +
    row('Quoted price', r.priceText) +
    row('Amount charged', formatGBP(r.amountGbp)) +
    row('Paid at', new Date(r.paidAtISO).toLocaleString('en-GB')) +
    `</table>` +
    `<div style="padding:0 24px 20px;font-size:13px;color:#8a7a63;">` +
    `Paid securely for your TaxiAG direct booking. Questions? Reply to this email.` +
    `</div></div></div>`
  );
}

export function receiptSubject(r: ReceiptData): string {
  return `TaxiAG receipt — booking ${r.bookingRef.slice(0, 8)}`;
}

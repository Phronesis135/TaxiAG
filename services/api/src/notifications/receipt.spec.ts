import { receiptHtml, receiptSubject } from './receipt';

export const RECEIPT = {
  bookingRef: 'bk-12345678',
  captureId: 'cap-abc',
  providerName: 'Mock Local Taxis',
  priceText: 'Price locked — £18.50',
  amountGbp: 18.5,
  pickupLabel: 'Cambridge Station',
  dropoffLabel: 'Heathrow T5',
  whenISO: '2026-10-01T10:00:00.000Z',
  paidAtISO: '2026-10-01T09:00:00.000Z',
  passengerName: 'Jane Doe',
};

describe('receipt', () => {
  it('contains the booking facts a customer needs', () => {
    const html = receiptHtml(RECEIPT);
    for (const needle of [
      'bk-12345678',
      'cap-abc',
      'Mock Local Taxis',
      '£18.50',
      'Cambridge Station',
      'Heathrow T5',
      'Jane Doe',
    ]) {
      expect(html).toContain(needle);
    }
    expect(receiptSubject(RECEIPT)).toContain('bk-12345');
  });
});

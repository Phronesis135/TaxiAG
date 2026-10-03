import { Injectable } from '@nestjs/common';
import type {
  JourneyInput,
  Quote,
} from '../providers/provider-adapter.interface';
import { ProvidersService } from '../providers/providers.service';
import type { BookingResult } from '../providers/provider-adapter.interface';

export interface Passenger {
  name: string;
  phone: string;
  /** Optional — payment receipts are emailed here when present. */
  email?: string;
}

export interface BookingPayment {
  orderId: string;
  captureId: string;
  amountGbp: number;
  paidAt: string;
}

export interface BookingRecord extends BookingResult {
  quote: Quote;
  journey: JourneyInput;
  passenger: Passenger;
  bookForOther: boolean;
  createdAt: string;
  cancelledAt?: string;
  payment?: BookingPayment;
}

@Injectable()
export class BookingsService {
  /** Dev store (single instance); moves to Postgres with the quote store at scale. */
  private readonly records = new Map<string, BookingRecord>();

  constructor(private readonly providers: ProvidersService) {}

  /**
   * Books an issued quote. Returns the record — or a fresh replacement quote
   * when the selected one expired (the UI must ask the customer to confirm
   * the new price first; never book it silently).
   */
  async create(
    quoteId: string,
    passenger: Passenger,
    bookForOther: boolean,
  ): Promise<{ record: BookingRecord } | { revalidation: Quote }> {
    const re = await this.providers.revalidate(quoteId);
    if (!re) throw new Error('quote-not-found');
    if (!re.valid) return { revalidation: re.quote };
    const issued = this.providers.getIssued(re.quote.id);
    if (!issued) throw new Error('quote-not-found');
    const adapter = this.providers.getAdapter(re.quote.providerId);
    if (!adapter) throw new Error('unknown-provider');
    const created = await adapter.createBooking(issued.journey, re.quote);
    const record: BookingRecord = {
      ...created,
      quote: re.quote,
      journey: issued.journey,
      passenger,
      bookForOther,
      createdAt: new Date().toISOString(),
    };
    this.records.set(record.bookingId, record);
    return { record };
  }

  get(bookingId: string): BookingRecord | undefined {
    return this.records.get(bookingId);
  }

  markPaid(
    bookingId: string,
    payment: { orderId: string; captureId: string; amountGbp: number },
  ): BookingRecord | undefined {
    const record = this.records.get(bookingId);
    if (!record || record.cancelledAt || record.payment) return record;
    record.payment = { ...payment, paidAt: new Date().toISOString() };
    return record;
  }

  async cancel(bookingId: string): Promise<BookingRecord | undefined> {
    const record = this.records.get(bookingId);
    if (!record || record.cancelledAt) return record;
    const adapter = this.providers.getAdapter(record.providerId);
    if (adapter) await adapter.cancel(bookingId).catch(() => undefined);
    record.cancelledAt = new Date().toISOString();
    return record;
  }
}

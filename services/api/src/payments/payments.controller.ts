import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  ServiceUnavailableException,
} from '@nestjs/common';
import { BookingsService } from '../bookings/bookings.service';
import { EmailService } from '../notifications/email.service';
import { receiptHtml } from '../notifications/receipt';
import { PayPalService } from './paypal.service';

function priceTextOf(quote: {
  priceType: string;
  amount?: number;
  range?: { min: number; max: number };
}): string {
  const gbp = (n: number) =>
    new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(n);
  if (quote.priceType === 'fixed') return `Price locked — ${gbp(quote.amount ?? 0)}`;
  if (quote.priceType === 'estimated')
    return `Estimated — ${gbp(quote.range?.min ?? 0)}–${gbp(quote.range?.max ?? 0)}`;
  return `From ${gbp(quote.amount ?? 0)}`;
}

@Controller('v1/payments')
export class PaymentsController {
  constructor(
    private readonly paypal: PayPalService,
    private readonly bookings: BookingsService,
    private readonly email: EmailService,
  ) {}

  private requirePayPal(): void {
    if (!this.paypal.enabled) {
      throw new ServiceUnavailableException(
        'PayPal sandbox not configured — set PAYPAL_CLIENT_ID/SECRET in .env',
      );
    }
  }

  /** Creates a sandbox order; the web app redirects the customer to approveUrl. */
  @Post('order')
  async createOrder(@Body() body: { bookingId?: unknown }) {
    this.requirePayPal();
    if (typeof body.bookingId !== 'string' || !body.bookingId) {
      throw new BadRequestException('bookingId is required');
    }
    const booking = this.bookings.get(body.bookingId);
    if (!booking) throw new NotFoundException('booking not found');
    if (booking.cancelledAt) throw new BadRequestException('booking cancelled');
    if (booking.payment) throw new BadRequestException('booking already paid');
    return this.paypal.createOrder(booking.bookingId, booking.quote);
  }

  /** Captures an approved order, marks the booking paid, emails the receipt. */
  @Post('capture')
  async capture(@Body() body: { orderId?: unknown }) {
    this.requirePayPal();
    if (typeof body.orderId !== 'string' || !body.orderId) {
      throw new BadRequestException('orderId is required');
    }
    const capture = await this.paypal.captureOrder(body.orderId);
    const bookingId = this.paypal.bookingForOrder(body.orderId);
    const booking = bookingId
      ? this.bookings.markPaid(bookingId, capture)
      : undefined;
    let receiptSent = false;
    if (booking?.passenger.email) {
      try {
        const sent = await this.email.sendPaymentReceipt(
          booking.passenger.email,
          {
            bookingRef: booking.bookingId,
            captureId: capture.captureId,
            providerName: booking.quote.providerName,
            priceText: priceTextOf(booking.quote),
            amountGbp: capture.amountGbp,
            pickupLabel:
              booking.journey.pickup.label ??
              `${booking.journey.pickup.lat},${booking.journey.pickup.lng}`,
            dropoffLabel:
              booking.journey.dropoff.label ??
              `${booking.journey.dropoff.lat},${booking.journey.dropoff.lng}`,
            whenISO: booking.journey.when,
            paidAtISO: new Date().toISOString(),
            passengerName: booking.passenger.name,
          },
        );
        receiptSent = sent.sent;
      } catch {
        receiptSent = false;
      }
    }
    return { booking, payment: capture, receiptSent };
  }

  /** Debug helper (dev only): shows the receipt HTML shape without sending. */
  @Get('receipt-preview')
  preview() {
    return {
      htmlLength: receiptHtml({
        bookingRef: 'preview',
        captureId: 'preview',
        providerName: 'Preview',
        priceText: 'Price locked — £18.50',
        amountGbp: 18.5,
        pickupLabel: 'A',
        dropoffLabel: 'B',
        whenISO: new Date().toISOString(),
        paidAtISO: new Date().toISOString(),
        passengerName: 'Preview',
      }).length,
    };
  }
}

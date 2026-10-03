import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CheckoutPaymentIntent,
  Client,
  Environment,
  OrderApplicationContextUserAction,
  OrdersController,
} from '@paypal/paypal-server-sdk';
import type { Quote } from '../providers/provider-adapter.interface';

export interface PayPalOrder {
  orderId: string;
  approveUrl: string;
  amountGbp: number;
}

export interface PayPalCapture {
  orderId: string;
  captureId: string;
  amountGbp: number;
  status: string;
}

/** Chargeable figure per price type (estimated books against its max). */
export function chargeableAmount(quote: Quote): number {
  if (quote.priceType === 'estimated') return quote.range?.max ?? 0;
  return quote.amount ?? 0;
}

@Injectable()
export class PayPalService {
  private readonly orders?: OrdersController;
  private readonly returnUrl: string;
  private readonly cancelUrl: string;
  /** Sandbox orderId -> TaxiAG bookingId link (dev store; moves to Postgres at scale). */
  private readonly orderLinks = new Map<string, string>();

  constructor(private readonly config: ConfigService) {
    const id = config.get<string>('PAYPAL_CLIENT_ID');
    const secret = config.get<string>('PAYPAL_CLIENT_SECRET');
    if (id && secret) {
      const client = new Client({
        clientCredentialsAuthCredentials: {
          oAuthClientId: id,
          oAuthClientSecret: secret,
        },
        environment: Environment.Sandbox,
      });
      this.orders = new OrdersController(client);
    }
    this.returnUrl =
      config.get<string>('PAYPAL_RETURN_URL') ??
      'http://localhost:3000/pay/return';
    this.cancelUrl =
      config.get<string>('PAYPAL_CANCEL_URL') ??
      'http://localhost:3000/pay/cancel';
  }

  /** False until sandbox credentials are set — endpoints answer 503, never crash. */
  get enabled(): boolean {
    return !!this.orders;
  }

  async createOrder(
    bookingId: string,
    quote: Quote,
  ): Promise<PayPalOrder> {
    if (!this.orders) throw new Error('paypal-not-configured');
    const amountGbp = +chargeableAmount(quote).toFixed(2);
    const { body } = await this.orders.createOrder({
      body: {
        intent: CheckoutPaymentIntent.Capture,
        purchaseUnits: [
          {
            customId: bookingId,
            description: `TaxiAG booking ${bookingId.slice(0, 8)} — ${quote.providerName}`,
            amount: {
              currencyCode: 'GBP',
              value: amountGbp.toFixed(2),
            },
          },
        ],
        applicationContext: {
          returnUrl: this.returnUrl,
          cancelUrl: this.cancelUrl,
          brandName: 'TaxiAG (sandbox)',
          userAction: OrderApplicationContextUserAction.PayNow,
        },
      },
      prefer: 'return=representation',
    });
    const order = body as unknown as {
      id?: string;
      links?: Array<{ rel?: string; href?: string }>;
    };
    const approveUrl = order.links?.find(
      (l) => l.rel === 'approve' || l.rel === 'payer-action',
    )?.href;
    if (!order.id || !approveUrl) throw new Error('paypal-order-failed');
    this.orderLinks.set(order.id, bookingId);
    return { orderId: order.id, approveUrl, amountGbp };
  }

  /** TaxiAG booking a sandbox order was created for (undefined when unknown). */
  bookingForOrder(orderId: string): string | undefined {
    return this.orderLinks.get(orderId);
  }

  async captureOrder(orderId: string): Promise<PayPalCapture> {
    if (!this.orders) throw new Error('paypal-not-configured');
    const { body } = await this.orders.captureOrder({
      id: orderId,
      prefer: 'return=representation',
    });
    const order = body as unknown as {
      status?: string;
      purchaseUnits?: Array<{
        payments?: { captures?: Array<{ id?: string; amount?: { value?: string } }> };
      }>;
    };
    const capture = order.purchaseUnits?.[0]?.payments?.captures?.[0];
    if (order.status !== 'COMPLETED' || !capture?.id) {
      throw new Error(`paypal-capture-incomplete:${order.status ?? 'unknown'}`);
    }
    return {
      orderId,
      captureId: capture.id,
      amountGbp: Number(capture.amount?.value ?? 0),
      status: order.status,
    };
  }
}

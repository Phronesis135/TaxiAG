import { ConfigService } from '@nestjs/config';
import { chargeableAmount, PayPalService } from './paypal.service';
import type { Quote } from '../providers/provider-adapter.interface';

const emptyConfig = { get: () => undefined } as unknown as ConfigService;

const base = {
  id: 'q',
  providerId: 'p',
  providerName: 'P',
  vehicleClass: 'standard',
  currency: 'GBP',
  validUntil: new Date().toISOString(),
  pickupEtaMin: 5,
  fees: [],
  cancellationSummary: '',
} as unknown as Quote;

describe('PayPalService', () => {
  it('stays disabled without sandbox credentials', async () => {
    const paypal = new PayPalService(emptyConfig);
    expect(paypal.enabled).toBe(false);
    await expect(
      paypal.createOrder('b1', { ...base }),
    ).rejects.toThrow('paypal-not-configured');
    await expect(paypal.captureOrder('o1')).rejects.toThrow(
      'paypal-not-configured',
    );
  });

  it('charges fixed amount, estimated max, metered from-price', () => {
    expect(
      chargeableAmount({ ...base, priceType: 'fixed', amount: 20 }),
    ).toBe(20);
    expect(
      chargeableAmount({
        ...base,
        priceType: 'estimated',
        range: { min: 16, max: 21 },
      }),
    ).toBe(21);
    expect(
      chargeableAmount({ ...base, priceType: 'metered', amount: 15 }),
    ).toBe(15);
  });
});

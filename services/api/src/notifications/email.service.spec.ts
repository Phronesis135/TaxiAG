import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import { RECEIPT } from './receipt.spec';

const emptyConfig = { get: () => undefined } as unknown as ConfigService;

describe('EmailService', () => {
  it('stays disabled without keys and never throws on send', async () => {
    const email = new EmailService(emptyConfig);
    expect(email.enabled).toBe(false);
    await expect(
      email.sendPaymentReceipt('x@example.com', RECEIPT),
    ).resolves.toEqual({ sent: false });
  });
});

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { receiptHtml, receiptSubject, type ReceiptData } from './receipt';

@Injectable()
export class EmailService {
  private readonly client?: Resend;
  private readonly from?: string;

  constructor(private readonly config: ConfigService) {
    const key = config.get<string>('RESEND_API_KEY');
    this.from = config.get<string>('RESEND_FROM_EMAIL');
    if (key) this.client = new Resend(key);
  }

  /** False until RESEND_API_KEY + RESEND_FROM_EMAIL are set — callers skip gracefully. */
  get enabled(): boolean {
    return !!this.client && !!this.from;
  }

  async sendPaymentReceipt(
    to: string,
    receipt: ReceiptData,
  ): Promise<{ sent: boolean; id?: string }> {
    if (!this.client || !this.from) return { sent: false };
    const { data, error } = await this.client.emails.send({
      from: this.from,
      to,
      subject: receiptSubject(receipt),
      html: receiptHtml(receipt),
    });
    if (error) throw new Error(`resend: ${error.message}`);
    return { sent: true, id: data?.id };
  }
}

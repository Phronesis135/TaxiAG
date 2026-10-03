import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { ProvidersService } from '../providers/providers.service';

interface CreateBookingBody {
  quoteId?: unknown;
  passenger?: { name?: unknown; phone?: unknown; email?: unknown };
  bookForOther?: unknown;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Controller('v1')
export class BookingsController {
  constructor(
    private readonly bookings: BookingsService,
    private readonly providers: ProvidersService,
  ) {}

  /** Price protection check (PRD §8). */
  @Post('quotes/:id/revalidate')
  async revalidate(@Param('id') id: string) {
    const re = await this.providers.revalidate(id);
    if (!re) throw new NotFoundException('quote not found');
    return re;
  }

  @Post('bookings')
  async create(@Body() body: CreateBookingBody) {
    if (typeof body.quoteId !== 'string' || !body.quoteId) {
      throw new BadRequestException('quoteId is required');
    }
    const name = body.passenger?.name;
    const phone = body.passenger?.phone;
    if (typeof name !== 'string' || !name.trim()) {
      throw new BadRequestException('passenger.name is required');
    }
    if (typeof phone !== 'string' || !phone.trim()) {
      throw new BadRequestException('passenger.phone is required');
    }
    const email = body.passenger?.email;
    if (email !== undefined && (typeof email !== 'string' || !EMAIL_RE.test(email))) {
      throw new BadRequestException('passenger.email must be a valid email address');
    }
    try {
      const out = await this.bookings.create(
        body.quoteId,
        {
          name: name.trim(),
          phone: phone.trim(),
          ...(email ? { email } : {}),
        },
        body.bookForOther === true,
      );
      if ('revalidation' in out) {
        // 409: price changed — client must confirm the replacement quote.
        return { ...out, confirmed: false };
      }
      return { ...out, confirmed: true };
    } catch (err) {
      if ((err as Error).message === 'quote-not-found') {
        throw new NotFoundException('quote not found');
      }
      throw err;
    }
  }

  @Get('bookings/:id')
  get(@Param('id') id: string) {
    const record = this.bookings.get(id);
    if (!record) throw new NotFoundException('booking not found');
    return record;
  }

  @Post('bookings/:id/cancel')
  async cancel(@Param('id') id: string) {
    const record = await this.bookings.cancel(id);
    if (!record) throw new NotFoundException('booking not found');
    return record;
  }
}

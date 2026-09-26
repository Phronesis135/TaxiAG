import {
  BadRequestException,
  Body,
  Controller,
  Post,
} from '@nestjs/common';
import type { JourneyInput } from './provider-adapter.interface';
import { ProvidersService, type SearchResult } from './providers.service';

function isPoint(p: unknown): p is { lat: number; lng: number } {
  if (typeof p !== 'object' || p === null) return false;
  const { lat, lng } = p as Record<string, unknown>;
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  );
}

@Controller('v1')
export class ProvidersController {
  constructor(private readonly providers: ProvidersService) {}

  @Post('search')
  search(@Body() body: unknown): Promise<SearchResult> {
    const journey = body as Partial<JourneyInput>;
    if (!isPoint(journey.pickup) || !isPoint(journey.dropoff)) {
      throw new BadRequestException(
        'pickup and dropoff must be { lat, lng } points',
      );
    }
    if (!journey.when || Number.isNaN(Date.parse(journey.when))) {
      throw new BadRequestException('when must be an ISO-8601 datetime');
    }
    if (!Number.isInteger(journey.passengers) || (journey.passengers as number) < 1) {
      throw new BadRequestException('passengers must be an integer >= 1');
    }
    if (
      journey.maxPrice !== undefined &&
      (typeof journey.maxPrice !== 'number' || journey.maxPrice <= 0)
    ) {
      throw new BadRequestException('maxPrice must be a positive number');
    }
    return this.providers.search(journey as JourneyInput);
  }
}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
import { DbModule } from './db/db.module';
import { HealthModule } from './health/health.module';
import { ProvidersModule } from './providers/providers.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(__dirname, '..', '..', '..', '.env'),
    }),
    DbModule,
    HealthModule,
    ProvidersModule,
    BookingsModule,
    PaymentsModule,
    NotificationsModule,
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { BookingsModule } from '../bookings/bookings.module';
import { PaymentsController } from './payments.controller';
import { PayPalService } from './paypal.service';

@Module({
  imports: [BookingsModule],
  controllers: [PaymentsController],
  providers: [PayPalService],
  exports: [PayPalService],
})
export class PaymentsModule {}

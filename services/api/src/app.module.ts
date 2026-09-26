import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
import { DbModule } from './db/db.module';
import { HealthModule } from './health/health.module';
import { ProvidersModule } from './providers/providers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(__dirname, '..', '..', '..', '.env'),
    }),
    DbModule,
    HealthModule,
    ProvidersModule,
  ],
})
export class AppModule {}

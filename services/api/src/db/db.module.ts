import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'PG_POOL',
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) =>
        new Pool({
          connectionString: cfg.getOrThrow<string>('DATABASE_URL'),
          max: 5,
        }),
    },
    {
      provide: 'REDIS',
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) =>
        new Redis(cfg.getOrThrow<string>('REDIS_URL'), {
          maxRetriesPerRequest: 2,
          enableReadyCheck: false,
        }),
    },
  ],
  exports: ['PG_POOL', 'REDIS'],
})
export class DbModule {}

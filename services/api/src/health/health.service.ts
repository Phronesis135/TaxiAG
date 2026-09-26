import { Inject, Injectable } from '@nestjs/common';
import type { Pool } from 'pg';
import type Redis from 'ioredis';

export interface HealthStatus {
  status: 'ok' | 'degraded';
  version: string;
  uptimeSec: number;
  checks: {
    postgres: boolean;
    redis: boolean;
  };
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('health check timeout')), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

@Injectable()
export class HealthService {
  constructor(
    @Inject('PG_POOL') private readonly pg: Pool,
    @Inject('REDIS') private readonly redis: Redis,
  ) {}

  static summarize(postgresOk: boolean, redisOk: boolean): 'ok' | 'degraded' {
    return postgresOk && redisOk ? 'ok' : 'degraded';
  }

  async check(): Promise<HealthStatus> {
    const [postgresOk, redisOk] = await Promise.all([
      withTimeout(
        this.pg
          .query('SELECT 1')
          .then(() => true)
          .catch(() => false),
        2000,
      ).catch(() => false),
      withTimeout(
        this.redis
          .ping()
          .then(() => true)
          .catch(() => false),
        2000,
      ).catch(() => false),
    ]);
    return {
      status: HealthService.summarize(postgresOk, redisOk),
      version: '0.2.0',
      uptimeSec: Math.round(process.uptime()),
      checks: { postgres: postgresOk, redis: redisOk },
    };
  }
}

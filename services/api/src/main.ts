import { configDotenv } from 'dotenv';
import * as path from 'path';

// Load repo-root .env first — works from src (dev) and dist (built).
configDotenv({ path: path.resolve(__dirname, '..', '..', '..', '.env') });

import { NestFactory } from '@nestjs/core';
import { json } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { AppModule } from './app.module';
import { auth } from './auth/auth';

async function bootstrap() {
  // bodyParser is disabled so Better Auth receives raw requests on /api/auth/*.
  // JSON parsing is re-added below for our own routes (registered during listen,
  // i.e. after these mounts, so it runs before Nest route handlers).
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  // Local web MVP (http://localhost:3000) calls the API from the browser.
  app.enableCors({ origin: ['http://localhost:3000'] });
  const server = app.getHttpAdapter().getInstance();
  server.use('/api/auth', toNodeHandler(auth));
  server.use(json());
  app.enableShutdownHooks();
  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`taxiag api listening on :${port}`);
}

bootstrap();

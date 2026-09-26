import { betterAuth } from 'better-auth';
import { Pool } from 'pg';

// Dedicated pool for auth (separate from the app pool so auth load is isolated).
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 3,
});

const hasGoogle =
  !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;
const hasApple =
  !!process.env.APPLE_CLIENT_ID && !!process.env.APPLE_CLIENT_SECRET;

export const auth = betterAuth({
  database: pool,
  basePath: '/api/auth',
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  socialProviders: {
    ...(hasGoogle
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
          },
        }
      : {}),
    ...(hasApple
      ? {
          apple: {
            clientId: process.env.APPLE_CLIENT_ID as string,
            clientSecret: process.env.APPLE_CLIENT_SECRET as string,
          },
        }
      : {}),
  },
  // NOTE (Phase 0.3+): email/phone OTP plugins land with the Twilio + Postmark
  // workstream. Social logins activate automatically once the *_CLIENT_* env
  // vars are set — no code change needed.
});

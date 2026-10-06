# auth

A standalone authentication service, built to be shared across multiple separate apps. Signup, login, session-based access via short-lived JWTs, and rotating/revocable refresh tokens.

## Stack

- **Runtime:** Node.js, TypeScript, [Fastify](https://fastify.dev)
- **Database:** PostgreSQL ([Neon](https://neon.tech)), via [Drizzle ORM](https://orm.drizzle.team)
- **Validation:** [Zod](https://zod.dev) (`fastify-type-provider-zod`)
- **Auth:** asymmetric JWT access tokens (EdDSA, via [`jose`](https://github.com/panva/jose)) + stateful, rotating refresh tokens
- **Password hashing:** [argon2](https://github.com/ranisalt/node-argon2)
- **Logging:** [Pino](https://getpino.io)
- **Tests:** [Vitest](https://vitest.dev)

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in a real Postgres connection string:
   ```
   cp .env.example .env
   ```

3. Generate a signing key pair (used to sign/verify access tokens). The private key stays local and is gitignored; the public key is safe to commit and share with any app that needs to verify tokens:
   ```
   node --input-type=module -e "
   import { generateKeyPair, exportPKCS8, exportSPKI } from 'jose';
   import { writeFile } from 'node:fs/promises';
   const { privateKey, publicKey } = await generateKeyPair('EdDSA', { crv: 'Ed25519', extractable: true });
   await writeFile('keys/private.pem', await exportPKCS8(privateKey));
   await writeFile('keys/public.pem', await exportSPKI(publicKey));
   "
   ```

4. Run database migrations:
   ```
   npm run db:generate
   npm run db:migrate
   ```

5. Start the dev server:
   ```
   npm run dev
   ```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run db:generate` | Generate a new Drizzle migration from schema changes |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:studio` | Open Drizzle Studio against the configured database |

## API

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health-check` | — | Liveness check |
| `POST` | `/signup` | — | Create a user, returns `{ id, email }` |
| `POST` | `/login` | — | Verify credentials, returns `{ accessToken, refreshToken }` |
| `GET` | `/me` | Bearer access token | Returns the authenticated user's `{ id, email }` |
| `POST` | `/refresh` | — (refresh token in body) | Exchanges a refresh token for a new token pair, rotating the refresh token |
| `POST` | `/logout` | — (refresh token in body) | Revokes a refresh token |

Request/response examples are in `http/auth.http` (JetBrains HTTP Client format).

## Environment variables

See `.env.example`. `DATABASE_URL`, `LOG_LEVEL`, `WEBSERVER_PORT`, `WEBSERVER_HOST`, and `ENVIRONMENT` (`dev`/`prod`) are required.

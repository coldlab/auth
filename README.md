# auth

A standalone authentication service, built to be shared across multiple separate apps. Signup, login, session-based access via short-lived JWTs, and rotating/revocable refresh tokens.

## Stack

- **Runtime:** Node.js, TypeScript, [Fastify](https://fastify.dev)
- **Database:** PostgreSQL ([Neon](https://neon.tech)), via [Drizzle ORM](https://orm.drizzle.team)
- **Validation:** [Zod](https://zod.dev) (`fastify-type-provider-zod`)
- **Auth:** asymmetric JWT access tokens (EdDSA, via [`jose`](https://github.com/panva/jose)) + stateful, rotating refresh tokens
- **Password hashing:** [argon2](https://github.com/ranisalt/node-argon2)
- **Logging:** [Pino](https://getpino.io)
- **Hardening:** [`@fastify/rate-limit`](https://github.com/fastify/fastify-rate-limit), [`@fastify/helmet`](https://github.com/fastify/fastify-helmet) (security headers)
- **API docs:** [`@fastify/swagger`](https://github.com/fastify/fastify-swagger) + [`@fastify/swagger-ui`](https://github.com/fastify/fastify-swagger-ui), generated from the Zod schemas
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

3. Generate a signing key pair (used to sign/verify access tokens). The public key is written to `keys/public.pem`, which is safe to commit. The private key is printed as a `PRIVATE_KEY_PEM=...` line for you to paste into `.env`. It's read from the environment, never from disk, so don't commit it:
   ```
   node --input-type=module -e "
   import { generateKeyPair, exportPKCS8, exportSPKI } from 'jose';
   import { writeFile } from 'node:fs/promises';
   const { privateKey, publicKey } = await generateKeyPair('EdDSA', { crv: 'Ed25519', extractable: true });
   await writeFile('keys/public.pem', await exportSPKI(publicKey));
   console.log('PRIVATE_KEY_PEM=\"' + (await exportPKCS8(privateKey)).trim() + '\"');
   "
   ```
   Paste the printed value into `.env` as a multi-line quoted value.

   Apps that verify tokens should use the JWKS endpoint (`/.well-known/jwks.json`) instead of copying `public.pem` by hand.

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
| `GET` | `/.well-known/jwks.json` | — | Public signing key as a JWKS, for other services to verify access tokens (single key, no rotation yet) |
| `GET` | `/documentation` | — | Interactive Swagger UI (**dev only**; raw OpenAPI spec at `/documentation/json`) |

Request/response examples are in `http/auth.http` (JetBrains HTTP Client format).

### Rate limits

All routes share a global limit of 100 requests/minute per client. `/signup`, `/login`, and `/refresh` have a stricter limit of 10 requests/minute. Over the limit, the API returns `429` with the usual `{ "error": "..." }` body.

All responses also carry the default security headers from `@fastify/helmet`.

## Environment variables

See `.env.example`. `DATABASE_URL`, `LOG_LEVEL`, `WEBSERVER_PORT`, `WEBSERVER_HOST`, `ENVIRONMENT` (`dev`/`prod`), and `PRIVATE_KEY_PEM` (the Ed25519 private key in PKCS#8 PEM format, see Setup step 3) are required. Swagger docs are only served when `ENVIRONMENT` is `dev`.

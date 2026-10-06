import {generateRefreshToken, hashRefreshToken} from "../auth/refresh-tokens.js";
import {db} from "../db/index.js";
import {refreshTokensTable} from "../db/schema/index.js";
import {eq} from "drizzle-orm";
import {InvalidRefreshTokenError} from "../core/errors.js";

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export async function issueRefreshToken(userId: string): Promise<string> {
    const rawToken = generateRefreshToken()

    await db.insert(refreshTokensTable).values({
        userId,
        tokenHash: hashRefreshToken(rawToken),
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    })

    return rawToken
}

export async function rotateRefreshToken(rawToken: string): Promise<{ userId: string, refreshToken: string}> {
    const tokenHash = hashRefreshToken(rawToken);
    const [row] = await db.select().from(refreshTokensTable).where(eq(refreshTokensTable.tokenHash, tokenHash));

    if (!row || row.revokedAt !== null || row.expiresAt < new Date()) {
        throw new InvalidRefreshTokenError()
    }

    const newRawToken = generateRefreshToken();

    await db.batch([
        db.update(refreshTokensTable).set({ revokedAt: new Date() }).where(eq(refreshTokensTable.id, row.id)),
        db.insert(refreshTokensTable).values({
            userId: row.userId,
            tokenHash: hashRefreshToken(newRawToken),
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
        })
    ])

    return { userId: row.userId, refreshToken: newRawToken };
}

export async function revokeRefreshToken(rawToken: string): Promise<void> {
    const tokenHash = hashRefreshToken(rawToken);
    await db.update(refreshTokensTable).set({ revokedAt: new Date() }).where(eq(refreshTokensTable.tokenHash, tokenHash));
}

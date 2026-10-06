import {createHash, randomBytes} from "node:crypto";

const refreshTokenSize = 32
const refreshTokenEncoding = "base64url"
const hashingAlgorithm = "sha256"
const hashEncoding = "hex"

export function generateRefreshToken(): string {
    return randomBytes(refreshTokenSize).toString(refreshTokenEncoding)
}

export function hashRefreshToken(token: string): string {
    return createHash(hashingAlgorithm).update(token).digest(hashEncoding)
}
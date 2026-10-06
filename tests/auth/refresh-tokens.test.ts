import { describe, it, expect } from "vitest";
import { generateRefreshToken, hashRefreshToken } from "../../src/auth/refresh-tokens.js";

describe("refresh token helpers", () => {
    it("generates a URL-safe token with no padding", () => {
        const token = generateRefreshToken();
        expect(token).not.toContain("=");
        expect(token).not.toContain("+");
        expect(token).not.toContain("/");
    });

    it("generates different tokens on each call", () => {
        expect(generateRefreshToken()).not.toBe(generateRefreshToken());
    });

    it("hashes deterministically", () => {
        const token = generateRefreshToken();
        expect(hashRefreshToken(token)).toBe(hashRefreshToken(token));
    });

    it("produces different hashes for different tokens", () => {
        expect(hashRefreshToken(generateRefreshToken())).not.toBe(hashRefreshToken(generateRefreshToken()));
    });
});

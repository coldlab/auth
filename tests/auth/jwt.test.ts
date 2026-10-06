import { describe, it, expect } from "vitest";
import { signAccessToken, verifyAccessToken } from "../../src/auth/jwt.js";

describe("access tokens", () => {
    it("round-trips a user id through sign and verify", async () => {
        const token = await signAccessToken("user-123");
        const payload = await verifyAccessToken(token);
        expect(payload.sub).toBe("user-123");
    });

    it("rejects a tampered token", async () => {
        const token = await signAccessToken("user-123");
        const [header, payload, signature] = token.split(".");
        const corruptedChar = signature[10] === "A" ? "B" : "A";
        const corruptedSignature = signature.slice(0, 10) + corruptedChar + signature.slice(11);
        const tampered = `${header}.${payload}.${corruptedSignature}`;
        await expect(verifyAccessToken(tampered)).rejects.toThrow();
    });
});

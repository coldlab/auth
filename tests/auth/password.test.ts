import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "../../src/auth/password.js";

describe("password hashing", () => {
    it("produces a hash that verifies against the original password", async () => {
        const hash = await hashPassword("correct-horse-battery");
        await expect(verifyPassword(hash, "correct-horse-battery")).resolves.toBe(true);
    });

    it("rejects an incorrect password", async () => {
        const hash = await hashPassword("correct-horse-battery");
        await expect(verifyPassword(hash, "wrong-password")).resolves.toBe(false);
    });
});

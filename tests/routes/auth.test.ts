import { describe, it, expect, afterAll } from "vitest";
import { buildApp } from "../../src/app.js";
import { db } from "../../src/db";
import { usersTable, refreshTokensTable } from "../../src/db/schema";
import { eq } from "drizzle-orm";

const app = buildApp();
const testEmail = `vitest-${Date.now()}@example.com`;
const testPassword = "correct-horse-battery";

afterAll(async () => {
    const [user] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, testEmail));
    if (user) {
        await db.delete(refreshTokensTable).where(eq(refreshTokensTable.userId, user.id));
        await db.delete(usersTable).where(eq(usersTable.id, user.id));
    }
});

describe("auth routes", () => {
    it("signs up a new user", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/signup",
            payload: { email: testEmail, password: testPassword },
        });
        expect(response.statusCode).toBe(201);
        expect(response.json().email).toBe(testEmail);
    });

    it("rejects a duplicate signup", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/signup",
            payload: { email: testEmail, password: testPassword },
        });
        expect(response.statusCode).toBe(409);
    });

    it("rejects login with the wrong password", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/login",
            payload: { email: testEmail, password: "wrong-password" },
        });
        expect(response.statusCode).toBe(401);
    });

    it("logs in and accesses /me with the token", async () => {
        const login = await app.inject({
            method: "POST",
            url: "/login",
            payload: { email: testEmail, password: testPassword },
        });
        expect(login.statusCode).toBe(200);
        const { accessToken } = login.json();

        const me = await app.inject({
            method: "GET",
            url: "/me",
            headers: { authorization: `Bearer ${accessToken}` },
        });
        expect(me.statusCode).toBe(200);
        expect(me.json().email).toBe(testEmail);
    });

    it("rejects /me with no token", async () => {
        const response = await app.inject({ method: "GET", url: "/me" });
        expect(response.statusCode).toBe(401);
    });
});

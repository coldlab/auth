import { describe, it, expect } from "vitest";
import { parseEnvironment, Environment } from "../../src/core/environments.js";

describe("parseEnvironment", () => {
    it("accepts valid environments", () => {
        expect(parseEnvironment("dev")).toBe(Environment.Development);
        expect(parseEnvironment("prod")).toBe(Environment.Production);
    });

    it("rejects an invalid environment", () => {
        expect(() => parseEnvironment("staging")).toThrow();
    });
});

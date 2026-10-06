import { describe, it, expect } from "vitest";
import { parseLogLevel } from "../../src/core/log-level.js";

describe("parseLogLevel", () => {
    it("accepts a valid level", () => {
        expect(parseLogLevel("info")).toBe("info");
    });

    it("normalizes case", () => {
        expect(parseLogLevel("INFO")).toBe("info");
    });

    it("rejects an invalid level", () => {
        expect(() => parseLogLevel("nonsense")).toThrow();
    });
});

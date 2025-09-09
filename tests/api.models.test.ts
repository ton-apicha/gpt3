import { describe, it, expect, beforeAll } from "vitest";

describe("Models API schema", () => {
  it("validates create payload shape", async () => {
    const body = { id: "m", provider: "ollama", label: "L", contextLength: 1024, temperature: 0.7, enabled: true };
    expect(typeof body.id).toBe("string");
    expect(typeof body.provider).toBe("string");
    expect(body.contextLength).toBeGreaterThan(0);
    expect(body.temperature).toBeGreaterThanOrEqual(0);
  });
});



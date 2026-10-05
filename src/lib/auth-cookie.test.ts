import { describe, expect, it } from "vitest";
import { expiracionJwt, maxAgeDesdeToken } from "./auth-cookie";

describe("auth-cookie", () => {
  it("usa 30 días si recordarme y 1 día si no", () => {
    expect(expiracionJwt(true)).toBe("30d");
    expect(expiracionJwt(false)).toBe("1d");
  });

  it("lee el exp del JWT para la cookie", () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const payload = Buffer.from(JSON.stringify({ exp }), "utf8").toString("base64url");
    const token = `aaa.${payload}.bbb`;
    expect(maxAgeDesdeToken(token)).toBeGreaterThan(3500);
    expect(maxAgeDesdeToken(token)).toBeLessThanOrEqual(3600);
  });
});
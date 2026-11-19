import { describe, expect, it } from "vitest";
import { decrypt, encrypt, safeDecrypt } from "@/lib/crypto/encrypt";

describe("AES-256-GCM encryption", () => {
  it("roundtrips Chinese text", () => {
    const text = "我今天很累，但我想试一个小行动。";
    const cipher = encrypt(text);
    expect(cipher.startsWith("v1.")).toBe(true);
    expect(decrypt(cipher)).toBe(text);
  });

  it("produces different ciphertext for the same plaintext (random IV)", () => {
    const a = encrypt("同一句话");
    const b = encrypt("同一句话");
    expect(a).not.toBe(b);
  });

  it("detects tampering", () => {
    const cipher = encrypt("不要被篡改");
    const parts = cipher.split(".");
    parts[3] = `${parts[3].slice(0, -2)}AA`;
    expect(() => decrypt(parts.join("."))).toThrow();
  });

  it("safeDecrypt returns empty string on invalid input", () => {
    expect(safeDecrypt("not-a-cipher")).toBe("");
  });
});

import { describe, it, expect, beforeAll } from "vitest";
import { randomBytes } from "node:crypto";
import { decryptSecret, encryptSecret, SecretDecryptError } from "./crypto";

beforeAll(() => {
  process.env.SETTINGS_ENCRYPTION_KEY = randomBytes(32).toString("base64");
});

describe("settings/crypto", () => {
  it("faz round-trip de um segredo", () => {
    const secret = "sk-ant-abc123";
    expect(decryptSecret(encryptSecret(secret))).toBe(secret);
  });

  it("usa IV fresco (dois textos cifrados diferem)", () => {
    expect(encryptSecret("igual")).not.toBe(encryptSecret("igual"));
  });

  it("lança SecretDecryptError em ciphertext adulterado", () => {
    const [iv, tag, ct] = encryptSecret("segredo").split(":");
    const tampered = [iv, tag, Buffer.from("xxxx").toString("base64") + ct].join(":");
    expect(() => decryptSecret(tampered)).toThrow(SecretDecryptError);
  });

  it("lança SecretDecryptError em payload malformado", () => {
    expect(() => decryptSecret("nao-e-valido")).toThrow(SecretDecryptError);
  });

  it("rejeita chave-mestra com tamanho inválido", () => {
    const prev = process.env.SETTINGS_ENCRYPTION_KEY;
    process.env.SETTINGS_ENCRYPTION_KEY = Buffer.from("curta").toString("base64");
    expect(() => encryptSecret("x")).toThrow();
    process.env.SETTINGS_ENCRYPTION_KEY = prev;
  });
});

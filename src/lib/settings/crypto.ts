import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

// Criptografia simétrica das credenciais salvas no painel.
// Esquema: AES-256-GCM. A chave-mestra (32 bytes) vem de SETTINGS_ENCRYPTION_KEY
// (base64) e nunca é versionada. Formato armazenado:
//   base64(iv) ":" base64(authTag) ":" base64(ciphertext)

const ALGO = "aes-256-gcm";
const IV_BYTES = 12; // nonce recomendado para GCM

/** Lançada quando um segredo não pôde ser decifrado (chave errada/dado corrompido). */
export class SecretDecryptError extends Error {
  constructor(message = "Falha ao decifrar o segredo.") {
    super(message);
    this.name = "SecretDecryptError";
  }
}

// Lida dentro da função (não no topo do módulo) para os testes poderem setar o env antes.
function getKey(): Buffer {
  const raw = process.env.SETTINGS_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error("SETTINGS_ENCRYPTION_KEY ausente no ambiente.");
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error(
      "SETTINGS_ENCRYPTION_KEY inválida — esperado base64 de 32 bytes.",
    );
  }
  return key;
}

/** Cifra um texto puro. Retorna "base64(iv):base64(tag):base64(ciphertext)". */
export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGO, getKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [
    iv.toString("base64"),
    tag.toString("base64"),
    ciphertext.toString("base64"),
  ].join(":");
}

/** Decifra um payload no formato acima. Lança {@link SecretDecryptError} em qualquer falha. */
export function decryptSecret(payload: string): string {
  try {
    const [ivB64, tagB64, ctB64] = payload.split(":");
    if (!ivB64 || !tagB64 || !ctB64) throw new Error("formato inválido");
    const decipher = createDecipheriv(
      ALGO,
      getKey(),
      Buffer.from(ivB64, "base64"),
    );
    decipher.setAuthTag(Buffer.from(tagB64, "base64"));
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(ctB64, "base64")),
      decipher.final(),
    ]);
    return plaintext.toString("utf8");
  } catch {
    // Nunca propagar detalhes nem o conteúdo — apenas sinalizar a falha.
    throw new SecretDecryptError();
  }
}

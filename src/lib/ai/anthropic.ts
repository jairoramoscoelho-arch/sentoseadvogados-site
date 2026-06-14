import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { getSecret } from "@/lib/settings/store";

/** Lançada quando a chave da Anthropic não está configurada (nem no painel nem no env). */
export class AnthropicNotConfiguredError extends Error {
  constructor() {
    super("Chave da Anthropic não configurada. Configure em Administração → Integrações.");
    this.name = "AnthropicNotConfiguredError";
  }
}

/** Modelo padrão do estúdio. */
export const STUDIO_MODEL = "claude-opus-4-8";

/** Cria um client Claude com a chave resolvida (painel → env). Server-only. */
export async function createAnthropicClient(): Promise<Anthropic> {
  const apiKey = await getSecret("anthropic_api_key");
  if (!apiKey) throw new AnthropicNotConfiguredError();
  return new Anthropic({ apiKey });
}

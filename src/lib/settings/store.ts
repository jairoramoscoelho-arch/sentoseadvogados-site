import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { decryptSecret, encryptSecret } from "@/lib/settings/crypto";

/**
 * Store das credenciais de integração. Resolução de cada segredo:
 *   1. valor cifrado no banco (override do painel), decifrado server-side;
 *   2. variável de ambiente (.env / Vercel) como padrão;
 *   3. null.
 * O navegador nunca recebe o valor — só o status mascarado.
 */

export interface KnownIntegration {
  key: string;
  label: string;
  description: string;
  envVar: string;
}

export const KNOWN_INTEGRATIONS: readonly KnownIntegration[] = [
  {
    key: "anthropic_api_key",
    label: "Anthropic (Claude)",
    description: "Motor de IA para triagem dos relatos e redação das peças.",
    envVar: "ANTHROPIC_API_KEY",
  },
  {
    key: "openai_api_key",
    label: "OpenAI (Whisper)",
    description: "Transcrição de voz no cadastro do relato do cliente (STT).",
    envVar: "OPENAI_API_KEY",
  },
  {
    key: "resend_api_key",
    label: "Resend (E-mail)",
    description: "Envio das peças por e-mail a partir do escritório.",
    envVar: "RESEND_API_KEY",
  },
] as const;

export type IntegrationSource = "db" | "env" | null;

export interface IntegrationStatus {
  key: string;
  label: string;
  description: string;
  isSet: boolean;
  source: IntegrationSource;
  updatedAt: string | null;
}

export const KNOWN_KEYS = KNOWN_INTEGRATIONS.map((i) => i.key) as [
  string,
  ...string[],
];

function known(key: string): KnownIntegration {
  const found = KNOWN_INTEGRATIONS.find((i) => i.key === key);
  if (!found) throw new Error(`Integração desconhecida: ${key}`);
  return found;
}

/** Resolve um segredo: banco (decifrado) → variável de ambiente → null. */
export async function getSecret(key: string): Promise<string | null> {
  const integration = known(key);
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("integration_settings")
    .select("value_encrypted")
    .eq("key", key)
    .maybeSingle();

  if (data?.value_encrypted) {
    try {
      return decryptSecret(data.value_encrypted as string);
    } catch {
      // Chave-mestra ausente/rotacionada ou dado corrompido — cai no fallback.
      console.error(
        `[settings] não foi possível decifrar "${key}"; usando o valor de ambiente.`,
      );
    }
  }
  return process.env[integration.envVar] ?? null;
}

/** Salva (cria ou rotaciona) um segredo cifrado. */
export async function setSecret(
  key: string,
  value: string,
  updatedBy: string,
): Promise<void> {
  known(key);
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("integration_settings").upsert(
    {
      key,
      value_encrypted: encryptSecret(value),
      updated_by: updatedBy,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );
  if (error) throw new Error(error.message);
}

/** Remove o override do banco (o fallback de ambiente, se houver, permanece). */
export async function clearSecret(key: string): Promise<void> {
  known(key);
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("integration_settings")
    .delete()
    .eq("key", key);
  if (error) throw new Error(error.message);
}

/** Status mascarado de cada integração conhecida (nunca devolve o valor). */
export async function listIntegrationStatus(): Promise<IntegrationStatus[]> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("integration_settings")
    .select("key, updated_at");

  const dbRows = new Map<string, string | null>(
    (data ?? []).map((r) => [
      r.key as string,
      (r.updated_at as string | null) ?? null,
    ]),
  );

  return KNOWN_INTEGRATIONS.map((i) => {
    if (dbRows.has(i.key)) {
      return {
        key: i.key,
        label: i.label,
        description: i.description,
        isSet: true,
        source: "db",
        updatedAt: dbRows.get(i.key) ?? null,
      };
    }
    const envSet = Boolean(process.env[i.envVar]);
    return {
      key: i.key,
      label: i.label,
      description: i.description,
      isSet: envSet,
      source: envSet ? "env" : null,
      updatedAt: null,
    };
  });
}

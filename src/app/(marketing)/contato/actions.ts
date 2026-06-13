"use server";

import { z } from "zod";
import { sendContactEmail, EmailNotConfiguredError } from "@/lib/email";
import type { ContactState } from "@/lib/contact";

const schema = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(120),
  email: z.string().trim().email("Informe um e-mail válido."),
  phone: z.string().trim().max(40).optional(),
  subject: z.string().trim().max(160).optional(),
  message: z
    .string()
    .trim()
    .min(10, "Escreva uma mensagem com mais detalhes.")
    .max(4000),
});

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Honeypot: bots costumam preencher campos ocultos.
  if ((formData.get("website") as string)?.length) {
    return { ok: true, message: "Mensagem enviada com sucesso." };
  }

  // Checagem de tempo: envios em menos de 2s são, provavelmente, bots.
  const ts = Number(formData.get("_ts"));
  if (ts && Date.now() - ts < 2000) {
    return {
      ok: false,
      message: "Envio muito rápido. Por favor, tente novamente.",
    };
  }

  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    subject: formData.get("subject") || undefined,
    message: formData.get("message"),
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? "form";
      if (!errors[key]) errors[key] = issue.message;
    }
    return { ok: false, message: "Verifique os campos destacados.", errors };
  }

  try {
    await sendContactEmail(parsed.data);
    return {
      ok: true,
      message: "Mensagem enviada com sucesso! Retornaremos em breve.",
    };
  } catch (error) {
    if (error instanceof EmailNotConfiguredError) {
      return {
        ok: false,
        message:
          "No momento não foi possível enviar pelo site. Por favor, fale conosco pelo WhatsApp.",
      };
    }
    return {
      ok: false,
      message:
        "Não foi possível enviar agora. Tente novamente em instantes ou fale pelo WhatsApp.",
    };
  }
}

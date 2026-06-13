import { Resend } from "resend";

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

/** Lançado quando as variáveis de ambiente do Resend não estão configuradas. */
export class EmailNotConfiguredError extends Error {
  constructor() {
    super("Envio de e-mail não configurado (Resend).");
    this.name = "EmailNotConfiguredError";
  }
}

export async function sendContactEmail(payload: ContactPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    throw new EmailNotConfiguredError();
  }

  const resend = new Resend(apiKey);
  const lines = [
    `Nome: ${payload.name}`,
    `E-mail: ${payload.email}`,
    `Telefone: ${payload.phone ?? "—"}`,
    `Assunto: ${payload.subject ?? "—"}`,
    "",
    payload.message,
  ];

  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: payload.email,
    subject: `[Site] ${payload.subject?.trim() || "Novo contato"} — ${payload.name}`,
    text: lines.join("\n"),
  });

  if (error) {
    throw new Error(error.message);
  }
}

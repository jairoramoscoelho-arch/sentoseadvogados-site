/** Tipos compartilhados do formulário de contato (sem dependências de servidor). */

export interface ContactState {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
}

export const initialContactState: ContactState = { ok: false };

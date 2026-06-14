/** Helpers de telefone BR → ligar/WhatsApp. Puros, sem server-only. */

export function phoneDigits(phone: string | null | undefined): string {
  return (phone ?? "").replace(/\D/g, "");
}

/** Telefone com DDI 55 quando o armazenado é só DDD + número. */
function withCountryCode(digits: string): string {
  return digits.startsWith("55") && digits.length >= 12 ? digits : `55${digits}`;
}

export function telHref(phone: string | null | undefined): string | null {
  const d = phoneDigits(phone);
  if (d.length < 10) return null;
  return `tel:+${withCountryCode(d)}`;
}

export function whatsappHref(phone: string | null | undefined): string | null {
  const d = phoneDigits(phone);
  if (d.length < 10) return null;
  return `https://wa.me/${withCountryCode(d)}`;
}

/** (XX) XXXXX-XXXX / (XX) XXXX-XXXX; devolve o original se não reconhecer. */
export function formatPhone(phone: string | null | undefined): string {
  const d = phoneDigits(phone);
  const local = d.startsWith("55") && d.length > 11 ? d.slice(2) : d;
  if (local.length === 11)
    return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
  if (local.length === 10)
    return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
  return phone ?? "";
}

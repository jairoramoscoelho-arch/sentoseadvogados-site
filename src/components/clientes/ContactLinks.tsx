import { Phone, MessageCircle, Mail } from "lucide-react";
import { telHref, whatsappHref, formatPhone } from "@/lib/phone";
import { cn } from "@/lib/utils";

/**
 * Links de contato do cliente: telefone (ligar) + WhatsApp quando houver,
 * senão o e-mail. Componente puro — usável em server e client components.
 */
export function ContactLinks({
  phone,
  email,
  className,
}: {
  phone: string | null;
  email: string | null;
  className?: string;
}) {
  const tel = telHref(phone);
  const wa = whatsappHref(phone);
  const hasPhone = Boolean(tel || wa);

  if (!hasPhone && !email) {
    return <span className="text-xs text-muted/70">Sem contato</span>;
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm",
        className,
      )}
    >
      {hasPhone && (
        <span className="inline-flex items-center gap-1.5">
          <a
            href={tel ?? wa ?? undefined}
            className="tabular-nums font-medium text-green-700 transition-colors hover:text-green-800"
          >
            {formatPhone(phone)}
          </a>
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Abrir WhatsApp"
              className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-800 transition-colors hover:bg-green-100"
            >
              <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
              WhatsApp
            </a>
          )}
          {tel && (
            <a
              href={tel}
              aria-label="Ligar"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-green-700 transition-colors hover:bg-cloud"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
        </span>
      )}
      {email && (
        <a
          href={`mailto:${email}`}
          className="inline-flex max-w-full items-center gap-1.5 text-green-700 transition-colors hover:text-green-800"
        >
          <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{email}</span>
        </a>
      )}
    </div>
  );
}

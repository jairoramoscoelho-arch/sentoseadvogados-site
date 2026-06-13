import { whatsappUrl } from "@/content/site";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";

export function WhatsAppFloat() {
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com o escritório no WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lift transition-transform duration-200 hover:scale-105 focus-visible:scale-105"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}

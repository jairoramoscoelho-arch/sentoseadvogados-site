/**
 * Renderiza um bloco JSON-LD (schema.org) de forma segura.
 * Escapa `<` para evitar quebra do script. Server Component.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

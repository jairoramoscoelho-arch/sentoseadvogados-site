import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="font-serif text-6xl font-semibold text-gold-500">404</p>
      <h1 className="mt-4 font-serif text-3xl font-semibold text-ink">
        Página não encontrada
      </h1>
      <p className="mt-3 max-w-md text-muted">
        O conteúdo que você procura pode ter sido movido ou não existe mais.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button href="/" variant="primary">
          Voltar para o início
        </Button>
        <Button href="/contato" variant="outline">
          Falar com o escritório
        </Button>
      </div>
    </Container>
  );
}

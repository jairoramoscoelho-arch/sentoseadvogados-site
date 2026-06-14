import { requireSession } from "@/lib/auth/dal";
import { getDraft } from "@/lib/data/drafts";
import { getClient, getIntake } from "@/lib/data/clients";
import { TriageSchema } from "@/lib/ai/triage";
import { streamDraft } from "@/lib/ai/drafting";
import { AnthropicNotConfiguredError } from "@/lib/ai/anthropic";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  await requireSession();
  const { id } = await ctx.params;

  const draft = await getDraft(id);
  if (!draft) return new Response("Peça não encontrada.", { status: 404 });

  const intakeId = new URL(req.url).searchParams.get("intake");
  if (!intakeId) return new Response("Faltou o relato (intake).", { status: 400 });

  const intake = await getIntake(intakeId);
  if (!intake) return new Response("Relato não encontrado.", { status: 404 });

  const triage = TriageSchema.safeParse(intake.triage);
  if (!triage.success) return new Response("Triagem inválida.", { status: 422 });

  const client = await getClient(draft.client_id);

  const style = {
    authors: draft.style_authors ?? [],
    instruction: draft.style_instruction,
  };

  let messageStream;
  try {
    messageStream = await streamDraft(
      triage.data,
      client?.name ?? "o cliente",
      intake.raw_text ?? "",
      style,
    );
  } catch (e) {
    if (e instanceof AnthropicNotConfiguredError) {
      return new Response(e.message, { status: 503 });
    }
    return new Response("Falha ao iniciar a geração.", { status: 502 });
  }

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      // TEXTO apenas — nunca registramos on("thinking"), então o raciocínio
      // do modelo jamais chega ao cliente.
      messageStream.on("text", (delta: string) => {
        try {
          controller.enqueue(encoder.encode(delta));
        } catch {}
      });
      messageStream.on("error", (err: Error) => {
        try {
          controller.enqueue(encoder.encode(`\n\n[ERRO_GERACAO] ${err.message}`));
        } catch {}
      });
      messageStream
        .finalMessage()
        .then((m) => {
          if (m.stop_reason === "refusal") {
            try {
              controller.enqueue(
                encoder.encode("\n\n[RECUSA] O modelo recusou gerar esta peça."),
              );
            } catch {}
          }
        })
        .catch(() => {
          /* erro já sinalizado em on("error") */
        })
        .finally(() => {
          try {
            controller.close();
          } catch {}
        });
    },
    cancel() {
      messageStream.abort();
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

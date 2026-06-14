"use client";

import { useRef, useState } from "react";
import { ChevronDown, X, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { areasComAutores } from "@/lib/pecas/autores";
import type { TriageArea } from "@/lib/ai/triage";

const groups = areasComAutores();

/**
 * Escolha de estilo da peça (opcional), com EXCLUSÃO MÚTUA:
 * — OU um único autor de referência (voz + doutrina), escolhido num modal
 *   com accordion por área;
 * — OU instruções livres no campo de texto.
 * Nunca os dois ao mesmo tempo. Emite inputs ocultos lidos por createDraftFromIntake.
 */
export function EstiloPeca({ area }: { area?: TriageArea }) {
  const [author, setAuthor] = useState<string | null>(null);
  const [instruction, setInstruction] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [openArea, setOpenArea] = useState<TriageArea | null>(
    area && groups.some((g) => g.area === area) ? area : groups[0]?.area ?? null,
  );

  const hasText = instruction.trim().length > 0;
  const openModal = () => dialogRef.current?.showModal();
  const closeModal = () => dialogRef.current?.close();

  const pick = (nome: string) => {
    setAuthor(nome);
    setInstruction("");
    closeModal();
  };

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="font-serif text-lg font-semibold text-ink">
        Estilo da peça{" "}
        <span className="text-sm font-normal text-muted">(opcional)</span>
      </legend>
      <p className="text-sm text-muted">
        Escolha <strong>um</strong> autor de referência (a IA segue a voz e pode
        citar a doutrina dele — revise as citações) <em>ou</em> escreva instruções
        livres. Apenas uma das opções.
      </p>

      {/* O que o form envia quando há autor escolhido. */}
      {author && <input type="hidden" name="styleAuthors" value={author} />}

      {/* Opção A — autor */}
      <div>
        {author ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-green-700/40 bg-green-50/60 px-4 py-3">
            <span className="inline-flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-green-700" aria-hidden="true" />
              <span className="font-medium text-ink">{author}</span>
            </span>
            <button
              type="button"
              onClick={() => setAuthor(null)}
              className="inline-flex h-8 items-center gap-1 rounded-full px-3 text-xs font-medium text-muted transition-colors hover:bg-cloud hover:text-ink"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              Remover
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={openModal}
            disabled={hasText}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-5 text-sm font-medium text-green-700 transition-colors hover:bg-cloud disabled:cursor-not-allowed disabled:opacity-50"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            Escolher autor de referência
          </button>
        )}
        {hasText && !author && (
          <p className="mt-1.5 text-xs text-muted">
            Apague as instruções livres para escolher um autor.
          </p>
        )}
      </div>

      {/* divisor */}
      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-muted/70">
        <span className="h-px flex-1 bg-line" />
        ou
        <span className="h-px flex-1 bg-line" />
      </div>

      {/* Opção B — texto livre */}
      <div>
        <textarea
          name="styleInstruction"
          rows={3}
          maxLength={2000}
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          disabled={author !== null}
          placeholder="Ex.: tom assertivo, ênfase na dignidade da pessoa humana, explorar a tese da perda de uma chance…"
          className="w-full resize-y rounded-lg border border-line bg-paper px-4 py-3 text-sm text-ink shadow-soft transition-colors placeholder:text-muted/70 focus:border-green-700/40 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-cloud/50 disabled:opacity-60"
        />
        {author && (
          <p className="mt-1.5 text-xs text-muted">
            Remova o autor para escrever instruções livres.
          </p>
        )}
      </div>

      {/* Modal com accordion por área (single-select) */}
      <dialog
        ref={dialogRef}
        onClick={(e) => {
          if (e.target === dialogRef.current) closeModal();
        }}
        className={cn(
          "w-full max-w-none bg-paper p-0 text-ink shadow-lift backdrop:bg-green-900/40",
          "fixed inset-x-0 bottom-0 top-auto m-0 max-h-[85dvh] overflow-auto rounded-t-2xl",
          "sm:inset-0 sm:m-auto sm:h-fit sm:max-h-[85dvh] sm:w-[min(560px,92vw)] sm:rounded-2xl",
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-paper px-5 py-4">
          <p className="font-serif text-lg font-semibold text-ink">
            Autor de referência
          </p>
          <button
            type="button"
            onClick={closeModal}
            aria-label="Fechar"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-cloud hover:text-ink"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="flex flex-col gap-2 p-4">
          {groups.map((g) => {
            const isOpen = openArea === g.area;
            return (
              <div
                key={g.area}
                className="overflow-hidden rounded-xl border border-line"
              >
                <button
                  type="button"
                  onClick={() => setOpenArea(isOpen ? null : g.area)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-3 bg-cloud/40 px-4 py-3 text-left text-sm font-medium text-ink transition-colors hover:bg-cloud"
                >
                  {g.label}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted transition-transform duration-200 [transition-timing-function:var(--ease-out-expo)]",
                      isOpen && "rotate-180",
                    )}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <ul className="flex flex-col divide-y divide-line">
                    {g.autores.map((a) => (
                      <li key={a.nome}>
                        <button
                          type="button"
                          onClick={() => pick(a.nome)}
                          className="flex w-full flex-col gap-0.5 px-4 py-3 text-left transition-colors hover:bg-green-50/60"
                        >
                          <span className="text-sm font-medium text-ink">
                            {a.nome}
                          </span>
                          <span className="text-xs text-muted">{a.descricao}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </dialog>
    </fieldset>
  );
}

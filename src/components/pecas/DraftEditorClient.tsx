"use client";

import { useActionState, useState, type ReactNode } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Loader2,
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { saveDraft, type SaveDraftState } from "@/app/dashboard/pecas/actions";
import type { DraftStatus } from "@/types/db";

interface Props {
  draftId: string;
  initialHtml: string;
  initialStatus: DraftStatus;
  intakeId: string | null;
}

export function DraftEditorClient({
  draftId,
  initialHtml,
  initialStatus,
  intakeId,
}: Props) {
  const [html, setHtml] = useState(initialHtml);
  const [hasContent, setHasContent] = useState(initialHtml.trim() !== "");
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState("");
  const [genError, setGenError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saveState, saveAction, saving] = useActionState(
    saveDraft,
    {} as SaveDraftState,
  );

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialHtml,
    immediatelyRender: false,
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
    editorProps: {
      attributes: { class: "draft-content min-h-[55vh] focus:outline-none" },
    },
  });

  async function generate() {
    if (!intakeId || !editor) return;
    setGenerating(true);
    setGenError(null);
    setPreview("");
    let acc = "";
    try {
      const res = await fetch(
        `/api/drafts/${draftId}/generate?intake=${intakeId}`,
        { method: "POST" },
      );
      if (!res.ok || !res.body) {
        const msg = await res.text().catch(() => "");
        setGenError(msg || "Não foi possível gerar a peça.");
        setGenerating(false);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setPreview(acc);
      }
      acc += decoder.decode();
    } catch {
      setGenError("A geração foi interrompida.");
      setGenerating(false);
      return;
    }

    if (acc.includes("[RECUSA]") || acc.includes("[ERRO_GERACAO]")) {
      setGenError(
        acc.includes("[RECUSA]")
          ? "O modelo recusou gerar esta peça."
          : "Houve um erro durante a geração. Tente novamente.",
      );
      setGenerating(false);
      return;
    }

    editor.commands.setContent(acc);
    setHtml(acc);
    setHasContent(true);
    setGenerating(false);

    // Auto-save da versão de geração (origin: geracao).
    const fd = new FormData();
    fd.set("draftId", draftId);
    fd.set("contentHtml", acc);
    fd.set("origin", "geracao");
    try {
      await saveDraft({}, fd);
    } catch {
      /* salvar manualmente continua disponível */
    }
  }

  async function copy() {
    if (!editor) return;
    const h = editor.getHTML();
    const t = editor.getText();
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([h], { type: "text/html" }),
          "text/plain": new Blob([t], { type: "text/plain" }),
        }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      try {
        await navigator.clipboard.writeText(t);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        /* sem clipboard disponível */
      }
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-gold-200 bg-gold-100/50 px-4 py-3 text-sm text-gold-700">
        <strong className="font-semibold">Minuta gerada por IA.</strong> Pode
        conter erros — inclusive em citações legais e jurisprudenciais. Revise
        antes de protocolar ou enviar.
      </div>

      {!hasContent && !generating && (
        <div className="rounded-xl border border-line bg-paper p-6 shadow-soft">
          {genError && (
            <p
              role="alert"
              className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
            >
              {genError}
            </p>
          )}
          {intakeId ? (
            <>
              <p className="text-sm text-muted">
                Pronto para gerar a peça a partir da triagem deste relato.
              </p>
              <button
                type="button"
                onClick={generate}
                className="mt-4 inline-flex h-12 items-center gap-2 rounded-full bg-green-700 px-7 text-sm font-medium text-white transition-colors hover:bg-green-800"
              >
                Gerar peça
              </button>
            </>
          ) : (
            <p className="text-sm text-muted">
              Esta peça ainda não tem conteúdo e não está vinculada a um relato
              para gerar.
            </p>
          )}
        </div>
      )}

      {generating && (
        <div className="rounded-xl border border-line bg-paper p-5 shadow-soft">
          <p className="flex items-center gap-2 text-sm font-medium text-ink">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Gerando a peça…
          </p>
          <pre className="mt-3 max-h-[55vh] overflow-auto whitespace-pre-wrap text-xs leading-5 text-muted">
            {preview}
          </pre>
        </div>
      )}

      {hasContent && !generating && (
        <>
          <div className="overflow-hidden rounded-xl border border-line bg-paper shadow-soft">
            <div className="flex flex-wrap items-center gap-1 border-b border-line p-2">
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleBold().run()}
                active={editor?.isActive("bold")}
                label="Negrito"
              >
                <Bold className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                active={editor?.isActive("italic")}
                label="Itálico"
              >
                <Italic className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() =>
                  editor?.chain().focus().toggleHeading({ level: 2 }).run()
                }
                active={editor?.isActive("heading", { level: 2 })}
                label="Título de seção"
              >
                <Heading2 className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() =>
                  editor?.chain().focus().toggleHeading({ level: 3 }).run()
                }
                active={editor?.isActive("heading", { level: 3 })}
                label="Subtítulo"
              >
                <Heading3 className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                active={editor?.isActive("bulletList")}
                label="Lista"
              >
                <List className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                active={editor?.isActive("orderedList")}
                label="Lista numerada"
              >
                <ListOrdered className="h-4 w-4" />
              </ToolbarButton>
              <button
                type="button"
                onClick={copy}
                className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-green-700 transition-colors hover:bg-green-50"
              >
                {copied ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
            <EditorContent editor={editor} className="px-5 py-4" />
          </div>

          <form action={saveAction} className="flex flex-wrap items-center gap-3">
            <input type="hidden" name="draftId" value={draftId} />
            <input type="hidden" name="contentHtml" value={html} />
            <input type="hidden" name="origin" value="edicao" />
            <label className="text-sm text-muted">
              Status
              <select
                name="status"
                defaultValue={initialStatus}
                className="ml-2 rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-green-700/40 focus:outline-none focus:ring-2 focus:ring-gold-500"
              >
                <option value="rascunho">Rascunho</option>
                <option value="em_revisao">Em revisão</option>
                <option value="finalizada">Finalizada</option>
              </select>
            </label>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-green-700 px-6 text-sm font-medium text-white transition-colors hover:bg-green-800 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Salvar
            </button>
            {saveState.message && (
              <span
                className={cn(
                  "text-sm font-medium",
                  saveState.ok ? "text-green-800" : "text-red-700",
                )}
              >
                {saveState.message}
              </span>
            )}
          </form>
        </>
      )}
    </div>
  );
}

function ToolbarButton({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md text-ink transition-colors hover:bg-green-50",
        active && "bg-green-100 text-green-800",
      )}
    >
      {children}
    </button>
  );
}

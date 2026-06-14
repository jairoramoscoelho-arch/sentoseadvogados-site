"use client";

import { useRef } from "react";
import { Plus, X } from "lucide-react";
import { ClientForm } from "./ClientForm";

/** Cadastro de cliente em modal nativo (discreto), fora da lista. */
export function NewClientModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-green-700 px-5 text-sm font-medium text-white transition-colors hover:bg-green-800"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Novo cliente
      </button>

      <dialog
        ref={dialogRef}
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
        className="w-[min(480px,92vw)] rounded-2xl bg-paper p-0 text-ink shadow-lift backdrop:bg-green-900/40"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <p className="font-serif text-lg font-semibold text-ink">Novo cliente</p>
          <button
            type="button"
            onClick={close}
            aria-label="Fechar"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-cloud hover:text-ink"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="p-5">
          <ClientForm embedded onSuccess={close} />
        </div>
      </dialog>
    </>
  );
}

"use client";

import dynamic from "next/dynamic";
import type { DraftStatus } from "@/types/db";

// ProseMirror/Tiptap fora do bundle do servidor (ssr:false). O editor só
// renderiza no cliente — combinado com immediatelyRender:false no useEditor.
const DraftEditorClient = dynamic(
  () => import("./DraftEditorClient").then((m) => m.DraftEditorClient),
  {
    ssr: false,
    loading: () => (
      <p className="text-sm text-muted">Carregando editor…</p>
    ),
  },
);

export function DraftEditor(props: {
  draftId: string;
  initialHtml: string;
  initialStatus: DraftStatus;
  intakeId: string | null;
}) {
  return <DraftEditorClient {...props} />;
}

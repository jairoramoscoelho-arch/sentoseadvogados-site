// Tipos das tabelas do painel (espelham supabase/migrations). Mantidos à mão
// (sem geração automática) por simplicidade.

export type ClientType = "pf" | "pj";
export type CaseStatus = "ativo" | "suspenso" | "arquivado" | "encerrado";

export interface Client {
  id: string;
  name: string;
  type: ClientType;
  document: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CaseRow {
  id: string;
  client_id: string;
  title: string;
  area: string | null;
  process_number: string | null;
  court: string | null;
  status: CaseStatus;
  responsible_id: string | null;
  description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Intake {
  id: string;
  client_id: string;
  case_id: string | null;
  raw_text: string | null;
  audio_path: string | null;
  transcript: string | null;
  triage: unknown; // validado por TriageSchema (src/lib/ai/triage.ts)
  created_by: string | null;
  created_at: string;
}

export type DraftStatus = "rascunho" | "em_revisao" | "finalizada";
export type DraftVersionOrigin = "geracao" | "edicao" | "regeneracao";

export interface LegalDraft {
  id: string;
  client_id: string;
  case_id: string | null;
  intake_id: string | null;
  template_id: string | null;
  title: string;
  status: DraftStatus;
  content_html: string | null;
  model_used: string | null;
  style_id: string | null;
  style_authors: string[];
  style_instruction: string | null;
  created_by: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface LegalDraftVersion {
  id: string;
  draft_id: string;
  version_no: number;
  content_html: string | null;
  origin: DraftVersionOrigin;
  created_by: string | null;
  created_at: string;
  note: string | null;
}

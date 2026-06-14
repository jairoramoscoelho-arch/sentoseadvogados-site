-- =====================================================================
-- Sprint 1D — estilo da peça: UM autor renomado (voz + doutrina) OU
-- instruções livres do advogado, capturados antes da geração.
-- =====================================================================
alter table public.legal_drafts
  add column if not exists style_authors     text[] not null default '{}',
  add column if not exists style_instruction text;

-- =====================================================================
-- Sprint 1D — tipo de peça escolhido na galeria (prevalece sobre o tipo
-- sugerido pela triagem na geração e no título). Nulo = usa o da triagem.
-- =====================================================================
alter table public.legal_drafts
  add column if not exists tipo text;

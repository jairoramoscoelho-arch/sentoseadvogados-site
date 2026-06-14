-- =====================================================================
-- Sprint 1D — vincula a peça à triagem que a originou.
-- Permite (a) sumir a triagem da aba Triagens quando vira peça e
-- (b) listar as peças na ficha do cliente, separadas das triagens.
-- =====================================================================
alter table public.legal_drafts
  add column if not exists intake_id uuid references public.intakes(id) on delete set null;

create index if not exists legal_drafts_intake_idx on public.legal_drafts (intake_id);

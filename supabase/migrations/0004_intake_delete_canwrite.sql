-- =====================================================================
-- Sprint 1A.1 — permite que advogados (can_write), não só sócios, excluam
-- relatos/triagens (intakes). Mantém select/insert/update como estavam.
-- =====================================================================
drop policy if exists "intakes_delete" on public.intakes;
create policy "intakes_delete" on public.intakes
  for delete to authenticated using (public.can_write());

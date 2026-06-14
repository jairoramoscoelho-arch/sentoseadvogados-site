-- =====================================================================
-- Sprint 1A — intakes (relato do cliente + resultado da triagem por IA)
-- =====================================================================
create table public.intakes (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.clients(id) on delete cascade,
  case_id     uuid references public.cases(id) on delete set null,
  raw_text    text,
  audio_path  text,
  transcript  text,
  triage      jsonb,
  created_by  uuid references public.profiles(id),
  created_at  timestamptz not null default now()
);
create index intakes_client_idx on public.intakes (client_id);

alter table public.intakes enable row level security;
create policy "intakes_select" on public.intakes for select to authenticated using (public.is_member());
create policy "intakes_insert" on public.intakes for insert to authenticated with check (public.can_write());
create policy "intakes_update" on public.intakes for update to authenticated using (public.can_write()) with check (public.can_write());
create policy "intakes_delete" on public.intakes for delete to authenticated using (public.is_socio());

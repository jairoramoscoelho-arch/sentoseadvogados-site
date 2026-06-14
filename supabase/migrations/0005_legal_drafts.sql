-- =====================================================================
-- Sprint 1B — legal_drafts (peça gerada) + legal_draft_versions (histórico)
-- =====================================================================
create type public.draft_status as enum ('rascunho', 'em_revisao', 'finalizada');
create type public.draft_version_origin as enum ('geracao', 'edicao', 'regeneracao');

create table public.legal_drafts (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references public.clients(id) on delete cascade,
  case_id      uuid references public.cases(id) on delete set null,
  template_id  uuid,
  title        text not null,
  status       public.draft_status not null default 'rascunho',
  content_html text,
  model_used   text,
  style_id     uuid,
  created_by   uuid references public.profiles(id),
  assigned_to  uuid references public.profiles(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);
create index legal_drafts_client_idx on public.legal_drafts (client_id);
create index legal_drafts_case_idx   on public.legal_drafts (case_id);
create index legal_drafts_status_idx on public.legal_drafts (status) where deleted_at is null;
create trigger legal_drafts_updated_at before update on public.legal_drafts
  for each row execute function public.set_updated_at();

create table public.legal_draft_versions (
  id           uuid primary key default gen_random_uuid(),
  draft_id     uuid not null references public.legal_drafts(id) on delete cascade,
  version_no   integer not null,
  content_html text,
  origin       public.draft_version_origin not null,
  created_by   uuid references public.profiles(id),
  created_at   timestamptz not null default now(),
  note         text,
  unique (draft_id, version_no)
);
create index legal_draft_versions_draft_idx on public.legal_draft_versions (draft_id, version_no);

alter table public.legal_drafts         enable row level security;
alter table public.legal_draft_versions enable row level security;

create policy "legal_drafts_select" on public.legal_drafts
  for select to authenticated using (public.is_member());
create policy "legal_drafts_insert" on public.legal_drafts
  for insert to authenticated with check (public.can_write());
create policy "legal_drafts_update" on public.legal_drafts
  for update to authenticated using (public.can_write()) with check (public.can_write());
create policy "legal_drafts_delete" on public.legal_drafts
  for delete to authenticated using (public.can_write());

create policy "legal_draft_versions_select" on public.legal_draft_versions
  for select to authenticated using (public.is_member());
create policy "legal_draft_versions_insert" on public.legal_draft_versions
  for insert to authenticated with check (public.can_write());

-- =====================================================================
-- Painel dos advogados — Sento-Sé (schema + RLS + Storage)
-- Aplicar no Supabase (SQL Editor) ou via `supabase db push`.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ----------------------------- Enums ---------------------------------
create type public.user_role  as enum ('socio', 'advogado', 'estagiario');
create type public.client_type as enum ('pf', 'pj');
create type public.case_status as enum ('ativo', 'suspenso', 'arquivado', 'encerrado');
create type public.task_type   as enum ('prazo', 'audiencia', 'tarefa', 'reuniao');
create type public.task_status as enum ('pendente', 'concluida');

-- updated_at automático
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- ----------------------------- Profiles ------------------------------
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text not null default '',
  role       public.user_role not null default 'advogado',
  oab        text,
  email      text,
  avatar_url text,
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Cria o profile automaticamente quando um usuário é criado no Auth.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'advogado')
  );
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------- Helpers de permissão ------------------------
-- SECURITY DEFINER: ignoram RLS (evita recursão ao checar papel).
create or replace function public.app_role()
returns public.user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid() and active = true;
$$;

create or replace function public.is_member()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and active = true);
$$;

create or replace function public.is_socio()
returns boolean language sql stable security definer set search_path = public as $$
  select public.app_role() = 'socio';
$$;

create or replace function public.can_write()
returns boolean language sql stable security definer set search_path = public as $$
  select public.app_role() in ('socio', 'advogado');
$$;

-- ----------------------------- Clients -------------------------------
create table public.clients (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  type       public.client_type not null default 'pf',
  document   text,
  email      text,
  phone      text,
  notes      text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create trigger clients_updated_at before update on public.clients
  for each row execute function public.set_updated_at();

-- ------------------------------ Cases --------------------------------
create table public.cases (
  id             uuid primary key default gen_random_uuid(),
  client_id      uuid not null references public.clients(id) on delete restrict,
  title          text not null,
  area           text,
  process_number text,
  court          text,
  status         public.case_status not null default 'ativo',
  responsible_id uuid references public.profiles(id),
  description    text,
  last_synced_at timestamptz,
  created_by     uuid references public.profiles(id),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz
);
create index cases_client_idx  on public.cases (client_id);
create index cases_number_idx  on public.cases (process_number);
create trigger cases_updated_at before update on public.cases
  for each row execute function public.set_updated_at();

create table public.case_members (
  case_id    uuid not null references public.cases(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  primary key (case_id, profile_id)
);

-- ---------------------------- Documents ------------------------------
create table public.documents (
  id          uuid primary key default gen_random_uuid(),
  case_id     uuid not null references public.cases(id) on delete cascade,
  name        text not null,
  storage_path text not null,
  mime_type   text,
  size        bigint,
  uploaded_by uuid references public.profiles(id),
  created_at  timestamptz not null default now()
);
create index documents_case_idx on public.documents (case_id);

-- ------------------------------ Tasks --------------------------------
create table public.tasks (
  id           uuid primary key default gen_random_uuid(),
  case_id      uuid references public.cases(id) on delete cascade,
  title        text not null,
  description  text,
  type         public.task_type not null default 'tarefa',
  due_date     timestamptz,
  status       public.task_status not null default 'pendente',
  assigned_to  uuid references public.profiles(id),
  created_by   uuid references public.profiles(id),
  completed_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index tasks_due_idx on public.tasks (due_date);
create trigger tasks_updated_at before update on public.tasks
  for each row execute function public.set_updated_at();

-- ----------------- Andamentos (cache DataJud/CNJ) --------------------
create table public.process_movements (
  id            uuid primary key default gen_random_uuid(),
  case_id       uuid not null references public.cases(id) on delete cascade,
  movement_date timestamptz,
  description   text,
  raw           jsonb,
  fetched_at    timestamptz not null default now()
);
create index movements_case_idx on public.process_movements (case_id);

-- -------------------------- Notifications ----------------------------
create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type       text,
  title      text not null,
  body       text,
  link       text,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_profile_idx on public.notifications (profile_id, read_at);

-- ---------------------------- Audit logs -----------------------------
create table public.audit_logs (
  id         uuid primary key default gen_random_uuid(),
  actor_id   uuid references public.profiles(id),
  action     text not null,
  entity     text,
  entity_id  uuid,
  meta       jsonb,
  created_at timestamptz not null default now()
);

-- =============================== RLS =================================
alter table public.profiles          enable row level security;
alter table public.clients           enable row level security;
alter table public.cases             enable row level security;
alter table public.case_members      enable row level security;
alter table public.documents         enable row level security;
alter table public.tasks             enable row level security;
alter table public.process_movements enable row level security;
alter table public.notifications     enable row level security;
alter table public.audit_logs        enable row level security;

-- profiles
create policy "profiles_select" on public.profiles
  for select to authenticated using (public.is_member());
create policy "profiles_update" on public.profiles
  for update to authenticated using (id = auth.uid() or public.is_socio())
  with check (id = auth.uid() or public.is_socio());

-- clients
create policy "clients_select" on public.clients for select to authenticated using (public.is_member());
create policy "clients_insert" on public.clients for insert to authenticated with check (public.can_write());
create policy "clients_update" on public.clients for update to authenticated using (public.can_write()) with check (public.can_write());
create policy "clients_delete" on public.clients for delete to authenticated using (public.is_socio());

-- cases
create policy "cases_select" on public.cases for select to authenticated using (public.is_member());
create policy "cases_insert" on public.cases for insert to authenticated with check (public.can_write());
create policy "cases_update" on public.cases for update to authenticated using (public.can_write()) with check (public.can_write());
create policy "cases_delete" on public.cases for delete to authenticated using (public.is_socio());

-- case_members
create policy "case_members_select" on public.case_members for select to authenticated using (public.is_member());
create policy "case_members_write"  on public.case_members for all to authenticated using (public.can_write()) with check (public.can_write());

-- documents (membros leem e inserem; só advogado/sócio excluem)
create policy "documents_select" on public.documents for select to authenticated using (public.is_member());
create policy "documents_insert" on public.documents for insert to authenticated with check (public.is_member());
create policy "documents_delete" on public.documents for delete to authenticated using (public.can_write());

-- tasks (membros leem/inserem/atualizam; só advogado/sócio excluem)
create policy "tasks_select" on public.tasks for select to authenticated using (public.is_member());
create policy "tasks_insert" on public.tasks for insert to authenticated with check (public.is_member());
create policy "tasks_update" on public.tasks for update to authenticated using (public.is_member()) with check (public.is_member());
create policy "tasks_delete" on public.tasks for delete to authenticated using (public.can_write());

-- process_movements
create policy "movements_select" on public.process_movements for select to authenticated using (public.is_member());
create policy "movements_write"  on public.process_movements for all to authenticated using (public.can_write()) with check (public.can_write());

-- notifications (cada um vê/edita as suas)
create policy "notifications_select" on public.notifications for select to authenticated using (profile_id = auth.uid());
create policy "notifications_update" on public.notifications for update to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- audit_logs (sócio lê)
create policy "audit_select" on public.audit_logs for select to authenticated using (public.is_socio());

-- ============================ Storage ================================
insert into storage.buckets (id, name, public)
values ('case-documents', 'case-documents', false)
on conflict (id) do nothing;

create policy "case_docs_select" on storage.objects
  for select to authenticated using (bucket_id = 'case-documents' and public.is_member());
create policy "case_docs_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'case-documents' and public.is_member());
create policy "case_docs_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'case-documents' and public.can_write());

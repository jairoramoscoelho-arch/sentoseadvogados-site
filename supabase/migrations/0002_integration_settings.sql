-- =====================================================================
-- Sprint 0 — integration_settings
-- Credenciais de API geridas pelo sócio no painel, cifradas em repouso
-- (AES-256-GCM no app; chave-mestra em SETTINGS_ENCRYPTION_KEY).
-- =====================================================================

create table public.integration_settings (
  key             text primary key,
  value_encrypted text not null,
  updated_by      uuid references public.profiles(id),
  updated_at      timestamptz not null default now()
);

create trigger integration_settings_updated_at
  before update on public.integration_settings
  for each row execute function public.set_updated_at();

-- RLS habilitada SEM policies para authenticated/anon = nega tudo a clientes.
-- Todo acesso é server-side via service_role (BYPASSRLS); o navegador nunca lê.
alter table public.integration_settings enable row level security;

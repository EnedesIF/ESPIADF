-- =====================================================================
-- MISSÃO DF — esquema Supabase (PostgreSQL)
-- Executar no SQL Editor do projeto Supabase.
-- ATENÇÃO: revisar políticas RLS com a equipe de TI/DPO antes da produção.
-- Os dados envolvem estudantes menores de idade (LGPD): coletar apenas o
-- necessário, com consentimento/assentimento adequados e aprovação ética
-- quando houver uso em pesquisa.
-- =====================================================================

create extension if not exists pgcrypto;

-- Perfis com papel (mentor | admin). Vinculado ao Supabase Auth.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'mentor' check (role in ('mentor','admin')),
  created_at timestamptz default now()
);

create table if not exists teams (
  id text primary key,
  name text not null,
  school text not null,
  ra text,
  turma text,
  mentor jsonb not null,              -- {name,email,phone,school,area}
  members jsonb not null default '[]',-- [{id,name,email,phone,turma,role,avatar}]
  login text unique not null,
  password_hash text not null,
  owner uuid references auth.users(id) default auth.uid(),
  created_at timestamptz default now()
);

create table if not exists game_sessions (
  id text primary key,
  team_id text references teams(id) on delete cascade,
  campaign_id text not null,
  phase text,
  status text,
  reputation int default 0,
  state jsonb not null,               -- GameSession completo (src/types)
  updated_at timestamptz default now(),
  unique (team_id, campaign_id)
);

create table if not exists mentor_actions (
  id text primary key,
  session_id text references game_sessions(id) on delete cascade,
  team_id text references teams(id) on delete cascade,
  kind text check (kind in ('pista','comentario','devolucao','liberacao','validacao')),
  text text,
  stage text,
  score int,
  created_at timestamptz default now()
);

-- Telemetria para pesquisa: escolhas, trajetos, fontes, tempos, hipóteses...
create table if not exists telemetry_events (
  id bigint generated always as identity primary key,
  session_id text,
  team_id text,
  member_id text,                     -- id pseudônimo do integrante
  type text not null,
  phase text,
  game_time text,
  payload jsonb default '{}',
  created_at timestamptz default now()
);
create index if not exists telemetry_session_idx on telemetry_events(session_id);
create index if not exists telemetry_type_idx on telemetry_events(type);

-- Conteúdo editável pela área ADMIN
create table if not exists campaign_overrides (
  campaign_id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- Storage: bucket para fotos/arquivos de pitch (criar pelo painel: "missao-df-media", privado)

-- ---------- Login de equipe (sem expor hash) ----------
create or replace function team_login(p_login text, p_hash text)
returns setof teams
language sql security definer set search_path = public as $$
  select id, name, school, ra, turma, mentor, members, login, '' as password_hash, owner, created_at
  from teams where upper(login) = upper(p_login) and password_hash = p_hash limit 1;
$$;

-- ---------- RLS ----------
alter table profiles enable row level security;
alter table teams enable row level security;
alter table game_sessions enable row level security;
alter table mentor_actions enable row level security;
alter table telemetry_events enable row level security;
alter table campaign_overrides enable row level security;

create or replace function is_admin() returns boolean language sql stable as $$
  select exists(select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create policy "perfil próprio" on profiles for select using (id = auth.uid() or is_admin());

create policy "mentor gerencia suas equipes" on teams
  for all using (owner = auth.uid() or is_admin()) with check (owner = auth.uid() or is_admin());

-- Sessões: mentor dono e admin têm acesso total. O cliente da equipe (anon)
-- grava a própria sessão — em produção, trocar por Edge Function com token da equipe.
create policy "sessões — mentor/admin" on game_sessions
  for all using (exists(select 1 from teams t where t.id = team_id and (t.owner = auth.uid() or is_admin())));
create policy "sessões — gravação do jogo (anon)" on game_sessions
  for all to anon using (true) with check (true);

create policy "ações do mentor — mentor/admin" on mentor_actions
  for all using (exists(select 1 from teams t where t.id = team_id and (t.owner = auth.uid() or is_admin())));
create policy "ações do mentor — leitura do jogo" on mentor_actions for select to anon using (true);

create policy "telemetria — inserção" on telemetry_events for insert with check (true);
create policy "telemetria — leitura mentor/admin" on telemetry_events for select
  using (is_admin() or exists(select 1 from teams t where t.id = team_id and t.owner = auth.uid()));

create policy "overrides — leitura" on campaign_overrides for select using (true);
create policy "overrides — admin" on campaign_overrides for all using (is_admin()) with check (is_admin());

-- ---------- Visões para dashboard analítico ----------
create or replace view v_tool_usage as
  select payload->>'tool' as tool, count(*) as consultas, count(distinct session_id) as sessoes
  from telemetry_events where type = 'tool_query' group by 1;

create or replace view v_hypothesis_revisions as
  select session_id, count(*) as revisoes from telemetry_events where type = 'hypothesis_revised' group by 1;

create or replace view v_phase_time as
  select session_id, payload->>'phase' as fase, max((payload->>'ms')::bigint) as ms
  from telemetry_events where type = 'phase_time' group by 1, 2;

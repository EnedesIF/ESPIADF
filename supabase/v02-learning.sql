-- MISSÃO DF 0.2 • apply after schema.sql in a staging project first.
-- Requires authenticated student/mentor accounts. team_login (legacy RPC) alone
-- does NOT issue an Auth session and is deliberately not accepted by these policies.
begin;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.profiles where id=auth.uid() and role='admin');
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
-- Remove the permissive legacy demo policies before using real student data.
drop policy if exists "sessões — gravação do jogo (anon)" on public.game_sessions;
drop policy if exists "ações do mentor — leitura do jogo" on public.mentor_actions;
drop policy if exists "telemetria — inserção" on public.telemetry_events;
create table public.team_memberships(team_id text references public.teams(id) on delete cascade,user_id uuid references auth.users(id) on delete cascade,primary key(team_id,user_id));
alter table public.team_memberships enable row level security;
create or replace function public.can_mentor(tid text) returns boolean language sql stable security definer set search_path=public as $$
 select public.is_admin() or exists(select 1 from public.teams where id=tid and owner=auth.uid());
$$;
create or replace function public.in_team(tid text) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.team_memberships where team_id=tid and user_id=auth.uid());
$$;
revoke all on function public.can_mentor(text),public.in_team(text) from public;
grant execute on function public.can_mentor(text),public.in_team(text) to authenticated;
create policy membership_read on public.team_memberships for select to authenticated using(user_id=auth.uid() or public.can_mentor(team_id));
create policy membership_manage on public.team_memberships for all to authenticated using(public.can_mentor(team_id)) with check(public.can_mentor(team_id));
create table public.real_mission_submissions(
 id uuid primary key default gen_random_uuid(),team_id text not null references public.teams(id) on delete cascade,
 campaign text not null check(campaign in ('mobility','work','territory','health')),mission_id text not null,
 texts jsonb not null,image_path text not null,url text,activity_date date not null,people int not null default 0 check(people between 0 and 10000),
 privacy_confirmed boolean not null check(privacy_confirmed),status text not null default 'pending' check(status in ('pending','adjust','approved')),
 comment text not null default '',revision int not null default 1,updated_at timestamptz not null default now(),unique(team_id,campaign,mission_id)
);
alter table public.real_mission_submissions enable row level security;
create policy submission_read on public.real_mission_submissions for select to authenticated using(public.in_team(team_id) or public.can_mentor(team_id));
create policy submission_insert on public.real_mission_submissions for insert to authenticated with check(public.in_team(team_id) and status='pending' and comment='' and revision=1 and image_path=team_id||'/'||id::text||'.jpg');
create policy submission_update on public.real_mission_submissions for update to authenticated using(public.can_mentor(team_id) or public.in_team(team_id) and status='adjust') with check(public.can_mentor(team_id) or public.in_team(team_id) and status='pending');
create function public.guard_submission() returns trigger language plpgsql set search_path=public as $$
begin
 if new.team_id<>old.team_id or new.id<>old.id or new.campaign<>old.campaign or new.mission_id<>old.mission_id then raise exception 'immutable identity'; end if;
 if not public.can_mentor(old.team_id) then
  if old.status<>'adjust' or new.status<>'pending' or new.comment<>'' then raise exception 'only resubmission allowed'; end if;
  new.revision:=old.revision+1;
 else
  if new.texts<>old.texts or new.image_path<>old.image_path or new.url is distinct from old.url or new.people<>old.people or new.activity_date<>old.activity_date then raise exception 'mentor cannot alter evidence'; end if;
  if old.status<>'pending' or new.status not in ('adjust','approved') or length(trim(new.comment))<8 then raise exception 'invalid review'; end if;
  new.revision:=old.revision;
 end if;
 new.updated_at:=now();return new;
end;$$;
create trigger submission_guard before update on public.real_mission_submissions for each row execute function public.guard_submission();
create table public.city_suggestions(id uuid primary key default gen_random_uuid(),team_id text not null references public.teams(id) on delete cascade,campaign text not null,title text not null check(length(title) between 5 and 120),kind text not null check(kind in ('service','game')),agency text,text text not null check(length(text) between 30 and 6000),status text not null default 'pending' check(status in ('pending','published','hidden','forwarded')),note text not null default '',created_at timestamptz default now());
alter table public.city_suggestions enable row level security;
create policy suggestion_read on public.city_suggestions for select to authenticated using(status in ('published','forwarded') or public.in_team(team_id) or public.can_mentor(team_id));
create policy suggestion_insert on public.city_suggestions for insert to authenticated with check(public.in_team(team_id) and status='pending' and note='');
create policy suggestion_moderate on public.city_suggestions for update to authenticated using(public.can_mentor(team_id)) with check(public.can_mentor(team_id));
create table public.suggestion_supports(suggestion_id uuid references public.city_suggestions(id) on delete cascade,team_id text references public.teams(id) on delete cascade,created_at timestamptz default now(),primary key(suggestion_id,team_id));
alter table public.suggestion_supports enable row level security;
create policy support_read on public.suggestion_supports for select to authenticated using(exists(select 1 from public.city_suggestions s where s.id=suggestion_id and s.status in ('published','forwarded')));
create policy support_insert on public.suggestion_supports for insert to authenticated with check(public.in_team(team_id) and exists(select 1 from public.city_suggestions s where s.id=suggestion_id and s.team_id<>suggestion_supports.team_id and s.status in ('published','forwarded')));
create table public.city_comments(id uuid primary key default gen_random_uuid(),suggestion_id uuid not null references public.city_suggestions(id) on delete cascade,team_id text not null references public.teams(id) on delete cascade,text text not null check(length(text) between 5 and 3000),status text not null default 'pending' check(status in ('pending','published','hidden')),created_at timestamptz default now());
alter table public.city_comments enable row level security;
create policy comment_read on public.city_comments for select to authenticated using(public.in_team(team_id) or public.can_mentor(team_id) or status='published' and exists(select 1 from public.city_suggestions s where s.id=suggestion_id and s.status in ('published','forwarded')));
create policy comment_insert on public.city_comments for insert to authenticated with check(public.in_team(team_id) and status='pending' and exists(select 1 from public.city_suggestions s where s.id=suggestion_id and s.status in ('published','forwarded')));
create policy comment_moderate on public.city_comments for update to authenticated using(public.can_mentor(team_id)) with check(public.can_mentor(team_id));
create table public.help_requests(id uuid primary key default gen_random_uuid(),team_id text not null references public.teams(id) on delete cascade,campaign text not null,phase text not null,objective text not null,text text not null check(length(text) between 10 and 3000),reply text not null default '',hint boolean not null default false,created_at timestamptz default now(),answered_at timestamptz);
alter table public.help_requests enable row level security;
create policy help_read on public.help_requests for select to authenticated using(public.in_team(team_id) or public.can_mentor(team_id));
create policy help_insert on public.help_requests for insert to authenticated with check(public.in_team(team_id) and reply='' and answered_at is null);
create policy help_answer on public.help_requests for update to authenticated using(public.can_mentor(team_id)) with check(public.can_mentor(team_id));
-- Private media: never use getPublicUrl. 650 KB compressed JPEG, team folder.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('missao-df-evidence','missao-df-evidence',false,650000,array['image/jpeg']) on conflict(id) do update set public=false,file_size_limit=650000,allowed_mime_types=array['image/jpeg'];
create policy evidence_upload on storage.objects for insert to authenticated with check(bucket_id='missao-df-evidence' and public.in_team((storage.foldername(name))[1]));
create policy evidence_read on storage.objects for select to authenticated using(bucket_id='missao-df-evidence' and (public.in_team((storage.foldername(name))[1]) or public.can_mentor((storage.foldername(name))[1])));
create policy evidence_replace on storage.objects for update to authenticated using(bucket_id='missao-df-evidence' and public.in_team((storage.foldername(name))[1]) and exists(select 1 from public.real_mission_submissions s where s.image_path=name and s.status='adjust')) with check(bucket_id='missao-df-evidence' and public.in_team((storage.foldername(name))[1]));
create policy sessions_authenticated on public.game_sessions for all to authenticated using(public.in_team(team_id) or public.can_mentor(team_id)) with check(public.in_team(team_id) or public.can_mentor(team_id));
create policy actions_authenticated on public.mentor_actions for select to authenticated using(public.in_team(team_id) or public.can_mentor(team_id));
create policy telemetry_authenticated on public.telemetry_events for insert to authenticated with check(public.in_team(team_id) or public.can_mentor(team_id));
-- Views must respect underlying RLS, never expose all rows through their owner.
alter view public.v_tool_usage set(security_invoker=true);
alter view public.v_hypothesis_revisions set(security_invoker=true);
alter view public.v_phase_time set(security_invoker=true);
commit;

begin;
-- Mentor association is pending until the actual mentor authenticates.
alter table public.espia_teams alter column teacher_id drop not null;
alter table public.espia_teams add column if not exists registration_data jsonb not null default '{}'::jsonb;
alter table public.espia_teams add column if not exists role_assignments jsonb not null default '{}'::jsonb;
create or replace function public.espia_register_team_internal(p_team jsonb,p_user uuid) returns void
language plpgsql security invoker set search_path='' as $$
declare m jsonb;r text;seen text[]:='{}';assignments jsonb:='{}';roles text[]:=array['escuta','campo','verificacao','dados','articulacao','participacao'];first_member text;n integer;
begin
 if p_user is null then raise exception 'Conta da equipe não confirmada'; end if;
 if jsonb_typeof(p_team->'members') is distinct from 'array' then raise exception 'Integrantes inválidos'; end if;
 n:=jsonb_array_length(p_team->'members');
 if n not between 5 and 10 then raise exception 'Cadastre de 5 a 10 integrantes'; end if;
 if coalesce(p_team->>'id','') !~ '^[a-zA-Z0-9_-]{3,120}$' or coalesce(p_team->>'login','') !~ '^[A-Z0-9-]{3,80}$' then raise exception 'Identificador ou login inválido'; end if;
 if length(trim(coalesce(p_team->>'name','')))<2 or length(trim(coalesce(p_team->>'school','')))<2 then raise exception 'Informe equipe e escola'; end if;
 if coalesce(p_team#>>'{mentor,email}','') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'Informe e-mail do professor'; end if;
 if exists(select 1 from public.espia_profiles where user_id=p_user and role<>'team') then raise exception 'Conta incompatível'; end if;
 if exists(select 1 from public.espia_teams where id=p_team->>'id') then
  if not exists(select 1 from public.espia_teams where id=p_team->>'id' and team_user_id=p_user and login=p_team->>'login') then raise exception 'Cadastro já utilizado'; end if;return;
 end if;
 for m in select value from jsonb_array_elements(p_team->'members') loop
  if coalesce(m->>'id','')='' or length(trim(coalesce(m->>'name','')))<1 or length(m->>'name')>120 then raise exception 'Confira os integrantes'; end if;
  r:=m->>'missionRole';if r=any(roles) and not(r=any(seen)) then seen:=array_append(seen,r);assignments:=jsonb_set(assignments,array[r],to_jsonb(m->>'id')); end if;
 end loop;
 if cardinality(seen)<least(n,6) then raise exception 'Distribua cinco papéis diferentes, ou todos os seis para equipes maiores'; end if;
 if (select count(distinct value->>'id') from jsonb_array_elements(p_team->'members'))<>n then raise exception 'Identificadores de integrantes repetidos'; end if;
 first_member:=p_team#>>'{members,0,id}';foreach r in array roles loop if not(assignments ? r) then assignments:=jsonb_set(assignments,array[r],to_jsonb(first_member)); end if;end loop;
 insert into public.espia_profiles(user_id,display_name,role) values(p_user,p_team->>'name','team') on conflict(user_id) do nothing;
 insert into public.espia_teams(id,name,school,class_name,teacher_id,team_user_id,login,registration_data,role_assignments)
 values(p_team->>'id',trim(p_team->>'name'),trim(p_team->>'school'),coalesce(p_team->>'turma',''),null,p_user,p_team->>'login',p_team-'passwordHash'-'password',assignments);
 seen:='{}';
 for m in select value from jsonb_array_elements(p_team->'members') loop
  r:=m->>'missionRole';if r=any(seen) then r:=null;elsif r=any(roles) then seen:=array_append(seen,r);else r:=null;end if;
  insert into public.espia_members(team_id,id,real_name,avatar_name,mission_role,avatar)
  values(p_team->>'id',m->>'id',trim(m->>'name'),nullif(trim(m->>'avatarName'),''),r,coalesce(m->'avatar','{}'));
 end loop;
end $$;
revoke all on function public.espia_register_team_internal(jsonb,uuid) from public,anon,authenticated;
grant execute on function public.espia_register_team_internal(jsonb,uuid) to service_role;
-- Read policies remain unchanged: authenticated team sees only its own rows.
commit;

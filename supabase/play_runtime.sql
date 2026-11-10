begin;
create table public.espia_play_states (
 team_id text not null, challenge_id text not null, case_id text not null,
 state jsonb not null default '{}', revision integer not null default 0,
 mutation uuid, updated_at timestamptz not null default now(),
 primary key(team_id,challenge_id),
 foreign key(team_id,challenge_id,case_id) references public.espia_enrollments(team_id,challenge_id,case_id),
 check(jsonb_typeof(state)='object' and octet_length(state::text)<=2000000)
);
alter table public.espia_play_states enable row level security;
create policy play_read on public.espia_play_states for select to authenticated using(espia_private.can_access(team_id));
grant select on public.espia_play_states to authenticated;
create table public.espia_play_images (
 team_id text not null references public.espia_teams(id), id text not null,
 mime text not null check(mime in ('image/jpeg','image/png','image/webp')),
 data text not null check(length(data)<=900000), created_at timestamptz not null default now(),
 primary key(team_id,id)
);
alter table public.espia_play_images enable row level security;
create policy image_read on public.espia_play_images for select to authenticated using(espia_private.can_access(team_id));
create policy image_insert on public.espia_play_images for insert to authenticated with check(espia_private.can_play(team_id));
grant select,insert on public.espia_play_images to authenticated;
-- Privileged writes are restricted to the authenticated owner and canonical student actions.
-- Existing mentor/GDF evaluation RPCs remain the only grade writers.
create function espia_private.play_open(p_team text,p_case text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare c public.espia_cases%rowtype; e public.espia_enrollments%rowtype; result jsonb;
begin
 if not espia_private.can_play(p_team) then raise exception 'Entre com a equipe para iniciar'; end if;
 select * into strict c from public.espia_cases where id=p_case;
 perform 1 from public.espia_challenges where id=c.challenge_id for update;
 select * into e from public.espia_enrollments where team_id=p_team and challenge_id=c.challenge_id;
 if found and e.case_id<>p_case then raise exception 'Continue o caso já iniciado pela equipe'; end if;
 if e.team_id is null then
  if (select count(*) from public.espia_enrollments where challenge_id=c.challenge_id)>=3 then raise exception 'Desafio lotado: três equipes inscritas no banco'; end if;
  if (select count(*) from public.espia_members where team_id=p_team) not between 5 and 10 then raise exception 'Equipe deve ter de cinco a dez integrantes'; end if;
  insert into public.espia_enrollments(team_id,challenge_id,case_id,decision) values(p_team,c.challenge_id,p_case,'Equipe iniciando reunião para escolher e justificar o percurso.');
 end if;
 insert into public.espia_play_states(team_id,challenge_id,case_id) values(p_team,c.challenge_id,p_case) on conflict do nothing;
 select to_jsonb(s) into result from public.espia_play_states s where team_id=p_team and challenge_id=c.challenge_id;
 return result;
end $$;
create function public.espia_play_open(p_team text,p_case text) returns jsonb language sql security invoker set search_path='' as $$select espia_private.play_open(p_team,p_case)$$;
create or replace function espia_private.play_save(p_team text,p_case text,p_state jsonb,p_expected integer,p_mutation uuid,p_tasks jsonb default '[]') returns integer
language plpgsql security definer set search_path='' as $$
declare s public.espia_play_states%rowtype; e public.espia_enrollments%rowtype; r jsonb; f jsonb; a public.espia_activities%rowtype; d public.espia_deliveries%rowtype; client jsonb; v_payload jsonb; owner_id text; image_id text; field text; idx integer; n integer; newrev integer;
begin
 if not espia_private.can_play(p_team) then raise exception 'Sessão da equipe necessária'; end if;
 select * into strict s from public.espia_play_states where team_id=p_team and case_id=p_case for update;
 if s.mutation=p_mutation then return s.revision; end if;
 if s.revision<>p_expected then raise exception 'Conflito: outra sessão salvou esta equipe. Reabra o desafio antes de continuar'; end if;
 select * into strict e from public.espia_enrollments where team_id=p_team and case_id=p_case for update;
 if jsonb_array_length(p_state->'records')>10 then raise exception 'Registros demais'; end if;
 if p_state->>'teamId' is distinct from p_team or p_state->>'routeId' is distinct from p_case or jsonb_typeof(p_state->'records')<>'array' or jsonb_typeof(p_state->'drafts')<>'object' then raise exception 'Estado de partida inválido'; end if;
 idx:=(p_state->>'index')::integer;
 if idx<e.current_index or idx>e.current_index+1 or idx not between 0 and 9 then raise exception 'Avanço de etapa inválido'; end if;
 if coalesce((p_state->>'started')::boolean,false) and p_state->'assignments' is distinct from (select role_assignments from public.espia_teams where id=p_team) then raise exception 'Papéis diferentes do cadastro'; end if;
 for r in select value from jsonb_array_elements(p_state->'records') loop
  select * into strict a from public.espia_activities where case_id=p_case and kind=r->>'kind';
  if a.sequence>e.current_index then raise exception 'Atividade ainda não liberada'; end if;
  select role_assignments->>a.mission_role into owner_id from public.espia_teams where id=p_team;
  if r->>'memberId' is distinct from owner_id then raise exception 'Integrante incorreto para a tarefa'; end if;
  f:=r->'fields';
  if length(trim(coalesce(f->>'answer','')))<20 then raise exception 'Resposta precisa de vinte caracteres'; end if;
  if a.kind='source' and (f->>'source' is distinct from 'oficial' or f->>'toolOpened' is distinct from 'sim') then raise exception 'Consulte e escolha a fonte pertinente'; end if;
  if a.kind='solution' and length(trim(coalesce(f->>'responsibilities',f->>'answer','')))<20 then raise exception 'Explique a proposta'; end if;
  client:=null;
  select value into client from jsonb_array_elements(p_tasks) where value->>'memberId'=owner_id and value->'payloadFields'->>'kind'=a.kind limit 1;
  v_payload:=f||jsonb_build_object('_client',jsonb_build_object('key',client->>'key','title',a.title,'memberName',r->>'memberName','originalPayload',client->>'payload'));
  select * into d from public.espia_deliveries where team_id=p_team and challenge_id=e.challenge_id and kind=a.kind for update;
  if d.id is null then
   insert into public.espia_deliveries(team_id,challenge_id,case_id,kind,step,member_id,payload,submitted_by) values(p_team,e.challenge_id,p_case,a.kind,a.step,owner_id,v_payload,auth.uid()) returning * into d;
   insert into public.espia_delivery_revisions(delivery_id,revision,payload,member_id,submitted_by) values(d.id,d.revision,d.payload,owner_id,auth.uid());
  elsif (d.payload-'_client') is distinct from f then
   if d.status<>'student_adjust' then raise exception 'Esta resposta já foi enviada. Aguarde devolutiva'; end if;
   update public.espia_deliveries set payload=v_payload,revision=revision+1,status='teacher_pending',teacher_score=null,submitted_at=now(),submitted_by=auth.uid() where id=d.id returning * into d;
   insert into public.espia_delivery_revisions(delivery_id,revision,payload,member_id,submitted_by) values(d.id,d.revision,d.payload,owner_id,auth.uid());
  end if;
  foreach field in array array['evidenceId','researchEvidence','participationEvidence'] loop
   image_id:=f->>field;
   if coalesce(image_id,'')<>'' then
    if not exists(select 1 from public.espia_play_images where team_id=p_team and id=image_id) then raise exception 'Imagem ainda não confirmada no banco'; end if;
    insert into public.espia_evidence(team_id,challenge_id,case_id,delivery_id,kind,object_path,description,created_by)
    values(p_team,e.challenge_id,p_case,d.id,case field when 'researchEvidence' then 'research' when 'participationEvidence' then 'participation' else 'task' end,p_team||'/database/'||image_id,field,auth.uid()) on conflict(object_path) do nothing;
   end if;
  end loop;
 end loop;
 -- Never remove previously received responses or advance past an unsent/returned response.
 if exists(select 1 from public.espia_deliveries x where x.team_id=p_team and x.case_id=p_case and not exists(select 1 from jsonb_array_elements(p_state->'records') y where y->>'kind'=x.kind)) then raise exception 'Partida local está desatualizada'; end if;
 if idx>e.current_index or coalesce((p_state->>'finished')::boolean,false) then
  if not exists(select 1 from public.espia_deliveries x join public.espia_activities z on z.case_id=x.case_id and z.kind=x.kind where x.team_id=p_team and x.case_id=p_case and z.sequence=e.current_index and x.status<>'student_adjust') then raise exception 'Envie a tarefa antes de passar o bastão'; end if;
 end if;
 if coalesce((p_state->>'finished')::boolean,false) and (exists(select 1 from public.espia_deliveries where team_id=p_team and case_id=p_case and status='student_adjust') or exists(select 1 from public.espia_forum_questions q where espia_private.forum_applies(q.id,p_team) and not exists(select 1 from public.espia_forum_responses r where r.question_id=q.id and r.team_id=p_team and r.status<>'student_adjust'))) then raise exception 'Corrija as entregas e responda ao fórum antes de concluir';end if;
 if coalesce((p_state->>'finished')::boolean,false) and idx<>9 then raise exception 'Etapas pendentes'; end if;
 if jsonb_array_length(p_state->'position')<>2 or not ((p_state->'position'->>0)::numeric between 0 and 100 and (p_state->'position'->>1)::numeric between 0 and 100) then raise exception 'Posição inválida'; end if;
 update public.espia_enrollments set current_index=idx,place=p_state->>'place',position=p_state->'position',discoveries=coalesce(p_state->'discoveredClues','[]'),drafts=p_state->'drafts',decision=case when length(p_state->>'discussion')>=20 then p_state->>'discussion' else decision end,finished=coalesce((p_state->>'finished')::boolean,false),revision=revision+1,updated_at=now() where team_id=p_team and challenge_id=e.challenge_id;
 update public.espia_play_states set state=p_state,revision=revision+1,mutation=p_mutation,updated_at=now() where team_id=p_team and challenge_id=e.challenge_id returning revision into newrev;
 return newrev;
end $$;
create function public.espia_play_save(p_team text,p_case text,p_state jsonb,p_expected integer,p_mutation uuid,p_tasks jsonb default '[]') returns integer language sql security invoker set search_path='' as $$ select espia_private.play_save(p_team,p_case,p_state,p_expected,p_mutation,p_tasks) $$;
create function public.espia_play_capacity() returns table(challenge_id text,occupied bigint) language sql security definer set search_path='' as $$select c.id,count(e.team_id) from public.espia_challenges c left join public.espia_enrollments e on e.challenge_id=c.id where auth.uid() is not null group by c.id$$;
revoke all on function public.espia_play_open(text,text),public.espia_play_save(text,text,jsonb,integer,uuid,jsonb),public.espia_play_capacity(),espia_private.play_open(text,text),espia_private.play_save(text,text,jsonb,integer,uuid,jsonb) from public,anon;
grant execute on function public.espia_play_open(text,text),public.espia_play_save(text,text,jsonb,integer,uuid,jsonb),public.espia_play_capacity(),espia_private.play_open(text,text),espia_private.play_save(text,text,jsonb,integer,uuid,jsonb) to authenticated;
commit;

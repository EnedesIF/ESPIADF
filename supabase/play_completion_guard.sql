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

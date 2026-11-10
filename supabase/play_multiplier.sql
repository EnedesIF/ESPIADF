begin;
-- Independent bonus records: these do not change the nine-stage route or its 900 points.
create table public.espia_learning_submissions (
 id uuid primary key default gen_random_uuid(),
 team_id text not null references public.espia_teams(id),
 challenge_id text not null,
 mission_id text not null default 'multiplier' check(mission_id='multiplier'),
 member_id text not null,
 payload jsonb not null check(jsonb_typeof(payload)='object' and octet_length(payload::text)<=30000),
 status text not null default 'teacher_pending' check(status in ('teacher_pending','student_adjust','gdf_pending','teacher_adjust','validated')),
 teacher_score numeric check(teacher_score between 0 and 100),
 revision integer not null default 1 check(revision>0),
 history jsonb not null default '[]' check(jsonb_typeof(history)='array'),
 submitted_by uuid not null references public.espia_profiles(user_id),
 submitted_at timestamptz not null default now(),
 unique(team_id,challenge_id,mission_id),
 foreign key(team_id,challenge_id) references public.espia_enrollments(team_id,challenge_id),
 foreign key(team_id,member_id) references public.espia_members(team_id,id),
 check(status not in ('gdf_pending','teacher_adjust','validated') or teacher_score is not null)
);
alter table public.espia_learning_submissions enable row level security;
revoke all on public.espia_learning_submissions from public,anon,authenticated;
grant select on public.espia_learning_submissions to authenticated;
create policy learning_read on public.espia_learning_submissions for select to authenticated using(espia_private.can_access(team_id));

create function espia_private.submit_learning(p_team text,p_challenge text,p_expected integer,p_payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare d public.espia_learning_submissions%rowtype; owner_id text; item jsonb; image_id text; at_ms bigint; h jsonb;
begin
 if auth.uid() is null or not espia_private.can_play(p_team) then raise exception 'Sessão da equipe necessária'; end if;
 -- Serialize submissions and retries without exposing or replacing another session's work.
 perform 1 from public.espia_enrollments where team_id=p_team and challenge_id=p_challenge for update;
 if not found then raise exception 'Inicie o desafio antes de enviar a atividade'; end if;
 if p_expected is null or p_expected<0 or p_payload is null or jsonb_typeof(p_payload)<>'object' or octet_length(p_payload::text)>30000 then raise exception 'Registro inválido'; end if;
 if p_payload->>'privacy' is distinct from 'true' then raise exception 'Confirme a revisão da privacidade'; end if;
 if jsonb_typeof(p_payload->'texts') is distinct from 'array' then raise exception 'Preencha as três respostas'; end if;
 if jsonb_array_length(p_payload->'texts')<>3 then raise exception 'Preencha as três respostas'; end if;
 for item in select value from jsonb_array_elements(p_payload->'texts') loop
  if jsonb_typeof(item)<>'string' or length(trim(item#>>'{}')) not between 20 and 6000 then raise exception 'Respostas devem ter de 20 a 6.000 caracteres'; end if;
 end loop;
 if coalesce(p_payload->>'people','')!~'^[0-9]{1,5}$' or (p_payload->>'people')::integer not between 1 and 10000 then raise exception 'Informe de 1 a 10.000 participantes'; end if;
 if coalesce(p_payload->>'date','')!~'^\d{4}-\d{2}-\d{2}$' or (p_payload->>'date')::date>current_date then raise exception 'Informe a data da atividade já realizada'; end if;
 if coalesce(p_payload->>'url','')<>'' and (length(p_payload->>'url')>2048 or p_payload->>'url'!~'^https://[^[:space:]/@]+\.[^[:space:]/@]+(/[^[:space:]]*)?$') then raise exception 'Informe um link HTTPS válido'; end if;
 image_id:=p_payload->>'evidenceId';
 if not exists(select 1 from public.espia_play_images where team_id=p_team and id=image_id) then raise exception 'A imagem ainda não foi recebida'; end if;
 select * into d from public.espia_learning_submissions where team_id=p_team and challenge_id=p_challenge and mission_id='multiplier' for update;
 if d.id is not null and d.payload=p_payload then return jsonb_build_object('id',d.id,'revision',d.revision,'status',d.status); end if;
 if d.id is not null and (d.status<>'student_adjust' or d.revision<>p_expected) then raise exception 'Registro já em avaliação ou atualizado em outra sessão. Reabra a atividade'; end if;
 if d.id is null and p_expected<>0 then raise exception 'Reabra a atividade antes de reenviar'; end if;
 select role_assignments->>'dados' into owner_id from public.espia_teams where id=p_team;
 at_ms:=floor(extract(epoch from now())*1000)::bigint;
 h:=jsonb_build_object('by','student','actor','Equipe','at',at_ms,'status','teacher_pending','note','Atividade enviada ao professor','revision',coalesce(d.revision,0)+1,'payload',p_payload::text);
 if d.id is null then
  insert into public.espia_learning_submissions(team_id,challenge_id,member_id,payload,submitted_by,history) values(p_team,p_challenge,owner_id,p_payload,auth.uid(),jsonb_build_array(h)) returning * into d;
 else
  update public.espia_learning_submissions set payload=p_payload,status='teacher_pending',teacher_score=null,revision=revision+1,history=history||jsonb_build_array(h),submitted_by=auth.uid(),submitted_at=now() where id=d.id returning * into d;
 end if;
 return jsonb_build_object('id',d.id,'revision',d.revision,'status',d.status);
end $$;
create function public.espia_submit_learning(p_team text,p_challenge text,p_expected integer,p_payload jsonb) returns jsonb language sql security invoker set search_path='' as $$select espia_private.submit_learning(p_team,p_challenge,p_expected,p_payload)$$;

create function espia_private.review_learning(p_id uuid,p_action text,p_score numeric,p_note text) returns void
language plpgsql security definer set search_path='' as $$
declare d public.espia_learning_submissions%rowtype; r text; s text; n numeric;
begin
 if auth.uid() is null then raise exception 'Autenticação necessária'; end if;
 select * into strict d from public.espia_learning_submissions where id=p_id for update;
 if p_note is null or length(trim(p_note)) not between 8 and 6000 then raise exception 'Justifique a avaliação com 8 a 6.000 caracteres'; end if;
 if p_action in ('approve','adjust') and espia_private.is_teacher(d.team_id) and d.status in ('teacher_pending','teacher_adjust') then
  r:='teacher';s:=case when p_action='approve' then case when d.challenge_id='territory' then 'validated' else 'gdf_pending' end else 'student_adjust' end;n:=case when p_action='approve' then p_score else null end;
  if p_action='approve' and (p_score is null or p_score='NaN'::numeric or p_score<0 or p_score>100) then raise exception 'Nota entre 0 e 100'; end if;
 elsif p_action in ('confirm','return') and espia_private.has_role('gdf') and d.status='gdf_pending' then
  r:='gdf';s:=case when p_action='confirm' then 'validated' else 'teacher_adjust' end;n:=d.teacher_score;
 else raise exception 'Perfil ou situação não permite esta avaliação'; end if;
 update public.espia_learning_submissions set status=s,teacher_score=n,history=history||jsonb_build_array(jsonb_build_object('by',r,'actor',case when r='teacher' then 'Professor' else 'GDF' end,'at',floor(extract(epoch from now())*1000)::bigint,'status',s,'score',n,'note',trim(p_note),'revision',d.revision)) where id=d.id;
end $$;
create function public.espia_review_learning(p_id uuid,p_action text,p_score numeric,p_note text) returns void language sql security invoker set search_path='' as $$select espia_private.review_learning(p_id,p_action,p_score,p_note)$$;
revoke all on function espia_private.submit_learning(text,text,integer,jsonb),public.espia_submit_learning(text,text,integer,jsonb),espia_private.review_learning(uuid,text,numeric,text),public.espia_review_learning(uuid,text,numeric,text) from public,anon,authenticated;
grant execute on function espia_private.submit_learning(text,text,integer,jsonb),public.espia_submit_learning(text,text,integer,jsonb),espia_private.review_learning(uuid,text,numeric,text),public.espia_review_learning(uuid,text,numeric,text) to authenticated;
commit;

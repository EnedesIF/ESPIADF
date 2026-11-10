create or replace function espia_private.play_open(p_team text,p_case text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare c public.espia_cases%rowtype; e public.espia_enrollments%rowtype; result jsonb;
begin
 if not espia_private.can_play(p_team) then raise exception 'Entre com a equipe para iniciar'; end if;
 select * into strict c from public.espia_cases where id=p_case;
 perform 1 from public.espia_challenges where id=c.challenge_id for update;
 select * into e from public.espia_enrollments where team_id=p_team and challenge_id=c.challenge_id;
 if found and e.case_id<>p_case then raise exception 'Continue o caso já iniciado pela equipe'; end if;
 if e.team_id is null then
  if (select count(*) from public.espia_enrollments en join public.espia_teams t on t.id=en.team_id where en.challenge_id=c.challenge_id and not t.is_test)>=3 then raise exception 'Desafio lotado: três equipes inscritas no banco'; end if;
  if (select count(*) from public.espia_members where team_id=p_team) not between 5 and 10 then raise exception 'Equipe deve ter de cinco a dez integrantes'; end if;
  insert into public.espia_enrollments(team_id,challenge_id,case_id,decision) values(p_team,c.challenge_id,p_case,'Equipe iniciando reunião para escolher e justificar o percurso.');
 end if;
 insert into public.espia_play_states(team_id,challenge_id,case_id) values(p_team,c.challenge_id,p_case) on conflict do nothing;
 select to_jsonb(s) into result from public.espia_play_states s where team_id=p_team and challenge_id=c.challenge_id;
 return result;
end $$;

-- Nova narrativa da quadra. Aplicar após 001–004. Não conecta o cliente ao banco.
-- Interrompe sem alterações se houver percurso antigo no banco: não reinterpreta nem apaga entregas.
begin;
select pg_advisory_xact_lock(hashtext('espia-court-rights-v2'));
do $$ begin
 if exists(select 1 from public.espia_cases where id='court' and coalesce(configuration->>'narrativeVersion','')<>'court-rights-v2') and exists(select 1 from public.espia_enrollments where case_id='court') then
 raise exception 'Há percursos da narrativa antiga da quadra. Preserve esse histórico e planeje a migração antes de alterar as etapas. Nenhum dado foi apagado.';
 end if;
end $$;
create or replace function espia_private.submit_task(p_team text,p_challenge text,p_kind text,p_member text,p_payload jsonb) returns uuid
language plpgsql security definer set search_path='' as $$
declare e public.espia_enrollments%rowtype;a public.espia_activities%rowtype;d public.espia_deliveries%rowtype;
begin
 if not espia_private.can_play(p_team) then raise exception 'Acesso da equipe necessário'; end if;
 select * into strict e from public.espia_enrollments where team_id=p_team and challenge_id=p_challenge for update;
 select * into strict a from public.espia_activities where case_id=e.case_id and kind=p_kind;
 select * into d from public.espia_deliveries where team_id=p_team and challenge_id=p_challenge and kind=p_kind for update;
 if found and d.status<>'student_adjust' then raise exception 'Entrega já enviada ou validada'; end if;
 if d.id is null and (a.sequence<>e.current_index or e.finished) then raise exception 'Esta tarefa ainda não está liberada'; end if;
 if not exists(select 1 from public.espia_members where team_id=p_team and id=p_member and mission_role=a.mission_role) then raise exception 'Integrante não corresponde ao papel desta tarefa'; end if;
 if length(trim(coalesce(p_payload->>'answer','')))<20 then raise exception 'Registre uma resposta com pelo menos 20 caracteres'; end if;
 if e.case_id='court' then
 if p_kind='agent' and not (e.discoveries ? 'step:2') then raise exception 'Leia a pista antes da conversa'; end if;
 if p_kind='board' then
  p_payload=jsonb_set(p_payload,'{researchURL}',to_jsonb(espia_private.normalize_source_url(p_payload->>'researchURL')));
  if coalesce(p_payload->>'researchDate','')='' or (p_payload->>'researchDate')::date>current_date then raise exception 'Informe a data da consulta à norma'; end if;
  if p_payload->>'toolOpened' is distinct from 'sim' then raise exception 'Consulte a norma oficial'; end if;
  if length(trim(coalesce(p_payload->>'normExcerpt','')))<20 and not exists(select 1 from public.espia_evidence where team_id=p_team and challenge_id=p_challenge and kind='research') then raise exception 'Registre trecho ou imagem da norma'; end if;
 end if;
 if p_kind='source' then
  if coalesce(p_payload->>'source','') not in ('oficial','administracao') or p_payload->>'toolOpened' is distinct from 'sim' then raise exception 'Consulte uma fonte pertinente'; end if;
  if coalesce(p_payload->>'authorisationStatus','') not in ('found','not_found','not_checked') then raise exception 'Informe o resultado da verificação'; end if;
  if p_payload->>'authorisationStatus'='found' then
   p_payload=jsonb_set(p_payload,'{authorisationURL}',to_jsonb(espia_private.normalize_source_url(p_payload->>'authorisationURL')));
   if length(trim(coalesce(p_payload->>'authorisationExcerpt','')))<20 then raise exception 'Descreva o que o documento confirma'; end if;
  end if;
 end if;
 if p_kind='solution' and length(trim(coalesce(p_payload->>'responsibilities','')))<20 then raise exception 'Registre responsáveis e próximo passo'; end if;
 if p_kind='channel' and (coalesce(p_payload->>'channel','') not in ('consulta','lai','ouvidoria') or length(trim(coalesce(p_payload->>'draft','')))<20) then raise exception 'Justifique consulta suficiente, LAI ou ouvidoria'; end if;
 if p_kind='final' then
  if (select count(*) from public.espia_deliveries where team_id=p_team and challenge_id=p_challenge and kind<>'final' and status<>'student_adjust')<>9 then raise exception 'Registre as atividades anteriores'; end if;
  p_payload=jsonb_set(p_payload,'{researchURL}',to_jsonb(espia_private.normalize_source_url(p_payload->>'researchURL')));
  if coalesce(p_payload->>'researchDate','')='' or (p_payload->>'researchDate')::date>current_date then raise exception 'Confira a data da consulta'; end if;
  if length(trim(coalesce(p_payload->>'normExcerpt','')))<20 and not exists(select 1 from public.espia_evidence where team_id=p_team and challenge_id=p_challenge and kind='research') then raise exception 'Registre trecho ou imagem da norma'; end if;
  if length(trim(coalesce(p_payload->>'confirmedFacts','')))<20 or length(trim(coalesce(p_payload->>'remainingLimits','')))<20 or length(trim(coalesce(p_payload->>'teamWork','')))<20 or p_payload->>'confirm' is distinct from 'sim' then raise exception 'Confira fatos, limites e trabalho em equipe'; end if;
  if p_payload->>'externalSent'='sim' then
   if coalesce(p_payload->>'externalChannel','') not in ('lai','ouvidoria') or coalesce(p_payload->>'participationDate','')='' or (p_payload->>'participationDate')::date>current_date then raise exception 'Confira a participação externa efetiva'; end if;
   if not exists(select 1 from public.espia_deliveries where team_id=p_team and challenge_id=p_challenge and kind='channel' and status='validated') then raise exception 'Aguarde a revisão do professor'; end if;
   if not exists(select 1 from public.espia_evidence where team_id=p_team and challenge_id=p_challenge and kind='participation') then raise exception 'Registre comprovante somente da participação efetiva'; end if;
  end if;
 end if;
 else
 if p_kind='source' then
 if p_payload->>'source' is distinct from 'oficial' or p_payload->>'toolOpened' is distinct from 'sim' then raise exception 'Registre a consulta à fonte indicada'; end if;
 if (p_challenge='mobility' or e.case_id='ubs') then
  p_payload=jsonb_set(p_payload,'{researchURL}',to_jsonb(espia_private.normalize_source_url(p_payload->>'researchURL')));
  if coalesce(p_payload->>'researchDate','')='' or (p_payload->>'researchDate')::date>current_date then raise exception 'Confira a data da pesquisa'; end if;
  if not exists(select 1 from public.espia_evidence where team_id=p_team and challenge_id=p_challenge and kind='research') then raise exception 'Registre a evidência da consulta real'; end if;
  if p_payload->>'sourceStatus'='unavailable' and length(trim(coalesce(p_payload->>'accessIssue','')))<20 then raise exception 'Descreva a dificuldade de acesso'; end if;
 elsif length(trim(coalesce(p_payload->>'hypothesis','')))<20 then raise exception 'Registre a ideia inicial'; end if;
 end if;
 if p_kind='agent' and not (e.discoveries ? 'step:2') then raise exception 'Guarde a pista antes da conversa'; end if;
 if p_kind='board' and not exists(select 1 from public.espia_evidence where team_id=p_team and challenge_id=p_challenge and kind='task') then raise exception 'Registre a evidência do cenário'; end if;
 if p_kind='solution' and length(trim(coalesce(p_payload->>'responsibilities','')))<20 then raise exception 'Registre ações e responsáveis'; end if;
 if p_kind='channel' and (coalesce(p_payload->>'channel','') not in ('consulta','lai','ouvidoria','servico') or length(trim(coalesce(p_payload->>'draft','')))<20) then raise exception 'Registre o canal e o texto preparado'; end if;
 if p_kind='final' then
 if exists(select 1 from public.espia_members m where m.team_id=p_team and ((p_challenge<>'mobility' and e.case_id<>'ubs') or m.mission_role is not null) and length(trim(coalesce(p_payload->>('contribution:'||m.id),'')))<20) then raise exception 'Registre a contribuição de cada integrante'; end if;
 if length(trim(coalesce(p_payload->>'research','')))<20 or length(trim(coalesce(p_payload->>'participation','')))<20 or p_payload->>'confirm' is distinct from 'sim' then raise exception 'Confira a pesquisa e a decisão sobre encaminhamento'; end if;
 if (select count(*) from public.espia_deliveries where team_id=p_team and challenge_id=p_challenge and status<>'student_adjust' and kind<>'final')<>9 then raise exception 'Conclua e corrija as entregas anteriores'; end if;
 if not exists(select 1 from public.espia_evidence where team_id=p_team and challenge_id=p_challenge and kind='research') then raise exception 'Registre a evidência da pesquisa'; end if;
 if (p_challenge='mobility' or e.case_id='ubs') then
  p_payload=jsonb_set(p_payload,'{researchURL}',to_jsonb(espia_private.normalize_source_url(p_payload->>'researchURL')));
  if coalesce(p_payload->>'researchDate','')='' or (p_payload->>'researchDate')::date>current_date then raise exception 'Confira a data da pesquisa'; end if;
  if coalesce(p_payload->>'realChannel','') not in ('consulta','lai','ouvidoria','servico','acao') then raise exception 'Confira a decisão da etapa 7'; end if;
  if p_payload->>'externalSent'='sim' then
   if p_payload->>'realChannel'='consulta' then raise exception 'Consulta suficiente não é envio externo'; end if;
   if p_payload->>'realChannel'<>'acao' and not exists(select 1 from public.espia_deliveries where team_id=p_team and challenge_id=p_challenge and kind='channel' and status in ('gdf_pending','validated')) then raise exception 'Aguarde a revisão da minuta pelo professor'; end if;
   if coalesce(p_payload->>'participationDate','')='' or (p_payload->>'participationDate')::date>current_date or p_payload->>'externalConfirm' is distinct from 'sim' then raise exception 'Confira a participação externa efetivamente realizada'; end if;
   if not exists(select 1 from public.espia_evidence where team_id=p_team and challenge_id=p_challenge and kind='participation') then raise exception 'Registre o comprovante da participação externa'; end if;
  end if;
 elsif not (e.case_id='court' and coalesce(p_payload->>'realChannel','')='consulta') and not exists(select 1 from public.espia_evidence where team_id=p_team and challenge_id=p_challenge and kind='participation') then raise exception 'Registre a evidência da participação'; end if;
 end if;
 end if;
 if d.id is null then
 insert into public.espia_deliveries(team_id,challenge_id,case_id,kind,step,member_id,payload,submitted_by)
 values(p_team,p_challenge,e.case_id,p_kind,a.step,p_member,p_payload,auth.uid()) returning * into d;
 else
 update public.espia_deliveries set payload=p_payload,member_id=p_member,status='teacher_pending',teacher_score=null,revision=revision+1,submitted_by=auth.uid(),submitted_at=now() where id=d.id returning * into d;
 end if;
 insert into public.espia_delivery_revisions(delivery_id,revision,payload,member_id,submitted_by) values(d.id,d.revision,d.payload,d.member_id,auth.uid());return d.id;
end $$;
update public.espia_cases set title='A quadra é pública. Mas quem pode usar?',configuration='{"id": "court", "code": "3A", "campaign": "territory", "title": "A quadra é pública. Mas quem pode usar?", "question": "Outro grupo afirma ter prioridade na quadra às quartas-feiras, às 17h. O que precisamos verificar?", "agency": "Administração Regional de Águas Claras", "source": "SINJ-DF • Ordem de Serviço nº 30/2025 — Águas Claras", "url": "https://www.sinj.df.gov.br/sinj/Norma/698986606f294f7bb6cf57fd89c308cd/Ordem_de_Servi_o_30_05_06_2025.html", "tool": "orgao", "search": "Consultem a norma de utilização dos espaços esportivos sob gestão da Administração de Águas Claras. Diferenciem uso comunitário, programação autorizada e alegação de prioridade.", "initial": "A equipe quer jogar futebol numa quadra pública de Águas Claras na quarta-feira, às 17h. Outro grupo afirma que tem prioridade nesse horário. Será que isso é verdade? Investiguem as regras oficiais e descubram como resolver a situação de forma justa.", "other": "Nosso grupo joga aqui toda quarta-feira, às 17h. Por isso, esse horário é nosso!", "facts": ["Situação fictícia: outro grupo afirma ter prioridade na quadra às quartas-feiras, às 17h.", "A alegação de um frequentador precisa ser confrontada com a regra e com eventual programação ou autorização do responsável pelo espaço."], "limit": "A norma geral não comprova autorização para este grupo, nesta quadra e neste horário. Confiram a gestão do espaço, o alcance atual da norma e eventual programação autorizada.", "record": "Norma consultada, link, data, trecho relevante, o que foi confirmado, o que não foi possível verificar e orientação à comunidade.", "participation": "A consulta pode ser suficiente. Para informação pública existente não localizada, avaliem a LAI; diante de impedimento irregular real ou necessidade de providência, avaliem a ouvidoria. O jogo não envia solicitações.", "channel": "lai", "warning": "", "art": "court", "extra": {"label": "Administração Regional de Águas Claras • orientação e contatos", "url": "https://www.aguasclaras.df.gov.br/"}, "narrativeVersion": "court-rights-v2"}'::jsonb where id='court';
update public.espia_activities set step=1,title='Nossa dúvida',prompt='Antes de decidir quem pode usar o espaço, o que precisamos descobrir?' where case_id='court' and kind='route';
update public.espia_activities set step=2,title='Conversar com a Administração',prompt='Quem administra o espaço e onde a equipe pode consultar as regras oficiais de utilização da quadra?' where case_id='court' and kind='agent';
update public.espia_activities set step=3,title='Consultar a norma oficial',prompt='O uso de quadra pública exige sempre reserva? Expliquem com base no trecho da norma que consultaram.' where case_id='court' and kind='board';
update public.espia_activities set step=4,title='Ouvir o outro grupo',prompt='O que a fala do frequentador comprova? Que informação oficial ainda falta verificar?' where case_id='court' and kind='compare';
update public.espia_activities set step=5,title='Conferir a regra',prompt='Que documento ou informação pode confirmar se existe uso autorizado para a quarta-feira às 17h?' where case_id='court' and kind='source';
update public.espia_activities set step=5,title='Verificar a alegação',prompt='A fonte consultada comprova que o outro grupo tem autorização para usar a quadra exclusivamente na quarta-feira às 17h? O que falta confirmar?' where case_id='court' and kind='verify';
update public.espia_activities set step=6,title='Organizar fatos e lacunas',prompt='O que sabemos sobre a regra de uso e o que ainda precisa ser confirmado? Indiquem a fonte e o próximo passo.' where case_id='court' and kind='solution';
update public.espia_activities set step=7,title='Escolher o encaminhamento',prompt='Por que a equipe escolheu esse encaminhamento? Registrem a conclusão ou a minuta adequada à necessidade.' where case_id='court' and kind='channel';
update public.espia_activities set step=8,title='Interpretar o retorno simulado',prompt='O retorno comprova disponibilidade ou autorização para quarta-feira às 17h? O que ainda falta verificar?' where case_id='court' and kind='response';
update public.espia_activities set step=9,title='Orientar a comunidade',prompt='Que orientação a equipe daria aos moradores para usar a quadra respeitando as regras e os demais usuários?' where case_id='court' and kind='final';
create or replace function espia_private.ranking(p_challenge text default null)
returns table(team_id text,team_name text,points numeric,validated_steps bigint,maximum integer)
language sql stable security definer set search_path='' as $$
 with stages as (
 select d.team_id,d.challenge_id,d.case_id,d.step,
 case when count(*)=(select count(*) from public.espia_activities a where a.case_id=d.case_id and a.step=d.step) then avg(d.teacher_score) else 0 end as points,
 (count(*)=(select count(*) from public.espia_activities a where a.case_id=d.case_id and a.step=d.step)) as completed
 from public.espia_deliveries d where d.status='validated' and (p_challenge is null or d.challenge_id=p_challenge)
 group by d.team_id,d.challenge_id,d.case_id,d.step)
 select t.id,t.name,coalesce(sum(s.points),0),count(*) filter(where s.completed),case when p_challenge is null then 3600 else 900 end
 from public.espia_teams t left join stages s on s.team_id=t.id
 where auth.uid() is not null and (p_challenge is null or p_challenge in ('mobility','work','territory','health'))
 group by t.id,t.name order by coalesce(sum(s.points),0) desc,t.name
$$;

commit;

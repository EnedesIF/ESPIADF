-- Revisão Saúde • Acesso à UBS. Aplicar após 001 e 002.
-- Não conecta o cliente ao Supabase. Preserva IDs, entregas e notas.
begin;
select pg_advisory_xact_lock(hashtext('espia-gdf-review-003'));
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
 elsif not exists(select 1 from public.espia_evidence where team_id=p_team and challenge_id=p_challenge and kind='participation') then raise exception 'Registre a evidência da participação'; end if;
 end if;
 if d.id is null then
 insert into public.espia_deliveries(team_id,challenge_id,case_id,kind,step,member_id,payload,submitted_by)
 values(p_team,p_challenge,e.case_id,p_kind,a.step,p_member,p_payload,auth.uid()) returning * into d;
 else
 update public.espia_deliveries set payload=p_payload,member_id=p_member,status='teacher_pending',teacher_score=null,revision=revision+1,submitted_by=auth.uid(),submitted_at=now() where id=d.id returning * into d;
 end if;
 insert into public.espia_delivery_revisions(delivery_id,revision,payload,member_id,submitted_by) values(d.id,d.revision,d.payload,d.member_id,auth.uid());return d.id;
end $$;
update public.espia_cases set configuration='{"id": "ubs", "code": "4A", "campaign": "health", "title": "Acesso à UBS", "question": "Onde encontrar uma UBS e como saber quais serviços ela oferece?", "agency": "SES-DF", "source": "InfoSaúde • Busca Saúde UBS", "url": "https://info.saude.df.gov.br/busca-saude-ubs/", "tool": "infosaude", "search": "Orientações de acesso, identificação do serviço e unidade para referência pública da Região Administrativa.", "initial": "Uma pessoa precisa descobrir onde encontrar uma UBS e quais serviços ela oferece. Vamos pesquisar informações públicas, sem usar dados de saúde de pessoas reais.", "other": "Uma pessoa acredita que uma UBS próxima garante atendimento imediato. Como podemos conferir os serviços e as orientações de acesso?", "facts": ["Registro fictício: a unidade e o local de referência servem apenas ao jogo. Use um local público como referência para pesquisar.", "Consulte os canais oficiais da SES-DF para verificar a localização, os serviços e as orientações reais. Encontrar uma UBS no mapa não garante consulta ou atendimento imediato."], "limit": "Estar perto da UBS não significa atendimento imediato. Confira o serviço e como acessá-lo antes de orientar a pessoa.", "record": "Unidade ou serviço pesquisado, fonte oficial, informação confirmada, data da consulta, orientação de acesso e dúvida ainda não resolvida.", "participation": "Verifique primeiro se a informação já está disponível. Use a LAI para solicitar informação pública existente não encontrada; a ouvidoria para relatar uma situação concreta do serviço. Dúvidas clínicas devem ser tratadas pelos canais de saúde apropriados.", "channel": "lai", "art": "ubs"}'::jsonb where id='ubs';
update public.espia_activities set title='Conhecer o problema • Acesso à UBS',prompt='Quais informações precisamos verificar para encontrar uma UBS e conhecer seus serviços?' where case_id='ubs' and kind='route';
update public.espia_activities set title='Ouvir orientação • Acesso à UBS',prompt='O que precisamos conferir para orientar alguém a encontrar uma UBS e consultar seus serviços?' where case_id='ubs' and kind='agent';
update public.espia_activities set title='Abrir • Orientação de acesso à unidade',prompt='Quais informações do registro ajudam a localizar a UBS? A referência escolhida é um local público?' where case_id='ubs' and kind='board';
update public.espia_activities set title='Ouvir • Usuário do serviço',prompt='O que devemos verificar antes de afirmar que essa UBS oferece o atendimento procurado?' where case_id='ubs' and kind='compare';
update public.espia_activities set title='Consultar as fontes oficiais da UBS',prompt='Qual informação você encontrou? Informe o nome da fonte e resuma o que ela esclarece sobre a localização ou os serviços da UBS.' where case_id='ubs' and kind='source';
update public.espia_activities set title='Conferir a descoberta • Acesso à UBS',prompt='Encontrar a UBS no mapa garante atendimento imediato? O que a fonte informa e o que ainda precisa ser confirmado?' where case_id='ubs' and kind='verify';
update public.espia_activities set title='Montar nosso plano • Acesso à UBS',prompt='Como a equipe vai orientar alguém a localizar uma UBS e consultar seus serviços? Indiquem a fonte, a informação confirmada e o ponto a verificar.' where case_id='ubs' and kind='solution';
update public.espia_activities set title='Preparar o próximo passo • Acesso à UBS',prompt='A consulta resolveu a dúvida ou falta uma informação pública ou situação concreta do serviço a encaminhar?' where case_id='ubs' and kind='channel';
update public.espia_activities set title='Ler o retorno • Acesso à UBS',prompt='O que o retorno confirma? O que não garante e ainda precisa ser verificado com o serviço?' where case_id='ubs' and kind='response';
update public.espia_activities set title='Apresentar a descoberta • Acesso à UBS',prompt='Que informação real de uma UBS a equipe conferiu e qual orientação ou participação pertinente realizou?' where case_id='ubs' and kind='final';
commit;

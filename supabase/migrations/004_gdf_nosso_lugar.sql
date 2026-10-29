-- Revisão cenário 3 • professor confirma a pontuação escolar.
-- Aplicar após 001, 002 e 003. Fórum mantém avaliação própria.
-- Não conecta o cliente ao Supabase. Preserva IDs, notas e histórico.
begin;
select pg_advisory_xact_lock(hashtext('espia-gdf-review-004'));
create or replace function espia_private.review_task(p_id uuid,p_action text,p_score numeric,p_note text) returns void
language plpgsql security definer set search_path='' as $$
declare d public.espia_deliveries%rowtype;r text;s text;n numeric;
begin
 select * into strict d from public.espia_deliveries where id=p_id for update;
 if length(trim(p_note))<8 then raise exception 'Justifique a avaliação'; end if;
 if p_action in ('approve','adjust') and espia_private.is_teacher(d.team_id) and d.status in ('teacher_pending','teacher_adjust') then
 r='teacher';s=case when p_action='approve' then case when d.challenge_id='territory' then 'validated' else 'gdf_pending' end else 'student_adjust' end;n=case when p_action='approve' then p_score else null end;
 if p_action='approve' and (p_score is null or p_score<0 or p_score>100) then raise exception 'Nota entre 0 e 100'; end if;
 elsif p_action in ('confirm','return') and espia_private.has_role('gdf') and d.status='gdf_pending' and d.challenge_id<>'territory' then
 r='gdf';s=case when p_action='confirm' then 'validated' else 'teacher_adjust' end;n=d.teacher_score;
 else raise exception 'Perfil ou situação não permite esta avaliação'; end if;
 insert into public.espia_reviews(delivery_id,revision,reviewer_id,reviewer_role,action,score,note) values(d.id,d.revision,auth.uid(),r,p_action,n,p_note);
 update public.espia_deliveries set status=s,teacher_score=n where id=d.id;
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
 if d.id is null then
 insert into public.espia_deliveries(team_id,challenge_id,case_id,kind,step,member_id,payload,submitted_by)
 values(p_team,p_challenge,e.case_id,p_kind,a.step,p_member,p_payload,auth.uid()) returning * into d;
 else
 update public.espia_deliveries set payload=p_payload,member_id=p_member,status='teacher_pending',teacher_score=null,revision=revision+1,submitted_by=auth.uid(),submitted_at=now() where id=d.id returning * into d;
 end if;
 insert into public.espia_delivery_revisions(delivery_id,revision,payload,member_id,submitted_by) values(d.id,d.revision,d.payload,d.member_id,auth.uid());return d.id;
end $$;
update public.espia_deliveries d set status='validated' where d.challenge_id='territory' and d.status='gdf_pending' and d.teacher_score is not null and exists(select 1 from public.espia_reviews r where r.delivery_id=d.id and r.revision=d.revision and r.reviewer_role='teacher' and r.action='approve');
update public.espia_cases set title='Quadra esportiva',configuration='{"id": "court", "code": "3A", "campaign": "territory", "title": "Quadra esportiva", "question": "Podemos usar ou reservar a quadra da nossa comunidade na quarta-feira, das 17h às 18h?", "agency": "Administração Regional", "source": "Administração Regional • Carta de Serviços", "url": "https://www.df.gov.br/administracoes-regionais/", "tool": "orgao", "search": "Escolham a Administração Regional da comunidade e consultem sua Carta de Serviços: gestor, regras de uso e forma de confirmar o horário.", "initial": "Nossa equipe precisa descobrir como funciona a reserva e a utilização da quadra da comunidade na quarta-feira, das 17h às 18h.", "other": "Já joguei nessa quadra na quarta às 17h. Isso quer dizer que posso garantir o mesmo horário para o encontro da equipe na próxima semana?", "facts": ["A equipe quer usar a quadra pública na quarta-feira, das 17h às 18h.", "Precisamos verificar quem é o gestor, as regras de uso livre ou reserva e como confirmar o horário. Nem toda reserva pode ser feita online."], "limit": "Conhecer a regra de uso não confirma a disponibilidade do horário. Confiram com o gestor antes de combinar o encontro.", "record": "Chegou o momento da prática! Usem o que aprenderam para pesquisar a quadra da comunidade e registrem a ação que a equipe decidiu realizar.", "participation": "Se a informação já estiver publicada, consultem e compartilhem a orientação. Se faltar uma regra pública, avaliem um pedido de informação; para um reparo real, usem o canal do serviço ou a ouvidoria.", "channel": "lai", "warning": "", "art": "court"}'::jsonb where id='court';
update public.espia_activities set title='Nossa missão',prompt='A equipe quer usar a quadra na quarta-feira, das 17h às 18h. O que precisa descobrir antes de combinar o encontro?' where case_id='court' and kind='route';
update public.espia_activities set title='Conversar com a Administração Regional',prompt='Quem pode explicar as regras de uso e como confirmar o horário pretendido?' where case_id='court' and kind='agent';
update public.espia_activities set title='Verificar aviso de uso da quadra',prompt='O aviso da quadra confirma a disponibilidade da próxima quarta ou só apresenta o horário desejado pelo grupo?' where case_id='court' and kind='board';
update public.espia_activities set title='Conversar com o usuário da quadra',prompt='Uma pessoa já jogou nesse horário. Isso garante que a quadra estará disponível no próximo encontro?' where case_id='court' and kind='compare';
update public.espia_activities set title='Descobrir as regras da quadra',prompt='Queremos jogar na quarta às 17h. Onde descobrir quem cuida da quadra e quais são as regras para usar esse espaço?' where case_id='court' and kind='source';
update public.espia_activities set title='Conferir a descoberta',prompt='A fonte confirma uso livre, reserva ou outra regra? Conseguimos confirmar o horário ou a página não permitiu verificar?' where case_id='court' and kind='verify';
update public.espia_activities set title='Montar o plano da equipe',prompt='Como organizar o uso da quadra sem prometer um horário que ainda não foi confirmado?' where case_id='court' and kind='solution';
update public.espia_activities set title='Preparar o próximo passo',prompt='Falta conhecer uma regra de uso ou há um reparo real a solicitar? Escrevam o encaminhamento correspondente.' where case_id='court' and kind='channel';
update public.espia_activities set title='Ler o retorno sobre a quadra',prompt='A resposta informa a regra e a forma de confirmar disponibilidade? Continua faltando alguma confirmação para o encontro?' where case_id='court' and kind='response';
update public.espia_activities set title='Apresentar a descoberta',prompt='Que quadra ou regra real foi pesquisada e qual participação pertinente a equipe realizou, sem inventar uma reserva?' where case_id='court' and kind='final';
update public.espia_cases set title='Lixo e coleta seletiva',configuration='{"id": "waste", "code": "3B", "campaign": "territory", "title": "Lixo e coleta seletiva", "question": "Quando os resíduos são recolhidos e o que deve ser separado?", "agency": "SLU", "source": "SLU • Coleta DF e mapas", "url": "https://www.slu.df.gov.br/aplicativo-slu-coleta-df/", "tool": "orgao", "search": "Coletas convencional e seletiva, separação e cronograma de ponto público de referência.", "initial": "No ponto público fictício há sacos misturados e ninguém sabe o dia da coleta seletiva.", "other": "Eu vi um caminhão passando ontem, mas não sei se era coleta convencional ou seletiva. Como descubro o dia e a separação certa?", "facts": ["Cronograma fictício: convencional segunda, quarta e sexta; seletiva terça. Não é agenda de local real.", "Separe conforme a orientação oficial e consulte o tipo de coleta e cronograma para um ponto público.", "Despesa ou contrato revela finalidade, área atendida, período e valor; não comprova passagem do caminhão num endereço."], "limit": "Contrato não comprova coleta num ponto; diferenciar convencional e seletiva.", "record": "Tipo, cronograma, separação e próximo passo; em aprofundamento, finalidade, período e alcance financeiro.", "participation": "LAI para cronograma existente ausente; ouvidoria para falha real ou solicitação pertinente, com local e data.", "channel": "ouvidoria", "deep": "Busque despesa ou contrato de coleta no Portal da Transparência. Leia finalidade, área, período e valor sem inferir execução local.", "art": "waste"}'::jsonb where id='waste';
update public.espia_activities set title='Conhecer o problema • Lixo e coleta seletiva',prompt='Que dúvida sobre o lixo e a coleta neste ponto público a equipe vai investigar?' where case_id='waste' and kind='route';
update public.espia_activities set title='Ouvir orientação • Lixo e coleta seletiva',prompt='Como distinguir a coleta convencional da seletiva antes de procurar o cronograma?' where case_id='waste' and kind='agent';
update public.espia_activities set title='Abrir • Cronograma e separação de resíduos',prompt='No registro fictício, quais dias correspondem à coleta convencional e qual à seletiva? O que precisa ser separado?' where case_id='waste' and kind='board';
update public.espia_activities set title='Ouvir • Morador da Região Administrativa',prompt='O morador viu um caminhão ontem. Ele sabe qual tipo de coleta estava acontecendo?' where case_id='waste' and kind='compare';
update public.espia_activities set title='Descobrir os dias e tipos de coleta',prompt='Em que dias há coleta neste ponto público e como devemos separar os resíduos? Em qual página encontramos essa orientação?' where case_id='waste' and kind='source';
update public.espia_activities set title='Conferir a descoberta • Lixo e coleta seletiva',prompt='O cronograma encontrado se refere ao tipo de coleta e ao ponto que estamos investigando? Um contrato prova a passagem do caminhão aqui?' where case_id='waste' and kind='verify';
update public.espia_activities set title='Montar nosso plano • Lixo e coleta seletiva',prompt='Como a equipe orientaria a separação e o encaminhamento dos resíduos neste caso?' where case_id='waste' and kind='solution';
update public.espia_activities set title='Preparar o próximo passo • Lixo e coleta seletiva',prompt='A informação da coleta foi encontrada ou precisamos pedir um cronograma ou relatar uma falha real? Escrevam a necessidade com local público e data.' where case_id='waste' and kind='channel';
update public.espia_activities set title='Ler o retorno • Lixo e coleta seletiva',prompt='O retorno esclarece o tipo, o dia e a separação? O que ainda não sabemos sobre a coleta no ponto investigado?' where case_id='waste' and kind='response';
update public.espia_activities set title='Apresentar a descoberta • Lixo e coleta seletiva',prompt='Que informação real do SLU a equipe conferiu e qual orientação ou ação de separação e encaminhamento realizou?' where case_id='waste' and kind='final';
update public.espia_cases set title='Segurança e abordagem',configuration='{"id": "police", "code": "3C", "campaign": "territory", "title": "Segurança e abordagem", "question": "Como podemos acessar dados públicos sobre as abordagens policiais na nossa região?", "agency": "PMDF • divulgação dos relatórios", "source": "Dados Abertos DF • Relatórios mensais de produtividade da PMDF", "url": "https://www.dados.df.gov.br/dataset/relatorios-mensais-de-produtividade-de-2026-pmdf", "tool": "dadosabertos", "search": "Procurem um relatório mensal e confiram se há informação sobre abordagens, com definição, período e abrangência regional. Registrem somente o que estiver publicado.", "initial": "A comunidade quer entender o que os dados públicos mostram sobre as abordagens policiais na nossa região. A equipe vai pesquisar os relatórios e verificar quais informações estão disponíveis.", "other": "Vi uma publicação com números de atuação policial e achei que ela explicava todas as abordagens da nossa região. Como podemos conferir o que os dados realmente mostram?", "facts": ["Exercício fictício sem campos ou números atribuídos ao relatório real: escolha o indicador somente depois de abrir e ler o arquivo.", "Registre título, mês/ano, indicador, definição, unidade e abrangência. Comparar dois meses é opcional e exige recortes equivalentes.", "Produtividade policial não equivale ao total de crimes e não prova aumento ou redução da violência. Um PDF público não é necessariamente dado estruturado reutilizável."], "limit": "Dados de produtividade não representam todas as ocorrências nem uma situação em tempo real. Se não houver recorte de abordagens ou da região, reconheçam essa lacuna; não inventem números.", "record": "Título, mês/ano, indicador, definição, valor e unidade efetivamente encontrados; uma descoberta e uma pergunta sem resposta.", "participation": "LAI para informação existente necessária à compreensão e não localizada; ouvidoria para sugestão de divulgação. Não usar para registro policial.", "channel": "lai", "warning": "PENDÊNCIA CGDF: catálogo identificado; acesso ao arquivo na interface nova não concluído. Não inventar campos nem valores.", "art": "police"}'::jsonb where id='police';
update public.espia_activities set title='Conhecer o problema • Segurança e abordagem',prompt='O que queremos descobrir sobre as abordagens policiais na nossa região?' where case_id='police' and kind='route';
update public.espia_activities set title='Ouvir orientação • Segurança e abordagem',prompt='O que precisamos conferir antes de interpretar dados de atuação policial?' where case_id='police' and kind='agent';
update public.espia_activities set title='Abrir • Roteiro de leitura do relatório',prompt='Quais informações precisamos registrar sobre a fonte, o período, o indicador e a região?' where case_id='police' and kind='board';
update public.espia_activities set title='Ouvir • Leitor do relatório',prompt='O relato apresentado comprova o que acontece em todas as abordagens da região? Que dado precisamos consultar?' where case_id='police' and kind='compare';
update public.espia_activities set title='Pesquisar dados sobre segurança e abordagem',prompt='O relatório apresenta dados sobre abordagens e sobre a região escolhida? Indiquem o documento e o que ele permite conhecer.' where case_id='police' and kind='source';
update public.espia_activities set title='Conferir a descoberta • Segurança e abordagem',prompt='O indicador mede abordagens, atendimentos ou outra atividade? Qual é sua abrangência? Ele representa o total de crimes ou outra medida?' where case_id='police' and kind='verify';
update public.espia_activities set title='Montar nosso plano • Segurança e abordagem',prompt='Como vamos apresentar o que encontramos sobre segurança e abordagem, reconhecendo as informações que faltam?' where case_id='police' and kind='solution';
update public.espia_activities set title='Preparar o próximo passo • Segurança e abordagem',prompt='A consulta respondeu à pergunta ou falta uma informação pública existente? Preparem a conclusão ou o encaminhamento pertinente.' where case_id='police' and kind='channel';
update public.espia_activities set title='Ler o retorno • Segurança e abordagem',prompt='O retorno esclarece a definição do indicador e a abrangência regional? O que ainda falta saber?' where case_id='police' and kind='response';
update public.espia_activities set title='Apresentar a descoberta • Segurança e abordagem',prompt='Que fonte a equipe consultou e o que conseguiu descobrir sobre segurança e abordagem na região?' where case_id='police' and kind='final';
commit;

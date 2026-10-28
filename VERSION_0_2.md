# MISSÃO DF — versão 0.2

ENEDES + Controladoria-Geral do Distrito Federal. Demonstração educativa; não é quiz.

## Como testar

Use o mesmo navegador para equipe, professor e administrador. A demonstração mantém
registros em localStorage e imagens JPEG comprimidas em IndexedDB. Não há sincronização
entre aparelhos. Criar a mesma equipe em outro celular não transfere seus registros.

1. Na abertura, use **Jogar demo com som** ou crie uma equipe. Ative o som por um clique.
2. Escolha uma das quatro campanhas e aceite a missão. Distribua os papéis. Leia as quatro
   telas do tutorial; o botão **? TUTORIAL** permite reabrir.
3. Siga **O QUE FAZER AGORA**, o feixe e a seta com distância. Clique nos números das etapas
   para consultar instruções. Chegue perto do alvo e toque no botão grande ou use E.
4. Converse, observe, ouça outro relato e consulte as ferramentas. Escreva uma justificativa,
   uma hipótese e uma comparação de fontes. Registre solução própria e participação
   simulada. No Conselho da Cidade, apresente duas descobertas, uma dúvida e um pitch.
5. No celular do jogo, abra **Missões reais**. Cada campanha tem três atividades próprias e
   uma missão Multiplicador. Abra uma fonte oficial em outra aba, volte, escreva três
   respostas, anexe uma imagem, informe a data e confirme a revisão de privacidade.
6. Abra **Professor-mentor**, entre com e-mail/senha da equipe ou explore o painel local.
   Em **EVIDÊNCIAS REAIS**, veja imagem e interpretação, escreva uma devolutiva e peça ajuste.
   Volte à equipe, consulte a mensagem e reenvie. Aprove no painel: só então a missão
   recebe reputação e aparece como EVIDÊNCIA REAL no dossiê.
7. Complete **Multiplicador**, registre quantidade de participantes, imagem do material sem
   rostos e explicação. Após aprovação, o selo aparece na Central, no dossiê exportado e
   na visão do professor.
8. Use **Pedir ajuda ao professor** no HUD ou no celular. A fase e o objetivo acompanham
   a dúvida. Responda na fila AJUDA, com texto ou pista. A equipe recebe aviso e mensagem.
   Ajuda não desconta pontos. No detalhe de uma equipe, o mentor pode comentar, enviar
   pista, devolver/liberar uma etapa e validar a simulação com nota. Isso não aprova
   automaticamente as missões reais.
9. Procure duas pistas por cenário. O ◆ só aparece perto. Encostar abre título, passos,
   ferramenta, site oficial e acesso às atividades reais. Cada pista recompensa uma única vez.
10. Publique uma proposta no **Fórum da Cidade**. A aprovação prévia é padrão. No mentor,
    publique a proposta. Entre com outra equipe para apoiar uma vez e comentar. Autoapoio
    e apoio repetido são bloqueados. Comentários também passam pelo mentor. Ocultar e
    registrar encaminhamento externo ficam na moderação; o jogo não envia ao órgão.
11. Na entrega da cidade, **Publicar nossa solução** encaminha a proposta para moderação.
12. No ADMIN, consulte **Prática real e acompanhamento**. Edite links, missões, reputação,
    falas dos personagens, textos das pistas e guias. Consulte os gráficos e exporte a
    pesquisa em CSV/JSON. Os editores de campanhas e os relatórios anteriores permanecem.
13. A Central também abre diretamente com **#central** na URL, sem iniciar WebGL. Isso
    permite enviar pelo celular quando os registros daquela equipe existem no navegador.

## Cenários

- Mobilidade: terminal, superquadra, escola, obra/desvio, painéis e Administração Regional.
- Oportunidades: metrô, calçadão/mural, escola profissional, comércio e Agência do Trabalhador.
  O anúncio fictício pede PIX; a equipe confronta a promessa com documentos e fontes.
- Território: praça, caminhada, PEC, quadra, parquinho, horta e descarte. Um caminhão
  estaciona em área delimitada, inclina a caçamba e deixa entulho em um evento cíclico.
- Saúde: casas com caixas d'água, borracharia, pneus, UBS, escola e mercadinho, com chuva.

São setores temáticos distintos em uma cidade-base compartilhada, não quatro mapas
inteiramente independentes. Mantêm a arquitetura e o sistema de navegação existentes.

## Avaliação e recompensas

Preenchimento e tamanho de texto são apenas controles de envio. Não há avaliação automática
semântica de texto ou imagem. O mentor confere fonte/data, legibilidade, privacidade,
interpretação, limites e adequação da ferramenta. Pode solicitar quantos ajustes forem
necessários. A história de avaliações e a revisão do envio são preservadas.

A simulação da cidade pode ser concluída enquanto a prática real permanece pendente. A
interface distingue explicitamente essas situações. Cada atividade aprovada dá 120 pontos
por padrão (configurável); cada pista dá 30 uma única vez. Aprovar ou reenviar não duplica
pontos. A reputação real é somada ao ranking do desafio. Níveis: Novato, Observador,
Investigador, Analista de evidências, Agente de controle social e Referência na cidade.
Conquistas têm estética de medalha/HUD, com aviso e som. XP/reputação não substitui nota.

## Antes do uso nas escolas — validar com CGDF

- Links e página exata para cada turma: a navegação externa muda e não há garantia de
  disponibilidade contínua. O anúncio de uma vaga nunca é uma garantia de contratação.
- Nomes e competências dos órgãos, cartas de serviços e destinatários por demanda.
- Distinção contextual entre transparência ativa, acesso à informação e ouvidoria.
- Fluxos e terminologia do Participa DF; não exigir uma manifestação quando não há
  necessidade concreta. Envios ao GDF permanecem simulados nesta versão.
- Adequação por faixa etária, rubrica, critérios dos prêmios e regras do Multiplicador.
- Atividades de campo e orientação de um adulto; não entrar em terrenos, subir em telhados
  ou manusear resíduos perigosos. Não coletar endereços residenciais.
- Política de privacidade, base legal, retenção/exclusão, responsáveis pelo tratamento,
  acesso de mentores, proteção de menores e autorização ética quando aplicável à pesquisa.

Referências oficiais consultadas em 20/10/2026: DF no Ponto (pesquisa por linhas), Portal da
Transparência DF, Participa DF, GDF, Dados Abertos DF, InfoSaúde (painel dengue), Agência
Brasília (tópico Agências do Trabalhador) e Fiocruz (10 minutos contra o Aedes). Os endereços
ficam em `src/data/v02/missions.ts`, com substituição pelo ADMIN. A página antiga da Secretaria
de Trabalho não respondeu à consulta; por isso não foi adotada como endereço padrão de vagas.

## Persistência e produção

A demo permanece LOCAL conforme o escopo combinado. Não ativamos banco nem autenticação
real. Acesso local por PIN ou senha de equipe serve para explorar a ideia e não constitui
controle de acesso de produção. Não usar esta publicação para recolher dados reais de alunos.

Preparação adicionada:

- `supabase/v02-learning.sql`: tabelas de envios, sugestões, apoios únicos, comentários,
  ajuda, vínculo de usuários autenticados com equipes, bucket privado de JPEG e políticas RLS.
  Remove políticas anônimas permissivas do esquema antigo e protege views analíticas.
- `src/services/supabaseLearning.ts`: adaptador para upload, link assinado por 60 segundos,
  avaliação, fórum e ajuda. Não é chamado pela demo local.

Ainda é necessário configurar uma instância de homologação, substituir o login de equipe
legado por uma sessão autenticada/vínculo seguro, conectar o adaptador à interface, testar
RLS com contas de equipes/mentores diferentes e revisar retenção/auditoria. Não prometer
sincronização, upload privado em servidor ou RLS homologada antes dessa etapa.

## Pesquisa

Novos exports de pesquisa omitem nomes, e-mails, imagens e textos livres. Usam IDs
pseudônimos, eventos, duração ativa por fase, situação dos envios, revisões, pistas,
apoios e contagens. Pseudonimização não é anonimização. Trajeto é apenas coordenada do
cenário fictício; não há GPS. As exportações pedagógicas antigas continuam contendo
identificação e textos para o professor; não são o export de pesquisa.

## Validação técnica

`npm test` executa duas suítes headless:

- Fluxo das nove etapas nas quatro campanhas, movimentação com colisores Three.js,
  semáforos/faixas, intervenção, entrega, retomada e limpeza; hipóteses obrigatórias,
  participação escrita, pistas com proximidade/recompensa única, chuva, caminhão e
  comandos do professor chegando à equipe.
- 16 envios reais (quatro por campanha), privacidade obrigatória, persistência da imagem,
  pedido de ajuste/reenvio/aprovação, escopo do mentor, reputação sem duplicação,
  Multiplicador, ajuda sem punição, fórum/moderação/apoio único, validação de links e
  montagem das telas da Central, professor e administrador.

`npm run build` verifica TypeScript e gera a publicação. Compressão/IndexedDB são
exercitados com dublês de APIs nessas suítes. A revisão visual responsiva em navegador,
a reprodução audível em aparelhos reais e o teste com um Supabase de homologação ainda
precisam ser realizados. Portanto, estes resultados não equivalem a homologação completa
em navegador ou em produção.

## Demo visual alinhada ao storyboard (atualização de apresentação)

- Abertura ilustrada em petróleo, verde e âmbar; nova arte original de superquadra.
- Retratos ilustrados de Lia, Caio e técnica de mobilidade nos diálogos. Os NPCs
  continuam presentes no cenário 3D. Avatares têm geometria mais suave, olhos,
  sobrancelhas, cabelo cacheado e detalhes de mochila.
- Painéis claros, hierarquia de objetivos, ações âmbar/verde, minimapa dinâmico,
  câmera mais próxima e cenas 3D com vegetação mais detalhada.
- Barra DEMO: visão da equipe, missões reais, professor e administração. O botão
  numerado abre as 36 fichas do storyboard, com ação e condição de avanço. A visita
  às telas é registrada; o roteiro não pula tarefas nem aprova conteúdo.
- A abertura oferece continuar ou nova rodada quando já existe progresso da equipe
  fictícia. Reiniciar remove somente a missão de mobilidade daquela equipe demo;
  preserva outras equipes e outras campanhas.
- Formulário de evidência da equipe demo permite carregar uma imagem de AMOSTRA
  FICTÍCIA, explicitamente sem pesquisa real. A equipe ainda escreve suas respostas,
  confirma privacidade e envia. O mentor precisa pedir ajuste ou aprovar. O botão
  de amostra não aparece para equipes comuns.
- A trilha e os efeitos continuam sujeitos ao clique de ativação e ao controle de som.
- Os arquivos de arte e seus prompts resumidos estão em `public/art/ASSETS.md`.

Teste rápido: JOGAR DEMO -> avatares -> campanha 01 -> papéis -> tutorial 4 telas ->
cidade -> 9 etapas -> Missões reais -> amostra fictícia + respostas próprias ->
Professor (barra DEMO) -> pedir ajuste -> Equipe/Missões reais -> revisar e reenviar
-> Professor -> aprovar. Complete as outras três atividades para testar 4/4 e selo.

Limite visual: a abertura e os retratos usam as ilustrações aprovadas como direção
artística. A exploração é Three.js estilizado, com geometria procedural, não o mesmo
render das imagens do storyboard. Não foi feita homologação visual ou sonora em
navegador neste ambiente. Os testes automatizados verificam lógica, DOM simulado e
geometria Three.js, não fidelidade visual pixel a pixel.

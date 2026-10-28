# Cenários, pistas e encaminhamentos por caso

Os quatro desafios mantêm nove etapas, seis papéis fixos e as fontes registradas em `src/data/gdf/routes.ts`. A arte agora é selecionada pelo caso, e não somente pelo desafio. Cada um dos quinze casos possui quatro ambientes conectados (sessenta cenas). Não são quinze novos desafios.

`src/data/routeScenery.ts` define os nomes dos ambientes; `worldFor(campaign, routeId)` fornece a mesma arte, geometria e passagens ao jogo, mapa consultável, demo ilustrada e comemoração. As pistas das nove etapas usam esses nomes. O cabeçalho identifica o código e título do caso.

| Desafio | Casos e elementos visuais |
| --- | --- |
| Meu caminho pela cidade | Transporte: ônibus e parada; acessibilidade: calçadas e rampas; iluminação: luminárias ao entardecer; parque: entradas e planejamento da travessia. |
| Meu próximo passo | Emprego: orientação profissional; formação: computadores e oficinas digitais; remuneração: pesquisa de informações públicas; cargos vagos: orientação e pesquisa de carreiras. |
| Nosso lugar na cidade | Quadra: esporte e regras de uso; resíduos: separação, coleta e planejamento; PMDF: leitura de relatórios e indicadores. |
| Saúde no bairro | UBS: acesso aos serviços; vacinação: orientação de acesso; dengue: observação ambiental e prevenção; vigilância sanitária: lanchonete fictícia e orientação de fiscalização. |

As pistas e o formulário de proposta mostram o encaminhamento pertinente, a ferramenta e os limites do caso. A equipe constrói e justifica sua solução; o jogo não preenche uma resposta correta automaticamente. As informações visuais são fictícias. Horários atuais, inscrições, vagas, disponibilidade de quadra e indicadores reais continuam dependendo da consulta às fontes indicadas pelo GDF.

As artes não incorporam horários, estatísticas, acusações ou dados clínicos. O conteúdo legível e verificável permanece nos documentos do jogo. As pendências de acesso às fontes já identificadas no material continuam explícitas.

## Movimento e preservação do progresso

O piso caminhável exclui a arquitetura posterior e as bordas. O mapa físico da praça tem obstáculo e ponto de aproximação separados. Os pontos de pistas, objetivos, agentes e passagens permanecem alcançáveis. Ao carregar uma posição antiga incompatível com o novo piso, a equipe reaparece na entrada do mesmo ambiente, sem perder entregas, papéis, notas ou respostas.

Os identificadores de tarefas, as chaves de armazenamento e as regras de nota não mudaram. Envio permite continuar o revezamento; professor e GDF avaliam em paralelo. A pontuação oficial continua dependendo da validação do GDF.

## Produção da arte

Quinze atlas originais criados com a ferramenta integrada de geração de imagens, um por caso, convertidos para WebP em `public/art/cases/`. Cada atlas contém quatro painéis: praça, alameda, orientação em campo e sala de planejamento. Os prompts completos estão em `public/art/cases/PROMPTS.md`.

## Validação concluída

- `npm run build` e `npm test` passaram.
- Arte: quinze arquivos diferentes por hash, sessenta painéis distintos.
- Geometria: pistas das 135 combinações caso/etapa e objetivos acessíveis; passagens e retornos alcançáveis; mapa físico não atravessável e aproximação livre.
- Conteúdo e fluxo: quinze casos, nove etapas, seis papéis; três fontes por consulta; revezamento sem esperar a nota; fórum e dupla avaliação preservados.
- Navegador: transporte (chegada e mapa), formação digital (agente, fala e formulário de interpretação), resíduos (pista, mapa e travessia efetiva para a alameda), UBS (proposta, limites e ferramenta específica).
- A demonstração, as miniaturas e a comemoração consomem o mesmo cadastro de cenas da exploração.

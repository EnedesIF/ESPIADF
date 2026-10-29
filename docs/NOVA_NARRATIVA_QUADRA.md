# A quadra é pública. Mas quem pode usar?

Revisão baseada no PDF Espia_DF_Desafio_3_Quadra_Esportiva_Revisao_Nova_Narrativa.pdf, recebido em 29/10/2026. Esta narrativa substitui a proposta de conseguir reserva. Os outros dois casos do cenário 3 permanecem com suas particularidades.

## Situação e percurso

O conflito é fictício: jovens querem jogar numa quadra pública de Águas Claras na quarta-feira, às 17h, e outro grupo alega prioridade. A investigação verifica o que sustenta a alegação; não cria reserva, agenda, autorização nem disponibilidade confirmada.

| Etapa | Papel / exemplo da demo | Registro |
| --- | --- | --- |
| 1 | Repórter / Ravi | Dúvida principal, recuperada da reunião; foco de investigação. |
| 2 | Repórter / Ravi | Conversa com a Administração e identificação da fonte; transparência ativa. |
| 3 | Campo / Ana Clara | Consulta real à norma: link, data, trecho relevante ou imagem e interpretação. |
| 4 | Verificação / Luiza | O que a fala do frequentador comprova e o que ainda exige confirmação. |
| 5 | Dados / Davi | Duas verificações: fonte/regra/eventual autorização e limites do que foi comprovado. |
| 6 | Articulação / Sofia | Fatos, dúvidas, fonte, próximo passo e responsáveis. |
| 7 | Articulação / Sofia | Consulta suficiente, LAI ou ouvidoria; justificativa e conclusão/minuta conforme a opção. |
| 8 | Participação / Kauã | Análise da resposta explicitamente simulada. |
| 9 | Participação / Kauã | Norma/link/data, informação confirmada, lacuna e orientação à comunidade; uma síntese do trabalho da equipe. |

São nove etapas e dez registros, pois Davi realiza duas verificações na etapa 5. O professor avalia cada registro de 0 a 100; a média das duas notas de Davi compõe a nota da etapa 5. O máximo continua em 900 pontos, sem duplicação.

## Interface e evidências

- Título e apoio em Águas Claras nas opções do caso; sem códigos de referência como 3A.
- SINJ-DF e Administração de Águas Claras são as fontes pertinentes. SLU e Brasília Ambiental foram retirados das alternativas desta investigação.
- Não existe botão para agendar ou reservar. A norma geral e uma autorização específica são evidências diferentes.
- Se a autorização não foi localizada ou verificada, a equipe registra a lacuna. Não encontrar um documento não comprova que ele não existe.
- Trecho da norma ou imagem: não é necessário capturar uma tela fictícia do jogo. A evidência visual é opcional quando há registro textual da fonte.
- O final recupera os registros anteriores. Há um único campo de síntese da equipe; não são exigidos seis textos novos.
- Participação externa é opcional. Se não houve participação, não há data, protocolo ou comprovante obrigatórios. Se for registrada, exige revisão anterior do professor e evidência da ação efetiva.
- O fórum continua acessível e suas questões precisam ser respondidas coletivamente. A avaliação escolar do cenário 3 continua a cargo do professor.
- Instruções, demonstração concluída, nomes dos locais e indicadores de etapa acompanham a nova sequência.

## Histórico e banco

A nova narrativa usa identificadores próprios de progresso e entregas. Os registros da história anterior permanecem guardados e não liberam etapas nem duplicam pontos da nova investigação. Uma pergunta antiga sobre reserva não é carregada automaticamente como objetivo da narrativa nova. Equipes reais mantêm seus papéis e avatares.

A migração 005 acompanha catálogo, validação de campos e média por etapa. Ela depende de 001–004. Se houver percurso antigo da quadra no banco, interrompe a operação sem alterar as etapas ou apagar entregas: essa conversão precisa de planejamento separado. O banco remoto não foi alterado. A integração do cliente com Supabase continua pendente; os testes atuais do jogo usam dados do navegador.

## Fontes e limites da conferência

A fonte principal indicada no PDF está acessível no SINJ:
https://www.sinj.df.gov.br/sinj/Norma/698986606f294f7bb6cf57fd89c308cd/Ordem_de_Servi_o_30_05_06_2025.html

O texto trata dos espaços sob gestão da Administração de Águas Claras e diferencia uso comunitário de atividades autorizadas. A leitura da norma geral não comprova autorização para um grupo, uma quadra ou um horário específicos.

Não foi localizada uma programação pública específica para a quadra do exercício. A consulta ao site de apoio da Administração não permitiu comprovar essa programação. A confirmação formal da vigência atual e da abrangência para um equipamento real escolhido ainda precisa ser feita com o órgão antes do piloto. O jogo mantém esses pontos como objeto de verificação; não certifica vigência nem autorização.

Apoios:
https://www.aguasclaras.df.gov.br/
https://www.participa.df.gov.br/

## Verificação

Compilação TypeScript/Vite e testes de regressão aprovados. Teste específico: sequência 1–9 com seis papéis, duas notas na etapa 5 sem duplicação, conclusão sem imagem quando há trecho, ausência de participação obrigatória, bloqueio de ação externa sem revisão e preservação do histórico antigo. Com as notas 60 e 100 na etapa 5 e 100 nas demais, a pontuação fica em 880/900.

PostgreSQL local: migrações reaplicadas, registros de norma sem imagem aceitos, final sem prova externa aceito, média da etapa 5 correta e proteção para percursos antigos confirmada. Não executado no Supabase remoto.

O pacote de atualização inclui também as revisões anteriores de Saúde e do cenário 3. Para publicar: extrair, enviar o conteúdo à raiz do GitHub preservando pastas, confirmar o commit e aguardar Ready na Vercel.

Navegador: 150 atividades em cada um dos tamanhos 360x740, 390x844, 844x390 e 768x1024 aprovadas, incluindo as três opções de encaminhamento da nova quadra. Não substitui teste de toque/câmera em aparelho físico.

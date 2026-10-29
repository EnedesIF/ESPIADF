# ESPIA DF — revisão GDF do cenário 1

Implementação de 29/10/2026, baseada em “Espia DF - revisão cenário 1 completo.pdf” (226 páginas).

## Escopo

As quatro rotas de Meu caminho pela cidade: 1A Transporte, 1B Acessibilidade da calçada, 1C Iluminação e 1D Parque no percurso. Permanecem quatro desafios, quinze situações, nove etapas, seis papéis e dez registros (duas contribuições na etapa 2). As regras detalhadas de pesquisa e participação foram revistas no cenário 1; não foram impostas aos demais desafios sem revisão equivalente.

## Alterações implementadas

| Pedido | Implementação |
| --- | --- |
| Linguagem direta e perguntas sem repetição | Perguntas e falas específicas por rota; um campo por pergunta; instruções técnicas retiradas da tarefa. |
| Controle social e transparência | Sete conceitos com os textos fornecidos pelo GDF: controle social na reunião; transparência ativa na pesquisa; transparência passiva, LAI e pedido junto à escolha de LAI; ouvidoria na opção correspondente; controle social na prática na conclusão. |
| Escolha antes do demo | O modo jogável apresenta as quatro rotas. As demonstrações de cada rota usam registros independentes; voltar às rotas não apaga outra investigação. |
| Pergunta preservada | A reunião recupera a pergunta escolhida e permite editá-la. O retorno ao jogo não a substitui automaticamente. |
| Papéis definidos no cadastro | A reunião confere os seis responsáveis, sem oferecer remanejamento. A validação rejeita uma atribuição diferente do cadastro. |
| Avatar, nome e papel | Cartões e personalização usam o ID do integrante. A reunião apresenta os avatares para conferência; não houve redistribuição visual por inferência a partir do nome. |
| Mapas sem antecipação das respostas | Quatro locais com descrições curtas; sem comandos técnicos sobre fechar mapas ou conexões. |
| Mural de transporte | Registro na Praça do ponto de ônibus e título acessível pelo objetivo; DEMO-214 identificada como fictícia. A pesquisa oficial pede linhas reais. |
| Fontes pertinentes | Uma fonte principal pertinente por rota; retirada de alternativas sem relação com a pergunta no cenário 1. Acesso não é tratado como comprovação do conteúdo. |
| Pesquisa no percurso | Fonte, data, imagem e interpretação na etapa 4; hipótese duplicada retirada. Indisponibilidade pode ser relatada, sem inventar dados. |
| Endereços sem protocolo | Aceita domínio e www., normaliza para HTTPS e verifica protocolo e domínio reconhecido. Pertinência continua sujeita à análise do professor. Preserva o endereço digitado no registro. |
| Evidência única | Captura ou envio na mesma área; após salvar, exibe Evidência salva e Trocar evidência. Registros fictícios não são classificados como pesquisa real. |
| Etapa 7 condicional | Consulta suficiente, LAI, ouvidoria ou canal do serviço. Um único campo muda conforme a opção. Não exige pedido externo para uma consulta suficiente. |
| Participação externa pertinente | Minuta para revisão do professor. Data e comprovante externos só aparecem se a equipe registrar participação efetiva, após a revisão cabível. O jogo não envia solicitações. |
| Etapa 9 sem retrabalho | Recupera fonte, data, imagem, interpretação, decisão e contribuições já registradas. Permite conferência e complementação; não pede seis textos novos. |
| Passagem do bastão | Confirmação breve e uma ação de continuidade. Retirados os botões de professor/GDF e o segundo modal de confirmação no percurso. |
| Contraste e metadados | Registro do estudante em painel claro; respostas com quebra de linha. IDs, tipos internos e depuração ocultos da visão do estudante. |
| Parque | Quadro do Parque Horizonte separado da consulta real; tabela estática de horários reais retirada e substituída por link oficial. |
| Calçada | Impacto sobre pedestres em geral e impacto adicional sobre mobilidade reduzida. Não atribui automaticamente responsabilidade à Novacap/Administração. |
| Iluminação | Portal Ilumina DF como canal de manutenção e fonte oficial sobre atendimento da CEB IPes. Não pressupõe QR Code ou número de poste obrigatório. Retirados avisos de automação da tela do aluno. |
| Encerramento | Envios concluídos e avaliações pendentes têm texto próprio. Missão validada só depois das nove etapas confirmadas; pontuação continua 0–100 por etapa, média da etapa 2 e máximo 900. |
| Missões reais duplicadas | No cenário 1, a área da equipe mostra Registros e resultados das etapas 4/7/9; não abre outros formulários obrigatórios após o percurso. Multiplicador é complementar. |
| Nomenclatura | Saúde na nossa Região Administrativa; referências a Região Administrativa/local; Vigilância sanitária renumerada 4D, mantendo o ID sanitary e os registros existentes. |
| Banco | Migração 002 atualiza catálogo e validação das entregas, sem apagar notas, equipes ou histórico nem alterar RLS. |

## Verificação

- Compilação TypeScript/Vite e suíte completa de testes aprovadas.
- Fluxo das quatro rotas revisadas: pesquisa na etapa 4; decisão na 7; consolidação na 9; sem participação externa forçada; revezamento antes da nota; confirmação professor → GDF.
- Testes de navegador: 360×740, 390×844, 844×390 e 768×1024. Quinze casos e dez registros por caso em cada tamanho; diálogos e formulários dentro da tela; botões sem sobreposição; campos da etapa 7 condicionados à escolha; reunião, mapa e área da equipe conferidos.
- PostgreSQL local: criação original e migração aplicadas duas vezes; isolamento, papéis, pontuação e dupla validação preservados; fonte sem protocolo normalizada; fonte inadequada/evidência ausente rejeitadas; final sem prova externa quando não houve envio.

## Fontes de serviço conferidas em 29/10/2026

- DF no Ponto: https://dfnoponto.semob.df.gov.br/pesquisa-por-linhas/
- Novacap: https://novacap.df.gov.br/pt/vias-urbanas
- Portal Ilumina DF: https://brasilia.cidadeiluminada.com.br/
- Informação oficial CEB IPes/Agência Brasília: https://www.agenciabrasilia.df.gov.br/w/ceb-ipes-realiza-21-mil-atendimentos-de-manutencao-em-90-dias
- Horários reais dos parques: https://www.ibram.df.gov.br/horario-de-funcionamento-dos-parques-ecologicos-do-df/

A orientação oficial informa 155, Ilumina DF e canais da companhia; a consulta da interface dinâmica não foi usada para abrir um chamado. Campos obrigatórios, alternativa de localização e acompanhamento continuam sendo objeto da pesquisa da equipe. Nenhum QR Code ou identificador foi declarado obrigatório sem confirmação.

## Pontos que ainda dependem de conferência

- Aparência aprovada de cada um dos seis personagens: o PDF relata trocas, mas não fornece um cadastro visual aprovado separado e inequívoco. A associação por ID foi preservada e os cartões permitem conferência; é necessário confrontar o resultado com a referência aprovada, sem inferir a aparência pelo nome.
- Toque, teclado e câmera em aparelhos reais após a publicação.
- Integração do cliente com Supabase: esta etapa já estava pendente e não é concluída pela migração de catálogo. O banco criado não significa que o jogo já sincroniza equipes e entregas entre dispositivos.

## Publicação

O pacote acompanha os arquivos atualizados nos caminhos do projeto. Não foi enviado ao GitHub nem publicado automaticamente. Enviar os arquivos ao repositório correto e aguardar a Vercel ficar Ready. Aplicar a migração 002 no SQL Editor somente ao projeto que já recebeu a estrutura 001. Ela não foi aplicada ao banco remoto nesta sessão.

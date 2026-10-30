# Saúde na Região Administrativa — revisão de 30/10/2026

## Materiais recebidos e preservados

- Espia DF - Cenário 4 - Vacinação.pdf: revisão tela a tela implementada.
- Espia DF - Cenário 4 - Vigilância sanitária.pdf: revisão tela a tela implementada.
- Vídeos de 17h12min36s e 17h12min41s: inspecionados para os cortes e fragmentos nos personagens.
- A revisão anterior da UBS foi preservada. Dengue recebeu ajustes gerais de formulários, conceitos, consolidação e acesso aos registros; não foi presumida uma nova revisão de dengue não anexada.

## Conteúdo e fluxo

As quatro rotas permanecem no cenário Saúde na Região Administrativa. Nove etapas, seis responsáveis e critérios de avaliação preservados. Rótulos antigos de bairro foram atualizados nos caminhos ativos e no modo de cidade legado.

Vacinação: aviso gráfico verossímil marcado DOCUMENTO FICTÍCIO, sem atribuição indevida à SES. Um percurso principal. Pesquisa na etapa 4 com nome da fonte, URL, data e orientação efetivamente encontrada. A avaliação clínica individual permanece com o serviço de saúde; não se pedem cartões nem dados médicos. A etapa 7 mostra campos condicionais e conceitos conforme o canal. Se a consulta foi suficiente, a etapa 8 revisa a publicação e não inventa resposta de órgão. A conclusão reaproveita a pesquisa e a verificação; imagem opcional, sem seis contribuições repetidas ou manifestação externa obrigatória.

Vigilância sanitária: observação não é tratada como infração. A equipe descreve os fatos da lanchonete fictícia, consulta atribuições e canais da Vigilância Sanitária e redige conclusão ou minuta para o professor. A etapa 4 aponta a Carta de Serviços da DIVISA e a página da Vigilância Sanitária, sem opções de vacinação ou vigilância ambiental. A etapa 9 consolida fonte, data, descoberta, canal e justificativa, limites e conclusão; a URL é evidência válida, sem upload obrigatório. Não exige denúncia nem LAI real.

Transparência ativa, LAI, pedido de acesso, transparência passiva, ouvidoria e controle social aparecem junto às ações correspondentes. “Ver minha resposta” e outros elementos expansíveis ganharam fundo escuro, texto claro, borda e foco de teclado visível.

UBS e dengue usam o mesmo caminho integrado de registros reais da jornada, sem formulários soltos de parque. Dengue passa a usar os formulários consolidados com pesquisa e evidência, mantendo sua narrativa específica e os limites sobre foco, causalidade e indicadores regionais.

## Avatares

O desenho completo de frente/costas permanece visível durante o deslocamento, sem trocar para os recortes articulados que produziam fragmentos. A caminhada usa uma animação discreta do corpo inteiro; não é uma marcha com articulação independente de pernas. Corrida, salto, comemoração, nomes, roupas, cores e acessórios permanecem. Os arquivos de arte e os registros existentes dos participantes foram preservados.

## Imagens de abertura

Novo arquivo public/art/espia-opening-gdf-v32.webp. Ilustração gerada com imagegen a partir da abertura existente, preservando estudantes, paleta e estilo. O panorama destaca uma representação do Palácio do Buriti e seu anexo, Torre de TV, Mané Garrincha e áreas verdes e lago do Parque da Cidade. Congresso e Catedral foram retirados desta imagem de abertura. Trata-se de composição artística, não mapa geográfico. Outras imagens de cenários não foram todas recriadas.

Prompt usado: preservar a ilustração 3D colorida e os três estudantes com mochilas; substituir Congresso e Catedral por Buriti, Torre de TV, Mané Garrincha e Parque da Cidade; manter céu e espaço para interface. Na revisão, corrigir o Buriti para fachada retangular com brises verticais em bronze, pilares retos e anexo, evitando as formas do Planalto/Alvorada.

## Fontes e limite de verificação

A fonte de vacinação escolhida é a Carta de Serviços ao Cidadão da SES-DF; o conteúdo recuperado trata da ausência do cartão. A página de vacinação de rotina complementa com locais e horários. A Carta da DIVISA contém atribuições e referência aos núcleos de inspeção. Conteúdo público foi verificado por pesquisa e abertura das fontes oficiais.

Na consulta HTTP automatizada, a Busca Saúde UBS e o painel de dengue responderam 200; endereços do domínio saude.df.gov.br devolveram 503. Uma abertura no navegador remoto da página de vacinação também apresentou timeout de conexão. Isso não comprova indisponibilidade para o estudante. Não foi declarado que todos os destinos externos abriram neste navegador; a revisão das fontes no ambiente dos estudantes continua necessária. O jogo permite registrar informação não localizada, sem inventar orientação.

## Verificação do código

- Suíte de regressão dos 15 casos e 150 registros.
- Teste específico das duas rotas: URL/data/consulta obrigatórias, consolidação sem upload ou envio externo obrigatórios, seis papéis e pontuação após avaliação professor/GDF.
- Verificação de layout de 150 atividades em quatro tamanhos (600 formulários), incluindo campos condicionais de canal.
- Inspeção visual dos 18 avatares de frente e de costas; ausência dos recortes de tronco/pernas no DOM. Personalização e persistência verificadas pela suíte.
- Build TypeScript/Vite.

Os testes não substituem 150 percursos manuais completos nem comprovam sincronização entre dispositivos. Progresso e entregas seguem locais no navegador; a integração desses registros com o Supabase continua pendente. Nenhuma solicitação foi enviada a órgão público e nenhum SQL remoto foi executado.

## Publicação

Atualização cumulativa sobre o pacote de lixo e avatares de 29/10, preservando as revisões de quadra, território, UBS e cenário 1. Extraia o ZIP e substitua os arquivos correspondentes na raiz de EnedesIF/ESPIADF, incluindo package.json e a nova imagem em public/art. Preserve os outros arquivos. A publicação depende do commit e do deploy da Vercel; este pacote não foi enviado automaticamente ao GitHub.

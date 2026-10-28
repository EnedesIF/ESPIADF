# DF EM JOGO — desafios dentro da cidade

ENEDES: desenvolvedora do game. Governo do Distrito Federal / CGDF: responsável pela missão. Marcas oficiais fornecidas pela usuária.

O grupo escolhe livremente um dos quatro desafios do PDF oficial: Mobilidade — Meu caminho pela cidade; Trabalho e oportunidades — Meu próximo passo; Espaços públicos e meio ambiente — Nosso lugar na cidade; Saúde e prevenção — Saúde no bairro. Não é necessário concluir todos os desafios em sequência.

Aceitar o desafio abre imediatamente a cidade 3D. O avatar se move com WASD/setas ou clique no chão; clicar em personagem/objeto faz caminhar até ele e interagir ao chegar. A* contorna paredes e construções. Arrastar gira a câmera; roda do mouse aproxima/afasta. Tecla E ou botão de proximidade interage. C: celular, J: dossiê, M: mapa de pontos caminháveis.

Fases no cenário: conversar com personagem → investigar objeto/fotografar → encontrar especialista e cruzar fontes no celular → escrever solução da equipe e aplicar intervenção visual → preparar participação simulada com mentoria de campo → receber resposta no celular e voltar ao personagem → registrar duas descobertas e uma dúvida → revisar e entregar ao mentor. As fontes, datas e histórico são reunidos no dossiê; solução exportável em JSON. O grupo pode continuar explorando após concluir.

Objetos e ações: painel de ônibus com itinerários na parada; mural de oportunidades da escola; área de convivência e resíduos; recipiente descoberto próximo à UBS. Intervenções aparecem como painel informativo, ponto de descarte ou cobertura do recipiente. Essas alterações representam propostas no game, sem execução real de serviços públicos.

Cada desafio tem um recorte fictício completo para demonstração, baseado na estrutura pedagógica oficial. O ambiente é um bairro fictício inspirado no DF. Não equivale a realizar uma pesquisa sobre um local ou programa real. Todos os dados internos, personagens, documentos, protocolos e respostas são simulados. Os portais reais estão acessíveis por links separados; nenhum pedido real é enviado.

Ferramentas pertinentes ao caso aparecem no celular durante a investigação: Portal do GDF, sites dos órgãos, Transparência DF, Dados Abertos DF, Participa DF, DF no Ponto e Infosaúde. O diretório do celular também oferece o canal da Neoenergia. Iluminação pública não é automaticamente atribuída à distribuidora de energia. O repertório de ferramentas é selecionado conforme o caso; não há exigência indiscriminada de abrir todos os canais.

Som ambiente e efeitos procedurais originais, iniciados após gesto do usuário; volume e silêncio persistidos. A aba suspende áudio em segundo plano. Não há narração gravada.

Dados salvos neste navegador: avatar, posição, fase, fontes, proposta, descobertas, dúvida e entrega. Painel do mentor usa o mesmo armazenamento local; compartilhe o dossiê exportado para outro dispositivo. Sincronização remota exige configuração do backend existente.

Verificação: TypeScript, build Vite e testes com a geometria e colisores reais da cidade em execução sem renderização. Nas quatro missões foram verificados caminhada por A*, proximidade, objetos, fontes, registro da solução, intervenção 3D, protocolo fictício, resposta, revisão, entrega, retomada e limpeza da cena entre partidas. Não houve teste visual de renderização, escuta ou desempenho em navegador real neste ambiente.

Executar: npm install; npm run dev. Build: npm run build. Servir a pasta dist. O módulo de cidade original permanece no código; a entrada principal utiliza CityMission.


## Atualização de identidade e interação

Nome na abertura: DF EM JOGO. O GDF é apresentado pelo brasão do arquivo fornecido, exibido com recorte de enquadramento em CSS para não mostrar o nome da CGDF na tela inicial. A ENEDES fica no canto inferior direito, identificada como desenvolvedora. O arquivo original da marca permanece intacto.

A demo e o primeiro acesso da equipe levam ao estúdio de avatares 3D antes da seleção do desafio. É possível personalizar os integrantes, escolher o avatar que entra e revezar o controle pelo botão Avatares no cenário.

Os quatro desafios ocupam distritos decorados em 3D de maneira distinta: terminal, campus de oportunidades, praça de convivência e bairro com UBS. São setores temáticos do mesmo mundo-base, não quatro mapas independentes.

Durante a investigação, o grupo escolhe as ferramentas no celular e registra por que elas podem ajudar. A ordem de consulta é livre. Um canal sem informação pertinente apresenta seu limite; a equipe pode reavaliar. O avanço depende das evidências necessárias ao caso, não da visita indiscriminada a todos os portais. As escolhas e justificativas acompanham a entrega.

Os avisos no mundo mudam com a proximidade: longe mostram o objetivo e a distância; perto mostram a ação disponível. O painel da parada abre a consulta digital à linha DEMO-214, com horários e mapa esquemático do itinerário. O painel pode ser consultado novamente após a coleta.

Verificação adicional em execução sem renderização: caminhos nos distritos decorados, escolha livre de ferramenta, retorno de canal não pertinente, painel de ônibus, configuração e gravação do avatar e entrada pelo estúdio. Conferência visual em navegador real continua pendente neste ambiente.


## Clareza das etapas e leitura

O objetivo persistente mostra número da etapa, nome, ação concreta, destino e distância. Ao chegar, o botão passa de deslocamento para a interação disponível. “O que faço agora?” abre um guia com nove etapas, concluídas/atual/pendentes e a ação imediata. No mundo, apenas o rótulo do objetivo atual é destacado; um indicador de destino aparece quando o alvo sai da câmera.

A escolha de ferramentas mostra as perguntas do caso ainda sem evidência e marca cada uma após a coleta. Há intenções rápidas que preenchem a justificativa, evitando digitação repetitiva. A seleção da ferramenta continua com o grupo.

As placas 3D medem o texto e reduzem a fonte para caber na largura útil. Botões e painéis permitem quebra de linha; tabelas e rótulos também. Os agentes de saúde no cenário usam calça escura, casaco azul, boné, colete de alta visibilidade, faixas e identificação “VIGILÂNCIA”. Uniformes ilustrativos do game, sem reproduzir distintivos oficiais.

Verificação adicional: cálculo de encaixe do texto nas placas, existência do guia de etapas e perguntas pendentes, uniformes dos personagens de saúde e percurso completo das quatro missões. Ainda sem conferência visual de renderização no navegador real.

## Trânsito, fases e conquistas

Faixas e semáforos coordenam a avenida. O deslocamento automático busca travessias; pedestres aguardam o verde e veículos param nos sinais e diante do avatar. São regras simplificadas de simulação. Cada desafio tem nove fases: relato, observação, segunda pessoa, fontes, verificação em outro local, solução, participação, impacto e entrega. Os novos pontos ficam no mesmo distrito temático. A intervenção aparece no mundo e o resultado é explicitamente fictício.

Tarefas e evidências concedem XP uma única vez por identificador, com aviso, nível, histórico no dossiê e medalha na entrega. O progresso fica salvo localmente.

## Escolhas e cooperação

As três intervenções de cada desafio têm benefícios, limites, reação do personagem e próximo passo próprios. Informação, acesso e cuidado são índices ilustrativos fixos do jogo (0–100), sem previsão de impacto real. Há prévia antes da aplicação, elementos 3D distintos, resultado na fase de impacto e registro na entrega/exportação. Na praça, apenas a opção de descarte limpa os resíduos da demonstração. Um canal inadequado mantém pendência explícita; a proposta visual não se torna serviço realizado.

Quatro papéis podem ser distribuídos entre integrantes: campo, escuta, evidências e articulação. A mesma pessoa pode acumular papéis. O objetivo indica o responsável; a interação pede revezamento e troca o avatar no local. Cada etapa concluída registra integrante e papel no dossiê e entrega. Configuração e contribuições persistem por desafio. Trata-se de cooperação local no mesmo dispositivo, sem multiplayer simultâneo. Missões antigas concluídas não recebem contribuições retroativas.

Verificados em execução sem renderização: quatro percursos completos, nove atribuições de etapa, revezamento com quatro integrantes, resultados e geometria distintos, limpeza seletiva, preservação da pontuação e gravação/retomada. Conferência visual em navegador real permanece pendente.

## Instruções e painéis de acompanhamento

No hub e no botão Instruções da cidade, cada equipe consulta controles, nove etapas, tarefa atual, papéis, finalidade de cada ferramenta, XP, entrega e devolutiva. O jogo mantém a tela de instruções sem avançar uma etapa.

A entrada Professor-mentor abre o novo painel das missões 3D: busca e filtros, progresso, fontes e justificativas, solução, descobertas, dúvida, histórico e contribuições por integrante. A rubrica tem quatro critérios de 0 a 4, com comentário e parecer, separados do XP. A validação exige a entrega da missão. O grupo lê a devolutiva em Instruções.

Admin abre por padrão o dashboard da cidade após o PIN existente. KPIs e barras coloridas usam dados gravados pelas missões, com recortes por desafio/situação, etapas, ferramentas, papéis, escolas e intervenções. O botão Ver exemplo de turma apresenta quatro equipes fictícias em um modo ilustrativo separado. Esse modo não grava atividades nem avaliações e não permite exportar dados de exemplo; o usuário pode voltar aos registros jogados. Os editores anteriores continuam nas abas próprias; eles editam o conteúdo legado e não o catálogo estático das missões 3D.

A demo publicada usa dados locais: a lista dos painéis é atualizada a cada 5 segundos neste navegador. O detalhe selecionado não é refeito automaticamente para preservar avaliações em edição. Equipes de outro dispositivo exportam o relatório JSON; professor/admin o importam para consolidar. Os arquivos têm formato/versão, validação completa antes de gravar e deduplicação por equipe/desafio. Relatórios importados têm origem e data explícitas; não há sincronização online entre computadores. O pacote contém nomes e registros pedagógicos, sem senhas/hashes. Pode-se exportar CSV do desempenho e JSON com devolutiva, que a equipe importa em Instruções.

Professor: acesso local por e-mail e senha de equipe ou exploração explícita da demo local. Admin: botão Explorar dashboard da demo ou PIN padrão de demonstração enedes-admin. Esses acessos no navegador não constituem controle de segurança de produção. Os pareceres destes painéis são separados da validação do sistema legado. A persistência do progresso 3D é local mesmo se o repositório legado estiver configurado com Supabase.

Verificação sem renderização: quatro missões, atualização de progresso, instruções, painéis, avaliação, importação inválida sem gravação parcial, escopo do professor, deduplicação e ausência de credenciais no relatório. Conferência visual em navegador real permanece pendente.

## Acessos visíveis e competição

A abertura tem três botões destacados: Grupos (login), Professor (acompanhamento) e Administração (dashboard). A entrada do grupo abre login/senha; as outras entradas levam aos respectivos painéis. O cadastro e a demo continuam disponíveis.

Ganhos de XP aparecem sobre o avatar, com animação de subida, destaque no placar e cartão da conquista. Avanços de nível e ultrapassagens geram celebração visual e som, respeitando preferência por movimento reduzido. O ranking fica visível no cenário e abre a classificação completa. Compara apenas o mesmo desafio, preserva empates na mesma posição e indica XP necessário para ultrapassar a próxima equipe. A classificação é de progresso, separada da rubrica pedagógica.

O botão de competição simulada acrescenta três rivais de pontuação fixa, marcados como fictícios, sem gravar atividades nem afetar dashboards. Pode ser desligado. As equipes registradas/importadas neste navegador entram no ranking pelo XP atual; conexão entre dispositivos fica para a etapa de banco de dados. O ranking é atualizado a cada 3 segundos no cenário e a cada recompensa. Em telas menores, a versão compacta abre o painel completo por clique. Não há classificação online global nesta demo.

Verificados sem renderização: quatro percursos completos, ganho e deduplicação de XP, eventos visuais de pontuação, ranking ordenado, identificação de rivais fictícios e três entradas principais de acesso. Conferência visual em navegador real permanece pendente.

## Áudio e limite de equipes

A trilha original em loop agora usa arquivo WAV local com batida, baixo e melodia, somada a ambiente de cidade sintetizado. Os efeitos Web Audio diferenciam cliques, evidências, sucesso, alerta, passos, fotografia, mensagem e fase. A reprodução é iniciada por gesto; a abertura oferece Ativar trilha do game e Jogar demo com som. O controle fixo tem volume, silenciar/ativar, teste audível e estado real de reprodução. O texto não informa som ligado antes de iniciar a mídia. Há recuperação de reprodução bloqueada, reativação explícita após volume zero e pausa ao ocultar a página. Não inclui vozes gravadas dos personagens.

Cada desafio admite até três equipes registradas/reservadas neste navegador. A vaga é verificada novamente na entrada da missão, além da indicação no hub. O quarto grupo recebe o pop-up Escolha outro desafio com alternativas disponíveis; retomar a própria missão não duplica vaga. A reserva persiste localmente. Rivais fictícios do ranking não contam para a ocupação. Registros antigos/importados são preservados e contam no total; se ultrapassarem três, nenhuma nova equipe é admitida naquele desafio. A sincronização da lotação entre dispositivos depende da futura integração com banco de dados. Navegadores com Web Locks serializam as reservas entre abas; demais navegadores usam a verificação local síncrona.

Testes adicionais: áudio com dois loops, oito efeitos, desbloqueio por gesto, estado do controle, silenciar, visibilidade e recuperação; WAVs com sinal não silencioso e sem clipping; três admissões, bloqueio da quarta equipe, retomada sem duplicação, vaga em outro desafio e pop-up de entrada. Verificação auditiva/visual em navegador real permanece pendente.

## Contexto das opções e navegação

Os atalhos de intenção e as descrições das ferramentas agora derivam dos registros e perguntas de cada desafio, com marcação de fontes já consultadas. Canais sem conteúdo pertinente propõem verificar sua adequação; o Participa diferencia intenção de obter registros e intenção de sugerir melhoria. As opções de participação explicam o objeto de cada canal para a situação atual. A revisão mostra a consequência da intervenção efetivamente escolhida.

No cenário há Voltar (fecha o painel ou retorna às missões) e Sair do jogo (retorna à abertura e salva). Os painéis exibem Voltar à cidade e o login dos grupos tem Voltar à abertura. A saída mantém o cadastro e o progresso para continuação.

## Direção visual inspirada no convite

A primeira aplicação está no distrito de mobilidade: escola com fachada e identificação, edifícios com acabamento e janelas, jardins e árvores volumosas, cobertura colorida com painéis solares no terminal e skyline estilizado inspirado em Brasília. A câmera inicial abre a vista para o novo setor. A geometria estática é agrupada por material, com menos de 30 grupos de material adicionais. Não houve medição de FPS no navegador.

Marcador 3D de estrela flutuante e trilha dourada substituem a linha direta na mobilidade. A trilha acompanha os pontos do percurso calculado, com limite de 80 marcas instanciadas. A interface desta missão usa azul profundo, verde, dourado e cantos arredondados. Os avatares de todas as missões receberam volumes arredondados, cabeça suave e pequenos detalhes no rosto; permanecem personagens procedurais leves, não modelos de produção equivalentes ao render do convite.

Os quatro percursos foram verificados com os novos colisores, limpeza de cena, retomada e persistência. Os outros distritos mantêm sua direção visual anterior nesta primeira aplicação. A conferência visual em navegador real continua pendente.

## Atualização 0.2

Consulte `VERSION_0_2.md` para o roteiro de teste, funcionalidades, resultados dos testes e
limites. A prática real exige imagem, interpretação da equipe e aprovação do mentor.
A cidade-base e a persistência local continuam; Supabase de produção não foi ativado.

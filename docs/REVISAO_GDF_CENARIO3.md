# Revisão GDF — Nosso lugar na cidade

Base: Revisao Espia DF Cenário 3 - rota PMDF.pdf, enviado em 29/10/2026. Apesar do nome do arquivo, o texto revisa principalmente Quadra esportiva e a abertura do desafio, incluindo a nova apresentação da situação PMDF.

## Alterações

- A situação da PMDF passa a se chamar Segurança e abordagem, com a pergunta proposta sobre dados públicos das abordagens na região. Relatórios mensais aparecem como fonte, não como título do caso. A investigação verifica se o recorte de abordagem/região existe; não inventa indicadores ou números.
- Administração Regional • Carta de Serviços substitui a referência fixa ao Plano Piloto. O link leva ao diretório oficial das Administrações Regionais: a equipe escolhe a da comunidade e procura sua Carta de Serviços. A regra de reserva não é presumida nem se anuncia agenda online.
- Na quadra, o objetivo da reunião é reaproveitado na primeira etapa. Continua existindo registro da etapa 1, mas sem pedir a mesma justificativa em outra caixa de texto.
- Tarefas e locais recebem títulos curtos; Praça, Administração Regional e Sala de planejamento correspondem aos locais do percurso.
- As nove pistas da quadra são dicas curtas, sem cópia do mapa ou do documento inteiro. O mapa permanece disponível em botão próprio.
- Bilhetes como PENDÊNCIA CGDF e falha na revisão foram removidos da configuração usada no jogo. Avisos educativos sobre a natureza da história/retorno ficam em ajuda retrátil, sem afirmar que uma reserva real foi autorizada.
- A orientação junto à Administração varia conforme a atividade, em vez de repetir a introdução. O plano usa campos diretos; a proposta de encaminhamento usa um único texto.
- Papéis permanecem os definidos no cadastro. Na área da equipe, tarefas são resumidas e o histórico de etapas fica recolhido.
- O final da quadra usa a confirmação de pesquisa real pedida no documento. Na opção de consulta suficiente, a evidência da pesquisa pode documentar essa participação, sem exigir outra imagem ou protocolo externo artificial.
- Na demonstração, o elenco predefinido foi corrigido: Ana Clara, Luiza e Sofia usam os visuais femininos configurados; Davi, Kauã e Ravi usam os masculinos configurados. Demonstradores antigos ainda na configuração inicial são atualizados. As escolhas explícitas dos jogadores e os avatares de equipes reais não são sobrescritos.

## Mudança de avaliação

O PDF determina que o GDF não corrija as tarefas escolares internas. A regra implementada no cenário Nosso lugar na cidade é: professor avalia de 0 a 100 e confirma a pontuação; pode pedir ajuste ao estudante. Não há confirmação adicional do GDF para essas entregas. As três situações do cenário 3 seguem a mesma política.

As questões do fórum mantêm seu fluxo próprio; o GDF ainda publica os temas. Os outros três desafios mantêm a dupla validação anterior, pois esta revisão é do cenário 3. Os painéis, ranking, cartões e demonstração distinguem essas regras.

Notas do cenário 3 já atribuídas pelo professor que aguardavam confirmação do GDF passam a contar sem alterar o valor ou apagar o histórico. Entregas sem avaliação continuam pendentes. A média das duas contribuições da etapa 2 preserva o máximo de 900 pontos por desafio.

## Conferência

- Compilação TypeScript/Vite aprovada.
- Suíte completa e teste específico de avaliação das três situações do cenário 3 aprovados: pontuação confirmada pelo professor, restrição ao professor responsável, impossibilidade de reavaliação pelo GDF, preservação do fórum e das regras dos outros desafios, manutenção de notas anteriores.
- Elenco padrão da demonstração conferido; escolha explícita de avatar preservada.
- Navegador: 150 atividades em cada um dos tamanhos 360x740, 390x844, 844x390 e 768x1024, com diálogos, formulários, reunião, mapa e área da equipe dentro da tela.
- PostgreSQL local: migrações aplicadas duas vezes, permissões/isolamento preservados, nota do professor refletida no ranking do cenário 3 e alterações indevidas bloqueadas.

Fontes oficiais conferidas:
https://www.df.gov.br/administracoes-regionais/
https://www.dados.df.gov.br/dataset/relatorios-mensais-de-produtividade-de-2026-pmdf
O catálogo descreve produtividade; a equipe precisa abrir o documento e verificar quais dados e abrangências estão realmente disponíveis.

## Publicação e limitações

Este pacote inclui também a atualização anterior de Saúde e a remoção dos códigos de referência das telas. Preservar as pastas ao enviar para a raiz do GitHub, confirmar o commit e aguardar Ready na Vercel.

A migração 004 acompanha as regras e o catálogo do cenário 3. Ela depende da estrutura 001 e das migrações 002/003; não foi executada no Supabase remoto. O código ainda precisa da integração do cliente com Supabase para autenticação e sincronização entre dispositivos; publicar estes arquivos ou aplicar SQL não conclui essa integração. Toque/câmera ainda precisam de conferência em aparelhos físicos.

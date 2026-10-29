# Revisão GDF — Saúde / Acesso à UBS

Base: Missão — Saúde (1).pdf, enviado em 29/10/2026. As alterações específicas deste documento se concentram em Acesso à UBS; não reescrevem as outras três situações de Saúde como se fossem UBS.

- Códigos como 1A e 4B retirados da interface dos quatro desafios, mapas, placas, demonstração, área da equipe e cabeçalhos. Identificadores internos permanecem estáveis para preservar o progresso.
- Pergunta inicial preservada, mapa com descrições breves, papéis definidos no cadastro e seis participantes no revezamento.
- Diálogo da SES-DF, pistas, interpretação do usuário do serviço, pesquisa, plano e análise do retorno revistos. Localização não significa atendimento imediato.
- Mantidas três ferramentas de Saúde para comparação: Vigilância Ambiental, Busca Saúde UBS e locais de vacinação. Só a seleção pertinente libera o registro da fonte.
- Fonte efetivamente utilizada, data e evidência de pesquisa real registradas na etapa 4. Removida hipótese duplicada. Print do jogo identificado como fictício.
- Avisos junto aos campos para não incluir dados pessoais, endereço residencial ou informações clínicas. Não há pedido de cartão de saúde ou de história clínica.
- Etapa 7 distingue consulta suficiente, informação pública por LAI, manifestação na ouvidoria e canal próprio do serviço. Não exige contato com órgãos para concluir. Dúvidas clínicas seguem para os canais de saúde.
- Etapa 9 recupera os registros das etapas anteriores, permite complementação e inclui lista de conferência. Comprovante externo só é solicitado quando houve participação efetiva.
- Obrigatoriedade sinalizada; rascunhos preservados durante a digitação e ao voltar ao percurso. Erros não apagam o texto. Envios confirmados antes da passagem do bastão.
- Botões de professor/GDF retirados das tarefas do estudante; os perfis de demonstração separados continuam disponíveis na demonstração completa.
- Retorno identificado como fictício e sem representar comunicação oficial da SES-DF. Conclusão do percurso é diferente de validação das entregas.

## Conferência

Compilação aprovada; suíte completa aprovada; teste específico das quatro rotas de mobilidade e da UBS aprovado, incluindo revezamento antes da avaliação e pontuação de até 900 após professor/GDF. Formulários e diálogos conferidos em 360x740, 390x844, 844x390 e 768x1024. Não substitui teste de câmera/toque em aparelhos físicos.

Fonte oficial conferida: https://info.saude.df.gov.br/busca-saude-ubs/
A página permite consultar a UBS e informações de serviços. A atividade usa uma referência pública como exercício; não determina a UBS de referência residencial do estudante.

## Publicação e banco

Enviar os arquivos do pacote à raiz do repositório ESPIADF, preservando as pastas. Confirmar o commit e aguardar o deploy da Vercel ficar Ready. Não foi publicado automaticamente.
A migração 003 acompanha a revisão de catálogo/validação da UBS e foi aplicada duas vezes em PostgreSQL local para verificar compatibilidade. Ela depende de 001 e 002, não apaga equipes ou notas e não foi executada no Supabase remoto. A integração do cliente com Supabase permanece pendente.

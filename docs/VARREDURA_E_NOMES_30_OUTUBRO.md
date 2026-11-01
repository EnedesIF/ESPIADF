# Varredura de publicação e correção dos nomes — 30/10/2026

## Evidências de publicação

Commit conferido: 6baea81, Add files via upload, 30/10/2026 às 19h11 (Brasília).
Comparação com ESPIA_DF_Saude_Visual_e_Avatares_30_10.zip: 85 arquivos idênticos, nenhum ausente e nove diferentes. Esses nove conservam trechos de versões anteriores:

- src/ui/demo/CartoonAvatar.ts
- src/ui/demo/CartoonCity.ts
- src/ui/demo/CityResidents.ts
- src/ui/demo/TalkingPortrait.ts
- src/ui/game/Phone.ts
- src/ui/screens/MissionBriefing.ts
- src/ui/v02/LearningUI.ts
- src/worlds/CampaignLife.ts
- src/worlds/CityDistrict.ts

O site publicado respondeu HTTP 200 e carregou /assets/index-D5XivyvD.js. Esse bundle não contém a classe avatar-continuous da correção da silhueta inteira e ainda contém o rótulo antigo Participante. Portanto, o problema não se resolve apenas aguardando o mesmo deploy: os arquivos precisam ser corrigidos no repositório.

## Correção entregue

O nome escolhido, como Biano, passa a ser o identificador visível na personalização, nas abas, na área da equipe, nos recibos e no revezamento. Telas de cidade legadas também usam o nome escolhido e a configuração de visual. A comemoração usa esse nome, inclusive na descrição acessível.

O nome do cadastro permanece armazenado e disponível ao professor/GDF para atribuir as avaliações corretamente. Identificadores, papéis e progresso não são renomeados nem apagados. As entregas registram participante e personagem como campos separados. A síntese da quadra também usa o nome do avatar.

## Verificações realizadas

- Reprodução no navegador: Luiza → Biano; salvar; retornar à etapa 3; conferir Biano no HUD; reabrir personalização e conferir a persistência.
- Teste de regressão: nome escolhido visível, nome do cadastro preservado administrativamente, configuração por participante, duplicatas bloqueadas, reentrada e progresso intactos.
- Suíte completa local dos 15 casos e 150 registros passou após a correção.
- Build TypeScript/Vite passou. Bundle local final: index-Zssiii_c.js.

## Limites e pendências

A varredura identificou uma publicação com arquivos misturados e o erro de identificação visual; o pacote corrige ambos. Não significa que todas as 150 atividades foram jogadas manualmente no site publicado. A versão corrigida deste pacote ainda não foi enviada ao GitHub.

Progresso e entregas continuam gravados no navegador (localStorage/IndexedDB). A sincronização desses registros pelo Supabase entre celulares e painéis ainda não está concluída. Não foi afirmado que aluno → professor → GDF em dispositivos separados funciona em produção. Links da SES também tiveram limitações de acesso no ambiente de teste, documentadas no pacote anterior.

## Instalação

Esta é uma correção direcionada sobre o commit 6baea81, com apenas os arquivos diferentes e o teste de reprodução. Extraia o ZIP e envie todo o conteúdo à raiz de EnedesIF/ESPIADF, preservando os caminhos. Substitua os arquivos de mesmo nome; não apague o restante do repositório. Confirme o commit e aguarde o novo deploy automático. Não é necessário reenviar o pacote grande para esta correção.

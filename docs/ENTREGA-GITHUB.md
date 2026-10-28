# ESPIA DF — pacote para GitHub

Este pacote contém o código TypeScript, imagens, avatares, estilos, testes, scripts, documentação, SQL disponível e arquivos de dependências. A compilação estática é gerada na pasta `dist` pelo comando `npm run build`.

## Executar

Use Node.js 22 ou superior e npm.

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

Para publicar em hospedagem estática, use o conteúdo de `dist`. Para desenvolvimento, edite `src` e mantenha `public`. Não é necessário enviar `node_modules` ao GitHub.

## Alterações desta entrega

- Pistas protegidas contra a área de ativação das passagens; botão Pista conduz à pista atual sem teletransporte.
- A conversa com a agente conduz à pista obrigatória quando ela ainda não foi registrada.
- Seleção de desafio lotado apresenta o aviso existente, sem retorno silencioso.
- Ranking acessível na seleção dos desafios e no percurso. Mostra nomes das equipes, notas confirmadas pelo GDF, etapas validadas e envios; filtra por desafio e preserva empates. Não mostra nomes dos alunos, contatos, respostas ou imagens.
- Corrida alternável; salto e comemoração visuais. Pulos não atravessam colisões nem completam tarefas.

## Limites importantes para a próxima implementação

As entregas, notas, fórum e progresso do percurso continuam locais no navegador. O ranking não reúne automaticamente computadores diferentes. Configurar apenas as variáveis do Supabase não migra os serviços locais de avaliação e progresso: a integração completa desses serviços, as permissões de professor/GDF/equipe e a persistência compartilhada ainda precisam ser implementadas.

O arquivo `.env.example` contém somente exemplos. Este ZIP não inclui credenciais, histórico Git, dados de participantes, sessões de teste ou arquivos de acesso à hospedagem atual. O destino GitHub não fica associado ao Site atual automaticamente.

Os quatro desafios mantêm nove etapas, seis papéis fixos e avaliações de professor e GDF. Cada desafio vale até 900 pontos oficiais; o ranking geral soma os quatro (até 3.600). Fórum e XP não entram nessa soma.

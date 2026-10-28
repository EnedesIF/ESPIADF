# ESPIA DF — ENEDES / IFB e CGDF

Jogo educativo de investigação cidadã para equipes do ensino médio. São quatro desafios, quinze casos, nove etapas e seis papéis fixos. A estética atual usa cenários ilustrados conectados por caminhos e passagens.

## Executar

Requisitos: Node.js 22+ e npm.

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

O build estático fica em `dist`. Publique essa pasta na hospedagem escolhida. O ZIP de código não inclui dependências instaladas nem o histórico Git.

## Jogar e avaliar

O professor cadastra a equipe e os papéis. Cada integrante escolhe seu nome de avatar e aparência. A equipe escolhe um caso e alterna os responsáveis pelas tarefas. O envio permite continuar sem aguardar a avaliação. O professor avalia e o GDF confirma notas de 0 a 100, até 900 por desafio.

No percurso, use **Mapa**, **Pista**, **Ranking** e **Entrega / bastão**. O controle pode ser movido ou ocultado; agora inclui correr, pular e comemorar. Pulos e comemorações são efeitos visuais e não substituem entregas.

O ranking apresenta resultados agregados por equipe e por desafio, usando apenas notas confirmadas pelo GDF.

## Persistência e próximo passo

O percurso, as avaliações e o fórum usam armazenamento local no navegador. As equipes de computadores diferentes ainda não compartilham esses dados. É necessária a integração completa com banco e permissões de produção. As variáveis de exemplo de Supabase não concluem essa integração sozinhas.

Leia [a entrega para GitHub](docs/ENTREGA-GITHUB.md) para detalhes, limites e composição do pacote. Documentação de protótipos antigos permanece em `docs`, inclusive o README anterior; ela não descreve necessariamente a interface atual.

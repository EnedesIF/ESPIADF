# MISSÃO DF — vertical slice

Game web de investigação cidadã para o Ensino Médio. **ENEDES + Controladoria-Geral do Distrito Federal (CGDF).**

A cidade é o tabuleiro: o estudante explora um bairro 3D inspirado no DF, conversa com personagens que trazem relatos, percepções e boatos, registra evidências, testa hipóteses, consulta ferramentas públicas (simuladas dentro do jogo, com link para o site oficial), descobre quem pode agir, aciona um canal de participação, monta uma proposta e a defende no Conselho da Cidade.

> Todos os números, documentos, horários e respostas de órgãos exibidos no jogo são **DADOS SIMULADOS PARA DEMONSTRAÇÃO** e aparecem marcados assim. A linha "0.214" e a "Quadra 214" são fictícias.

---

## Instalar e executar

Requisitos: Node.js 18+ (testado com Node 22).

```bash
npm install
npm run dev        # desenvolvimento em http://localhost:5173
npm run build      # gera /dist (estático — pode ir para qualquer hospedagem)
npm run preview    # serve o /dist localmente
```

Sem configuração extra o jogo roda em **MODO LOCAL**: equipes, sessões e telemetria ficam salvos no navegador (localStorage). Para testar rápido, use **JOGAR DEMONSTRAÇÃO** na abertura.

Acessos de demonstração (modo local):

| Área | Como entrar |
|---|---|
| Equipe demo | botão "Jogar demonstração" (senha da equipe: `demo1234`) |
| Professor-mentor | link "Professor-mentor" → `mentor@demo.local` / `demo1234` |
| Admin | link "Admin" → PIN `enedes-admin` (troque em `VITE_ADMIN_PIN`) |

O painel do mentor pode ser aberto em outra aba do mesmo navegador enquanto a equipe joga: pistas, devoluções e validações chegam ao celular do jogo em poucos segundos.

## Onde inserir a logo oficial da ENEDES

Substitua `public/brand/enedes-logo.svg` pelo arquivo oficial **com o mesmo nome** (ou aponte outro arquivo em `src/config.ts → BRAND.enedesLogo`, ex.: `./brand/enedes-oficial.png`). O mesmo vale para `public/brand/cgdf-logo.svg`. O jogo exibe o arquivo como está — não redesenha a marca.

## Onde configurar o Supabase

1. Crie o projeto no Supabase e rode `supabase/schema.sql` no SQL Editor (tabelas, função `team_login`, RLS e visões analíticas).
2. Copie `.env.example` para `.env.local` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
3. `npm run build`. Com as variáveis presentes, o app passa a usar `src/services/supabaseRepository.ts` automaticamente (o SDK só é baixado nesse caso).
4. Crie um bucket privado `missao-df-media` no Storage (reservado para fotos/arquivos de pitch).
5. Para administradores, insira o usuário na tabela `profiles` com `role = 'admin'`.

> O repositório Supabase foi escrito contra o mesmo contrato do modo local (`src/services/repository.ts`), mas **ainda não foi validado contra uma instância real**. Teste o fluxo completo e revise as políticas RLS antes de produção — em especial a gravação de sessões pelo cliente anônimo, que em produção deve passar por uma Edge Function com token da equipe.

## Arquitetura

**Vite + TypeScript + Three.js puro** (sem React no jogo). Motivo: um único contexto WebGL, bundle pequeno e controle total do laço de jogo — importante para notebook escolar. A interface é DOM leve sobre o canvas, sem framework.

```
src/
  main.ts                 entrada
  config.ts               marca, Supabase, parâmetros de jogo
  types/                  modelo de domínio (serializável → Supabase JSONB)
  data/                   conteúdo: campanhas, papéis, ferramentas, órgãos, RAs, avatar
    campaigns/mobility.ts   Campanha 01 completa (NPCs, diálogos, evidências, eventos, ferramentas)
    campaigns/stubs.ts      Campanhas 02–04 (conteúdo-base, EM PRODUÇÃO)
  game/                   Game Engine: Engine (render/loop/qualidade), CameraRig, Input, EventBus, Settings, GameScene
  worlds/                 CityWorld (bairro 3D), layout (planta compartilhada), texturas procedurais
  entities/               Avatar (low-poly), Player, NPC, Vehicle (ônibus, trânsito)
  systems/                Mission Engine, Dialogue, Evidence, Dossier (hipóteses), PublicTools,
                          Team (papéis), WorldEvents (relógio/eventos), Messages, Reputation,
                          MentorSync, Telemetry, GameContext
  ui/                     App (telas), screens/ (abertura, cadastro, avatar, hub, mentor, admin),
                          game/ (HUD, celular, dossiê, laboratório, conselho, encerramento)
  components/             modal, painel de acessibilidade
  services/               repository (contrato), localRepository, supabaseRepository, backend, demo
supabase/schema.sql       banco, RLS e visões para dashboard analítico
public/brand/             logos (substituir pelos oficiais)
```

## O que já está funcional

- Abertura cinematográfica com a cidade 3D à noite ao fundo, marcas ENEDES + CGDF configuráveis, ENTRAR NA MISSÃO / FORMAR NOVA EQUIPE / demonstração.
- Login da equipe; cadastro em 4 etapas (equipe com escola, RA e turma; professor-mentor; até 10 estudantes com papel; senha) com login e ID gerados.
- 8 papéis com tarefas complementares verificadas automaticamente e revezamento de controle ("Passar o controle").
- Criador de avatar 3D low-poly (corpo, pele, cabelo, roupa, calça/bermuda/saia, tênis, mochila, acessórios) para cada integrante.
- Central de Missões com as quatro campanhas (01 jogável; 02–04 marcadas como EM PRODUÇÃO).
- Mundo 3D real (Three.js): superquadras sobre pilotis (dá para passar por baixo), eixo viário, ipês e cerrado, parada de concreto, obra com desvio, Centro de Ensino, Administração Regional, UBS, comércio; ônibus e carros circulando; chuva; colisão; câmera em terceira pessoa com órbita/zoom; WASD/setas, clique/toque para andar.
- **Campanha 01 — Meu caminho pela cidade, jogável do início ao fim:** relógio 06:56 → "chegue até 07:30", ônibus lotado passando direto, dois ônibus chegando juntos, embarque e viagem pelo desvio, chegada (atrasada ou não), 9 NPCs com diálogos ramificados, 8 pontos de observação, 26 evidências possíveis, 5 hipóteses, 5 cruzamentos de fonte, eventos dinâmicos e mensagens.
- Celular com Mapa (deslocamento rápido após a chegada), Dossiê, Missões, Equipe, Mensagens, Câmera e 8 ferramentas públicas: DF no Ponto (horários + rastreamento ao vivo dos ônibus do jogo), Participa DF (ouvidoria ou LAI, órgão, texto, anexos, protocolo e resposta simulada que chega depois), Transparência DF, Dados Abertos DF, Portal do GDF (órgãos e competências), InfoSaúde, Portal Dengue e SISDIA. Ferramenta errada simplesmente não tem a informação — sem quiz.
- Dossiê visual: cartões arrastáveis, conexões APOIA/CONTRADIZ desenhadas, linha do raciocínio (hipótese → evidência → contradição → nova hipótese), alerta de HIPÓTESE EM REVISÃO e recompensa por mudar de ideia diante das evidências.
- Reputação da equipe com histórico (sobe com boas práticas; cai pouco com conclusão incompatível, boato não verificado ou dado importante ignorado).
- Laboratório de Soluções (9 módulos interativos), Conselho da Cidade (slides gerados do dossiê, cronômetro, indicadores, mapa) e relatório de encerramento.
- Painel do professor-mentor: equipes, progresso, evidências, fontes, hipóteses e alterações, solução, pitch, trajeto percorrido; ações LIBERAR ETAPA, DEVOLVER, ENVIAR PISTA, COMENTAR, VALIDAR (com nota).
- Área ADMIN: editar campanhas, falas de NPCs, sugestões das ferramentas, pontuação por tipo de evidência, JSON avançado (fases, eventos, evidências, respostas), equipes e analytics com exportação CSV/JSON.
- Telemetria para pesquisa com IDs pseudônimos: escolhas, falas, posições (a cada 3 s), fontes e buscas, tempo por fase, evidências, hipóteses e revisões, manifestações, solução e pitch.
- Acessibilidade: tamanho de texto, reduzir movimento, alto contraste, legendas de eventos, teclado (E, F, C, J, M, 1–9, Esc), marcadores por forma + texto (não só cor), qualidade gráfica automática/leve.

## O que falta para produção

- Validar o modo Supabase contra uma instância real; trocar a gravação anônima de sessões por Edge Function com token de equipe; login individual de estudante, se desejado.
- Jogabilidade completa das Campanhas 02, 03 e 04 (cenários, NPCs, evidências e ferramentas).
- Multijogador em tempo real (hoje a equipe joga em um dispositivo e reveza o controle).
- Validação, pela CGDF e pelos órgãos citados, das descrições de competência e dos fluxos do Participa DF usados no jogo.
- Política de privacidade, termos de consentimento/assentimento (estudantes menores de idade, LGPD) e aprovação ética se os dados forem usados em pesquisa.
- Áudio (trilha, efeitos, narração) e legendas correspondentes; auditoria formal de acessibilidade com leitor de tela.
- Testes automatizados e teste de desempenho nos notebooks reais das escolas.
- Hospedagem das fontes tipográficas localmente para uso offline.

## Melhoria 2026-10 — briefing cinematográfico

A Central de Missões agora abre um briefing operacional antes de entrar no mundo 3D. A tela apresenta inteligência inicial, perguntas ainda não resolvidas, composição da equipe e regra de campo, reforçando a linguagem de game investigativo sem transformar a experiência em quiz.

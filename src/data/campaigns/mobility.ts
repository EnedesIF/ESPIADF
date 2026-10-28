import type { CampaignDef } from '@/types';
import { L } from '@/worlds/layout';

/* =====================================================================
   CAMPANHA 01 — MEU CAMINHO PELA CIDADE  (totalmente jogável)
   Cenário FICTÍCIO inspirado no DF. Linha "0.214", "Quadra 214" e todos os
   números exibidos nas ferramentas são DADOS SIMULADOS PARA DEMONSTRAÇÃO.
   Nenhum NPC indica certo/errado: cada fala tem uma natureza (relato,
   percepção, ouvi dizer, pista) e o jogador decide o que verificar.
   ===================================================================== */

const SIM = 'DADO SIMULADO PARA DEMONSTRAÇÃO';

export const mobility: CampaignDef = {
  id: 'mobility',
  number: '01',
  axis: 'MOBILIDADE',
  title: 'MEU CAMINHO PELA CIDADE',
  pitch: 'Transporte, acessibilidade, iluminação ou parque: escolha sua rota e planeje o caminho.',
  available: true,
  briefing: 'Nas últimas semanas, estudantes da Quadra 214 têm chegado atrasados ao Centro de Ensino. Cada um tem uma explicação. Descubra o que está acontecendo.',
  startClock: '06:56',

  phases: [
    {
      id: 'rotina', title: 'A ROTINA', completeWhen: 'all', next: 'investigacao',
      objectives: [
        { id: 'o_parada', text: 'Chegue à Parada 214', done: { type: 'flag', flag: 'at_parada' } },
        { id: 'o_escola', text: 'Chegue ao Centro de Ensino até 07:30', done: { type: 'flag', flag: 'arrived_school' },
          hint: 'A passagem de pedestres está fechada. Talvez o único caminho seja o ônibus.' }
      ]
    },
    {
      id: 'investigacao', title: 'INVESTIGAÇÃO', completeWhen: 'all', next: 'laboratorio',
      objectives: [
        { id: 'o_ev', text: 'Reúna 6 evidências no dossiê', done: { type: 'evidenceCount', min: 6 } },
        { id: 'o_tipos', text: 'Use 4 tipos de fonte diferentes', done: { type: 'evidenceKinds', min: 4 },
          hint: 'Observação, relato, dado público, documento, resposta oficial...' },
        { id: 'o_hip', text: 'Defina uma hipótese ativa no dossiê', done: { type: 'hasHypothesis' } },
        { id: 'o_org', text: 'Descubra quem pode agir', done: { type: 'agency', min: 1 },
          hint: 'O Portal do GDF lista órgãos e o que cada um faz.' },
        { id: 'o_part', text: 'Acione um canal de participação', done: { type: 'participation', min: 1 } }
      ]
    },
    {
      id: 'laboratorio', title: 'LABORATÓRIO DE SOLUÇÕES', completeWhen: 'all', next: 'conselho',
      objectives: [{ id: 'o_lab', text: 'Monte a proposta da equipe', done: { type: 'flag', flag: 'solution_ready' } }]
    },
    {
      id: 'conselho', title: 'CONSELHO DA CIDADE', completeWhen: 'all', next: 'encerrada',
      objectives: [{ id: 'o_pitch', text: 'Apresente a solução ao Conselho', done: { type: 'flag', flag: 'pitch_done' } }]
    },
    { id: 'encerrada', title: 'MISSÃO ENCERRADA', completeWhen: 'manual', objectives: [] }
  ],

  /* ---------------- HIPÓTESES POSSÍVEIS ---------------- */
  hypotheses: [
    { id: 'h_nunca', text: 'O ônibus simplesmente não passa.' },
    { id: 'h_lotado', text: 'Os ônibus já chegam lotados.' },
    { id: 'h_poucos', text: 'Reduziram a quantidade de ônibus da linha.' },
    { id: 'h_acabar', text: 'A linha vai acabar.' },
    { id: 'h_desvio', text: 'A obra na via desviou os ônibus e bagunçou os intervalos.' }
  ],
  bestCause: ['h_desvio'],
  expectedAgencies: ['semob', 'novacap'],

  /* ---------------- EVIDÊNCIAS ---------------- */
  evidences: [
    // campo
    { id: 'e_fila', kind: 'campo', title: 'Fila longa na Parada 214', source: 'Observação da equipe',
      summary: 'Antes das 07:10 a parada já estava cheia, principalmente de estudantes.', supports: ['h_lotado'] },
    { id: 'e_lotado', kind: 'campo', title: 'Ônibus passou lotado sem parar', source: 'Registro com a câmera',
      summary: 'Um ônibus da 0.214 passou direto pela parada, cheio.', supports: ['h_lotado'], contradicts: ['h_nunca'] },
    { id: 'e_comboio', kind: 'campo', title: 'Dois ônibus chegaram juntos', source: 'Registro com a câmera',
      summary: 'Depois de uma longa espera, dois ônibus da mesma linha chegaram quase ao mesmo tempo.',
      supports: ['h_desvio'], contradicts: ['h_nunca'] },
    { id: 'e_obra', kind: 'campo', title: 'Placa de obra e desvio', source: 'Registro com a câmera',
      summary: 'Placa na via principal: "OBRA — DESVIO DE LINHAS PELA VIA DA QUADRA 300". Sem data de término.',
      supports: ['h_desvio'] },
    { id: 'e_passagem', kind: 'campo', title: 'Passagem de pedestres interditada', source: 'Registro com a câmera',
      summary: 'A travessia a pé entre o bairro e a área central está fechada pela obra.', supports: ['h_desvio'] },
    { id: 'e_quadro', kind: 'campo', title: 'Itinerário afixado desatualizado', source: 'Registro com a câmera',
      summary: 'O quadro da parada do Centro de Ensino mostra o trajeto antigo, sem o desvio.', supports: ['h_desvio'] },
    { id: 'e_poste', kind: 'campo', title: 'Poste apagado na rua da Quadra 214', source: 'Registro com a câmera',
      summary: 'Luminária danificada no caminho até a parada. Problema paralelo: segurança na volta para casa.' },
    { id: 'e_rampa', kind: 'campo', title: 'Calçada sem rampa', source: 'Registro com a câmera',
      summary: 'Meio-fio alto, sem rampa de acesso, a poucos metros da parada.' },
    { id: 'e_atraso', kind: 'campo', title: 'A equipe chegou atrasada', source: 'Experiência própria',
      summary: 'Vocês viveram o problema: chegada depois das 07:30.' },
    // relatos
    { id: 'e_rel_caio', kind: 'relato', title: 'Caio: "esperei mais de 20 minutos"', source: 'Caio, 2º ano',
      summary: 'Relata esperas longas. Diz que "o ônibus nunca passa".', supports: ['h_nunca'] },
    { id: 'e_rel_celia', kind: 'relato', title: 'Dona Célia: "já vem lotado"', source: 'Dona Célia, moradora',
      summary: 'Pega o ônibus em paradas anteriores e diz que ele já sai cheio. Notou a mudança "de umas semanas pra cá".',
      supports: ['h_lotado'], contradicts: ['h_nunca'] },
    { id: 'e_rel_rafael', kind: 'relato', title: 'Rafael: "tenho que descer pra rua"', source: 'Rafael, morador',
      summary: 'Usuário de cadeira de rodas. Sem rampa, precisa usar a pista para chegar à parada.' },
    { id: 'e_rel_thiago', kind: 'relato', title: 'Operário: "os ônibus tão desviando"', source: 'Thiago, trabalhador da obra',
      summary: 'Afirma que os ônibus passaram a desviar pela quadra de trás desde o início da obra.', supports: ['h_desvio'] },
    { id: 'e_rel_marcia', kind: 'relato', title: 'Coordenação: atrasos concentrados', source: 'Márcia, coordenação do CED',
      summary: 'Percebe que os atrasos se concentram em quem vem da Quadra 214.', supports: ['h_desvio'] },
    { id: 'e_rel_pedro', kind: 'relato', title: 'Pedro: "minha linha chega no horário"', source: 'Pedro, 3º ano',
      summary: 'A linha dele não passa pela obra e chega normalmente.', supports: ['h_desvio'], contradicts: ['h_poucos'] },
    { id: 'e_rel_atend', kind: 'relato', title: 'Administração: "linha de ônibus é com a SEMOB"', source: 'Atendimento da Administração Regional',
      summary: 'Confirma a obra no cronograma e indica que itinerário e horários são tratados pela Secretaria de Transporte e Mobilidade.',
      supports: ['h_desvio'] },
    // rumores
    { id: 'e_rum_frota', kind: 'rumor', title: '"Cortaram os ônibus pela metade"', source: 'Seu Raimundo (ouviu de alguém)',
      summary: 'Informação de segunda mão, sem fonte identificada.', supports: ['h_poucos'] },
    { id: 'e_rum_fim', kind: 'rumor', title: '"A linha vai acabar"', source: 'Júlia (grupo de mensagens)',
      summary: 'Mensagem encaminhada várias vezes, sem autor original.', supports: ['h_acabar'] },
    // dados (simulados)
    { id: 'e_dado_horario', kind: 'dado', simulated: true, title: 'Programação: um ônibus a cada 15 min no pico', source: 'DF no Ponto (simulado)',
      summary: `A programação da linha no horário de pico não mudou. ${SIM}.`, contradicts: ['h_poucos'] },
    { id: 'e_dado_aovivo', kind: 'dado', simulated: true, title: 'Ônibus rastreados fora do itinerário', source: 'DF no Ponto (simulado)',
      summary: `Veículos da 0.214 circulam pela via da Quadra 300, fora do trajeto oficial, chegando agrupados. ${SIM}.`,
      supports: ['h_desvio'], contradicts: ['h_nunca'] },
    { id: 'e_dado_frota', kind: 'dado', simulated: true, title: 'Frota programada estável', source: 'Dados Abertos DF (base simulada)',
      summary: `Seis veículos programados em todos os meses consultados. ${SIM}.`, contradicts: ['h_poucos'] },
    { id: 'e_dado_pont', kind: 'dado', simulated: true, title: 'Intervalos irregulares desde a semana 4', source: 'Dados Abertos DF (base simulada)',
      summary: `O intervalo médio entre ônibus quase dobra a partir da semana 4. ${SIM}.`, supports: ['h_desvio'] },
    // documentos
    { id: 'e_doc_contrato', kind: 'documento', simulated: true, title: 'Contrato da obra: início na semana 4', source: 'Transparência DF (documento simulado)',
      summary: `Recuperação do pavimento da via entre as Quadras 200 e 300. Início na semana 4. Prazo não informado no extrato. ${SIM}.`,
      supports: ['h_desvio'] },
    // respostas (simuladas)
    { id: 'e_resp_ouv', kind: 'resposta', simulated: true, title: 'SEMOB: itinerário alterado pela obra', source: 'Participa DF — resposta simulada',
      summary: 'O itinerário foi alterado temporariamente em razão da obra; a operação será acompanhada no horário de pico. RESPOSTA SIMULADA.',
      supports: ['h_desvio'] },
    { id: 'e_resp_lai', kind: 'resposta', simulated: true, title: 'SEMOB: sem extinção, frota mantida', source: 'Participa DF (LAI) — resposta simulada',
      summary: 'Não há ato de extinção da linha 0.214 e a frota programada foi mantida. RESPOSTA SIMULADA.',
      contradicts: ['h_acabar', 'h_poucos'] },
    { id: 'e_resp_obra', kind: 'resposta', simulated: true, title: 'NOVACAP: obra com conclusão prevista', source: 'Participa DF — resposta simulada',
      summary: 'A recuperação do pavimento tem conclusão prevista em seis semanas. RESPOSTA SIMULADA.', supports: ['h_desvio'] }
  ],

  crossRefs: [
    { id: 'x_datas', evidences: ['e_doc_contrato', 'e_dado_pont'], rep: 80,
      text: 'As datas batem: os intervalos ficaram irregulares na mesma semana em que a obra começou.' },
    { id: 'x_rastreio', evidences: ['e_comboio', 'e_dado_aovivo'], rep: 60,
      text: 'O que vocês viram na parada aparece no rastreamento: ônibus agrupados depois do desvio.' },
    { id: 'x_frota', evidences: ['e_rum_frota', 'e_dado_frota'], rep: 50,
      text: 'O boato da frota foi confrontado com uma base pública.' },
    { id: 'x_fim', evidences: ['e_rum_fim', 'e_resp_lai'], rep: 50,
      text: 'O boato do grupo foi confrontado com uma resposta oficial.' },
    { id: 'x_quadro', evidences: ['e_quadro', 'e_obra'], rep: 40,
      text: 'A obra mudou o trajeto, mas a informação na parada não mudou.' }
  ],

  /* ---------------- PONTOS DE OBSERVAÇÃO ---------------- */
  pois: [
    { id: 'p_parada', name: 'Parada 214', pos: L.parada, radius: 6, prompt: 'Observar a parada',
      observation: 'A parada está cheia. Muitos estudantes. Não há quadro de horários aqui, só a placa da linha.', evidence: 'e_fila', flag: 'at_parada' },
    { id: 'p_obra', name: 'Placa da obra', pos: L.obraPlaca, radius: 4, prompt: 'Ler a placa',
      observation: '"OBRA — DESVIO DE LINHAS PELA VIA DA QUADRA 300." Não há data de término.', evidence: 'e_obra', flag: 'saw_obra' },
    { id: 'p_passagem', name: 'Passagem interditada', pos: L.passagem, radius: 4, prompt: 'Examinar a passagem',
      observation: 'Tapumes fecham a travessia de pedestres. Do outro lado fica a área central e o Centro de Ensino.', evidence: 'e_passagem', flag: 'saw_passagem' },
    { id: 'p_poste', name: 'Poste apagado', pos: L.posteQuebrado, radius: 4, prompt: 'Olhar o poste',
      observation: 'A luminária está quebrada e pendurada. À noite, este trecho fica escuro.', evidence: 'e_poste' },
    { id: 'p_rampa', name: 'Meio-fio', pos: L.rampa, radius: 3.5, prompt: 'Examinar a calçada',
      observation: 'O meio-fio é alto e não existe rampa. Quem usa cadeira de rodas ou carrinho precisa ir pela pista.', evidence: 'e_rampa' },
    { id: 'p_quadro', name: 'Quadro de itinerário', pos: L.paradaCed, radius: 5, prompt: 'Ler o quadro da parada',
      observation: 'O mapa afixado mostra a linha 0.214 seguindo reto pela via principal. Nada sobre desvio.', evidence: 'e_quadro', flag: 'saw_quadro' },
    { id: 'p_ced', name: 'Centro de Ensino', pos: L.cedGate, radius: 5, prompt: 'Olhar o portão',
      observation: 'O portão fecha às 07:30. Um aviso: "Atrasos serão registrados na coordenação."' },
    { id: 'p_adm', name: 'Administração Regional', pos: L.admDoor, radius: 5, prompt: 'Observar o prédio',
      observation: 'Atendimento ao público aberto. Um cartaz divulga o Participa DF para reclamações e pedidos de informação.' }
  ],

  /* ---------------- NPCs ---------------- */
  npcs: [
    {
      id: 'caio', name: 'Caio', label: '2º ANO', pos: [L.parada[0] - 3, L.parada[1] - 1.5], facing: 2.8, pose: 'phone',
      look: { build: 'A', skin: 4, hair: 'crespo', top: 'moletom', topColor: 0, bottom: 'calca', bottomColor: 7, accessory: 'fone', backpack: true, backpackColor: 4 },
      start: 's',
      nodes: {
        s: { tag: 'PERCEPÇÃO', text: 'Esse ônibus nunca passa. Ontem fiquei mais de vinte minutos aqui.', grants: { evidence: 'e_rel_caio' },
          choices: [
            { label: 'Nunca passa, ou passa e não para?', next: 'a' },
            { label: 'Anotar no dossiê: "o ônibus não passa"', next: 'h', grants: { hypothesis: 'h_nunca' } },
            { label: 'Valeu, Caio.' }
          ] },
        a: { text: 'Sei lá… às vezes passa um cheio direto. Aí parece que nunca vem, né?',
          choices: [
            { label: 'Anotar no dossiê: "o ônibus não passa"', next: 'h', grants: { hypothesis: 'h_nunca' } },
            { label: 'Vou ficar de olho.' }
          ] },
        h: { text: 'Anota aí. Quero ver alguém provar o contrário.' }
      }
    },
    {
      id: 'celia', name: 'Dona Célia', label: 'MORADORA', pos: [L.parada[0] + 3, L.parada[1] - 1.2], facing: -2.9, pose: 'stand',
      look: { build: 'B', skin: 5, hair: 'coque', hairColor: 7, top: 'camiseta', topColor: 4, bottom: 'saia', bottomColor: 6, backpack: false, accessory: 'nenhum' },
      start: 's',
      nodes: {
        s: { tag: 'RELATO', text: 'Passa sim, meu filho. O problema é que já vem lotado. Desde a primeira parada lá de cima já tá cheio.',
          grants: { evidence: 'e_rel_celia' },
          choices: [
            { label: 'Sempre foi assim?', next: 'a' },
            { label: 'Anotar no dossiê: "os ônibus chegam lotados"', next: 'h', grants: { hypothesis: 'h_lotado' } },
            { label: 'Obrigado, Dona Célia.' }
          ] },
        a: { text: 'Não. Começou de umas semanas pra cá. Antes dava pra ir sentada até.',
          choices: [
            { label: 'Aconteceu alguma coisa nessa época?', next: 'b' },
            { label: 'Anotar no dossiê: "os ônibus chegam lotados"', next: 'h', grants: { hypothesis: 'h_lotado' } }
          ] },
        b: { tag: 'PISTA', text: 'Ah, não lembro direito… Foi mais ou menos quando começou aquela bagunça lá na via. Máquina pra todo lado.',
          grants: { flag: 'hint_obra' },
          choices: [{ label: 'Vou dar uma olhada lá.' }] },
        h: { text: 'Pode anotar. E anota também que eu tô em pé desde a primeira parada.' }
      }
    },
    {
      id: 'raimundo', name: 'Seu Raimundo', label: 'APOSENTADO', pos: [L.parada[0] + 1, L.parada[1] + 1.8], facing: -2.4, pose: 'stand',
      look: { build: 'A', skin: 1, hair: 'raspado', hairColor: 7, top: 'camiseta', topColor: 1, bottom: 'calca', bottomColor: 3, backpack: false, accessory: 'bone' },
      start: 's',
      nodes: {
        s: { tag: 'OUVIU DIZER', text: 'Ouvi dizer que reduziram a quantidade de ônibus dessa linha. Cortaram pela metade!',
          grants: { evidence: 'e_rum_frota' },
          choices: [
            { label: 'Quem te falou isso?', next: 'a' },
            { label: 'Dá pra conferir em algum lugar?', next: 'b' },
            { label: 'Anotar no dossiê: "reduziram os ônibus"', next: 'h', grants: { hypothesis: 'h_poucos' } }
          ] },
        a: { text: 'Um rapaz lá no bar. Ele sabe das coisas.',
          choices: [{ label: 'Dá pra conferir em algum lugar?', next: 'b' }, { label: 'Entendi.' }] },
        b: { text: 'Conferir? Sei lá onde se confere isso. Vocês jovens é que entendem dessas coisas de internet.',
          choices: [{ label: 'Anotar no dossiê: "reduziram os ônibus"', next: 'h', grants: { hypothesis: 'h_poucos' } }, { label: 'Vou procurar.' }] },
        h: { text: 'Anota. Depois me conta se eu tava certo.' }
      }
    },
    {
      id: 'julia', name: 'Júlia', label: '1º ANO', pos: [L.parada[0] - 6.5, L.parada[1] + 0.5], facing: 2.0, pose: 'phone',
      look: { build: 'B', skin: 2, hair: 'longo', hairColor: 1, top: 'jaqueta', topColor: 3, bottom: 'calca', bottomColor: 0, backpack: true, backpackColor: 6, accessory: 'oculos' },
      start: 's',
      nodes: {
        s: { tag: 'OUVIU DIZER', text: 'Tá todo mundo falando no grupo que essa linha vai acabar mês que vem.',
          grants: { evidence: 'e_rum_fim' },
          choices: [
            { label: 'Quem mandou primeiro?', next: 'a' },
            { label: 'Dá pra perguntar isso oficialmente?', next: 'b' },
            { label: 'Anotar no dossiê: "a linha vai acabar"', next: 'h', grants: { hypothesis: 'h_acabar' } }
          ] },
        a: { text: 'Sei lá. Foi encaminhado um monte de vezes. Tem até print.',
          choices: [{ label: 'Dá pra perguntar isso oficialmente?', next: 'b' }, { label: 'Hm. Ok.' }] },
        b: { text: 'Perguntar pra quem? Pro motorista? Ele não sabe nem que horas sai.',
          choices: [{ label: 'Anotar no dossiê: "a linha vai acabar"', next: 'h', grants: { hypothesis: 'h_acabar' } }, { label: 'Vou descobrir.' }] },
        h: { text: 'Se acabar mesmo, eu vou ter que acordar às cinco.' }
      }
    },
    {
      id: 'rafael', name: 'Rafael', label: 'MORADOR', pos: [L.rampa[0] + 2.2, L.rampa[1] + 0.6], facing: -2.6, pose: 'wheelchair',
      look: { build: 'A', skin: 3, hair: 'curto', hairColor: 0, top: 'camiseta', topColor: 2, bottom: 'calca', bottomColor: 0, backpack: false, accessory: 'nenhum' },
      start: 's',
      nodes: {
        s: { tag: 'RELATO', text: 'Pra chegar na parada eu tenho que descer pra pista. Essa calçada não tem rampa.',
          grants: { evidence: 'e_rel_rafael' },
          choices: [
            { label: 'E à noite?', next: 'a' },
            { label: 'Isso é com quem?', next: 'b' },
            { label: 'Vou registrar isso.' }
          ] },
        a: { tag: 'PISTA', text: 'À noite é pior. A rua de trás tá com poste apagado faz tempo.', grants: { flag: 'hint_poste' },
          choices: [{ label: 'Isso é com quem?', next: 'b' }, { label: 'Valeu.' }] },
        b: { text: 'Já reclamei na Administração uma vez. Não sei se foi pro lugar certo. Nunca tive resposta.' }
      }
    },
    {
      id: 'thiago', name: 'Thiago', label: 'TRABALHADOR DA OBRA', pos: [L.obraPlaca[0] + 2.5, L.obraPlaca[1] - 2], facing: 2.6, pose: 'work',
      look: { build: 'A', skin: 3, hair: 'raspado', top: 'camiseta', topColor: 4, bottom: 'calca', bottomColor: 3, backpack: false, accessory: 'bone' },
      start: 's',
      nodes: {
        s: { text: 'Ô, aqui não passa, não. Área de obra.',
          choices: [{ label: 'Que obra é essa?', next: 'a' }, { label: 'Foi mal.' }] },
        a: { tag: 'RELATO', text: 'Recuperação da via. Por isso os ônibus tão desviando pela rua de trás, lá pela Quadra 300.',
          grants: { evidence: 'e_rel_thiago', hypothesis: 'h_desvio' },
          choices: [{ label: 'Até quando vai a obra?', next: 'b' }, { label: 'E quem anda a pé?', next: 'c' }] },
        b: { tag: 'PISTA', text: 'Isso eu não sei. Pergunta pra quem contratou, né. Deve ter isso publicado em algum lugar.',
          grants: { flag: 'hint_contrato' },
          choices: [{ label: 'E quem anda a pé?', next: 'c' }, { label: 'Valeu.' }] },
        c: { text: 'Passagem fechada. Tem que dar a volta… de ônibus.' }
      }
    },
    {
      id: 'marcia', name: 'Márcia', label: 'COORDENAÇÃO DO CED', zone: 'east', pos: [L.cedGate[0] - 3, L.cedGate[1] + 1.5], facing: 3.0, pose: 'stand',
      look: { build: 'B', skin: 4, hair: 'cacheado', hairColor: 1, top: 'jaqueta', topColor: 7, bottom: 'calca', bottomColor: 0, backpack: false, accessory: 'oculos' },
      start: 's',
      nodes: {
        s: { tag: 'PERCEPÇÃO', text: 'Esse mês os atrasos aumentaram muito. E quase sempre são os mesmos: o pessoal que vem da Quadra 214.',
          grants: { evidence: 'e_rel_marcia' },
          choices: [
            { label: 'Quem vem de outros lugares também atrasa?', next: 'a' },
            { label: 'A escola já avisou alguém?', next: 'b' },
            { label: 'Obrigado.' }
          ] },
        a: { text: 'Bem menos. Quem vem por outras linhas tá chegando normal. Fala com o Pedro ali, ele vem do outro lado.',
          choices: [{ label: 'A escola já avisou alguém?', next: 'b' }, { label: 'Valeu.' }] },
        b: { text: 'Mandamos um ofício pra Regional. Ainda sem retorno. Se vocês descobrirem algo, quero saber.' }
      }
    },
    {
      id: 'pedro', name: 'Pedro', label: '3º ANO', zone: 'east', pos: [L.cedGate[0] + 4, L.cedGate[1] + 3], facing: -2.4, pose: 'phone',
      look: { build: 'C', skin: 6, hair: 'trancas', hairColor: 0, top: 'regata', topColor: 9, bottom: 'bermuda', bottomColor: 0, shoeColor: 2, backpack: true, backpackColor: 0, accessory: 'nenhum' },
      start: 's',
      nodes: {
        s: { tag: 'RELATO', text: 'Minha linha vem pelo outro lado e chega no horário. O problema é só a de vocês.',
          grants: { evidence: 'e_rel_pedro' },
          choices: [{ label: 'Sua linha passa pela obra?', next: 'a' }, { label: 'Sorte sua.' }] },
        a: { text: 'Não. Passa longe dela. Mesmo trânsito, mesmo horário… só que sem desvio.' }
      }
    },
    {
      id: 'lucia', name: 'Lúcia', label: 'ATENDIMENTO — ADM. REGIONAL', zone: 'east', pos: [L.admDoor[0] + 1.5, L.admDoor[1] - 1.5], facing: 3.1, pose: 'stand',
      look: { build: 'B', skin: 1, hair: 'coque', hairColor: 2, top: 'jaqueta', topColor: 0, bottom: 'saia', bottomColor: 7, backpack: false, accessory: 'oculos' },
      start: 's',
      nodes: {
        s: { text: 'Bom dia! Administração Regional. Em que posso ajudar?',
          choices: [
            { label: 'Os ônibus estão atrasando por causa da obra?', next: 'a' },
            { label: 'A calçada da parada não tem rampa.', next: 'c' },
            { label: 'Só olhando, obrigado.' }
          ] },
        a: { tag: 'PISTA', text: 'A obra da via está no cronograma, sim. Mas linha de ônibus, horário e itinerário são com a Secretaria de Transporte e Mobilidade.',
          grants: { evidence: 'e_rel_atend' },
          choices: [{ label: 'Como a gente fala com eles?', next: 'b' }, { label: 'Entendi, obrigado.' }] },
        b: { text: 'Pelo Participa DF. Dá pra registrar na ouvidoria ou fazer um pedido de acesso à informação. Tudo fica com número de protocolo.',
          grants: { flag: 'hint_participa' } },
        c: { text: 'Pode registrar também. Dependendo do caso, quem executa é a Regional ou a NOVACAP. Pelo Participa DF a manifestação chega ao lugar certo.' }
      }
    }
  ],

  /* ---------------- EVENTOS DINÂMICOS ---------------- */
  events: [
    { id: 'ev_msg_missao', at: '06:56', type: 'message', params: { from: 'CENTRAL // MISSÃO DF', thread: 'central',
      text: 'NOVA MISSÃO. Estudantes da Quadra 214 estão chegando atrasados ao Centro de Ensino. Objetivo imediato: chegue à escola até 07:30.' } },
    { id: 'ev_bus1', at: '07:04', type: 'bus', params: { full: true, stops: false } },
    { id: 'ev_msg_grupo', at: '07:08', type: 'message', params: { from: 'Grupo 2º B', thread: 'grupo',
      text: '[encaminhada muitas vezes] gente a 0.214 vai acabar mês q vem, avisem todo mundo' } },
    { id: 'ev_cap_vazio', at: '07:12', type: 'caption', params: { text: '07:12 — Nenhum ônibus à vista.' } },
    { id: 'ev_bus2', at: '07:18', type: 'bus', params: { full: true, stops: false, convoy: true } },
    { id: 'ev_bus3', at: '07:19', type: 'bus', params: { full: false, stops: true, convoy: true } },
    { id: 'ev_bus4', at: '07:28', type: 'bus', params: { full: false, stops: true, repeatEvery: 9, untilFlag: 'arrived_school' } },
    { id: 'ev_msg_caio', afterFlag: 'arrived_school', delaySec: 25, type: 'message', params: { from: 'Caio', thread: 'caio',
      text: 'conseguiu chegar? eu fiquei na parada de novo. passou um cheio e depois dois juntos, que sentido isso faz' } },
    { id: 'ev_cap_inv', afterFlag: 'arrived_school', delaySec: 4, type: 'caption', params: {
      text: 'Fase de investigação liberada. O MAPA do celular agora permite deslocamento rápido.' } },
    { id: 'ev_rain', afterFlag: 'arrived_school', delaySec: 95, type: 'rain', params: { on: true,
      caption: 'Começou a chover. Na Parada 214 não há cobertura suficiente para todo mundo.' } },
    { id: 'ev_rain_off', afterFlag: 'arrived_school', delaySec: 190, type: 'rain', params: { on: false } },
    { id: 'ev_msg_marcia', afterFlag: 'saw_obra', delaySec: 30, type: 'message', params: { from: 'Márcia (CED)', thread: 'marcia',
      text: 'Vocês já descobriram alguma coisa? Hoje mais oito alunos da 214 chegaram depois do sinal.' } }
  ],

  /* ---------------- CONTEÚDO DAS FERRAMENTAS ---------------- */
  tools: {
    dfnoponto: {
      suggestions: ['0.214', 'horários 0.214', 'linha vai acabar'],
      emptyText: 'O DF no Ponto mostra linhas, horários e a posição dos ônibus. Não há aqui informação sobre planos futuros para a linha.',
      results: [
        { id: 'r_hor', keywords: ['0.214', '214', 'horario', 'horarios', 'tabela', 'programacao', 'linha'],
          title: 'Linha 0.214 — Programação de partidas',
          blocks: [
            { t: 'table', head: ['Faixa horária', 'Intervalo programado'], rows: [['05:30 – 06:30', '20 min'], ['06:30 – 08:30', '15 min'], ['08:30 – 17:00', '25 min']] },
            { t: 'note', v: SIM }
          ], evidence: 'e_dado_horario' }
      ]
    },
    transparencia: {
      suggestions: ['obra via', 'contratos transporte', 'iluminação pública'],
      emptyText: 'Nenhum contrato ou despesa encontrado com esses termos.',
      results: [
        { id: 'r_contrato', keywords: ['obra', 'via', 'pavimento', 'recuperacao', 'asfalto', 'contrato'],
          title: 'Extrato de contrato — Recuperação de pavimento',
          blocks: [
            { t: 'table', head: ['Campo', 'Informação'], rows: [
              ['Objeto', 'Recuperação do pavimento da via entre as Quadras 200 e 300'],
              ['Contratante', 'NOVACAP'], ['Início da execução', 'Semana 4 do mês'], ['Prazo', 'Não informado no extrato']] },
            { t: 'note', v: 'DOCUMENTO SIMULADO PARA DEMONSTRAÇÃO' }
          ], evidence: 'e_doc_contrato' },
        { id: 'r_gasto', keywords: ['transporte', 'onibus', 'mobilidade', 'subsidio'],
          title: 'Despesas — Função Transporte',
          blocks: [
            { t: 'bars', label: 'Despesa liquidada por ano (índice)', items: [{ k: 'Ano 1', v: 92 }, { k: 'Ano 2', v: 97 }, { k: 'Ano 3', v: 100 }] },
            { t: 'text', v: 'Mostra quanto foi gasto no setor. Não mostra por que uma linha específica atrasa.' },
            { t: 'note', v: SIM }
          ] },
        { id: 'r_ilum', keywords: ['iluminacao', 'poste', 'luz', 'lampada'],
          title: 'Despesas — Manutenção de iluminação pública',
          blocks: [{ t: 'text', v: 'Contratos de manutenção vigentes para todo o DF. Não detalha ruas específicas.' }, { t: 'note', v: SIM }] }
      ]
    },
    dadosabertos: {
      suggestions: ['frota por linha', 'pontualidade', 'acidentes de trânsito'],
      emptyText: 'Nenhuma base encontrada. Tente outros termos.',
      results: [
        { id: 'r_frota', keywords: ['frota', 'onibus', 'veiculos', 'quantidade'],
          title: 'Frota programada por linha — 0.214',
          blocks: [
            { t: 'bars', label: 'Veículos programados', unit: '', items: [{ k: 'Mês 1', v: 6 }, { k: 'Mês 2', v: 6 }, { k: 'Mês 3', v: 6 }, { k: 'Mês 4', v: 6 }, { k: 'Atual', v: 6 }] },
            { t: 'note', v: 'BASE SIMULADA PARA DEMONSTRAÇÃO' }
          ], evidence: 'e_dado_frota' },
        { id: 'r_pont', keywords: ['pontualidade', 'intervalo', 'atraso', 'viagens', 'espera'],
          title: 'Intervalo médio entre ônibus — 0.214 (pico da manhã)',
          blocks: [
            { t: 'bars', label: 'Minutos entre um ônibus e outro', unit: ' min', items: [{ k: 'Sem 1', v: 15 }, { k: 'Sem 2', v: 16 }, { k: 'Sem 3', v: 15 }, { k: 'Sem 4', v: 27 }, { k: 'Sem 5', v: 31 }, { k: 'Sem 6', v: 29 }] },
            { t: 'note', v: 'BASE SIMULADA PARA DEMONSTRAÇÃO' }
          ], evidence: 'e_dado_pont' },
        { id: 'r_acid', keywords: ['acidente', 'transito', 'ocorrencia'],
          title: 'Ocorrências de trânsito na via',
          blocks: [{ t: 'text', v: 'Sem variação relevante no período.' }, { t: 'note', v: SIM }] }
      ]
    },
    infosaude: { suggestions: ['dengue', 'vacinação'], results: [],
      emptyText: 'Painéis de saúde pública: casos, vacinação, atendimentos. Nada aqui sobre transporte ou horários de ônibus.' },
    dengue: { suggestions: ['casos', 'prevenção'], results: [],
      emptyText: 'Informações sobre arboviroses e prevenção. Nada aqui sobre transporte.' },
    sisdia: { suggestions: ['parques', 'qualidade do ar'], results: [],
      emptyText: 'Camadas e informações ambientais do DF. Nada aqui sobre o funcionamento das linhas de ônibus.' }
  },

  agencyResponses: [
    { agency: 'semob', channel: 'ouvidoria', evidence: 'e_resp_ouv',
      text: 'Prezados, informamos que o itinerário da linha 0.214 foi alterado temporariamente em razão de obra na via. A operação será acompanhada para ajuste de intervalos no horário de pico. (RESPOSTA SIMULADA)' },
    { agency: 'semob', channel: 'lai', evidence: 'e_resp_lai',
      text: 'Em atenção ao pedido, informamos que não há ato de extinção da linha 0.214 e que a frota programada foi mantida. (RESPOSTA SIMULADA)' },
    { agency: 'novacap', channel: '*', evidence: 'e_resp_obra',
      text: 'A obra de recuperação do pavimento tem conclusão prevista em seis semanas. (RESPOSTA SIMULADA)' },
    { agency: 'admreg', channel: '*',
      text: 'Sua manifestação foi recebida e encaminhada aos órgãos competentes. (RESPOSTA SIMULADA)' },
    { agency: 'cebipes', channel: '*',
      text: 'Solicitação de manutenção registrada para a rua da Quadra 214. (RESPOSTA SIMULADA)' },
    { agency: '*', channel: '*',
      text: 'Manifestação recebida. Como o tema não é da competência deste órgão, ela foi encaminhada à área responsável, o que pode aumentar o prazo de resposta. (RESPOSTA SIMULADA)' }
  ]
};

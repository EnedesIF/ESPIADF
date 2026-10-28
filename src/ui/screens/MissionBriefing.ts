import type { App } from '../App';
import { h } from '../dom';
import { getCampaign } from '@/data/campaigns';
import { roleById } from '@/data/roles';
import type { CampaignId } from '@/types';

const META: Record<CampaignId, { code: string; location: string; risk: string; known: string[]; unknown: string[] }> = {
  mobility: {
    code: 'OP-214 / ROTA QUEBRADA', location: 'QUADRA 214 → CENTRO DE ENSINO', risk: 'TEMPO REAL',
    known: ['Estudantes da Quadra 214 estão chegando atrasados.', 'Há versões conflitantes sobre a linha 0.214.', 'O portão fecha às 07:30.'],
    unknown: ['A frota foi reduzida?', 'Existe desvio de itinerário?', 'A obra tem relação com os atrasos?']
  },
  work: {
    code: 'OP-02 / JANELA DE OPORTUNIDADE', location: 'REDE PÚBLICA / DF', risk: 'PRAZO',
    known: ['Uma oportunidade circula entre estudantes.', 'O prazo informado é curto.', 'Há versões diferentes sobre os requisitos.'],
    unknown: ['O edital existe?', 'Quem pode participar?', 'Quais documentos e prazos são oficiais?']
  },
  territory: {
    code: 'OP-03 / TERRITÓRIO EM DISPUTA', location: 'ESPAÇO PÚBLICO / DF', risk: 'CONFLITO DE USO',
    known: ['O espaço é usado por grupos diferentes.', 'Há reclamações sobre cuidado e manutenção.', 'As explicações dos usuários não coincidem.'],
    unknown: ['Quem gere o espaço?', 'Qual problema é verificável?', 'Que solução atende mais de um grupo?']
  },
  health: {
    code: 'OP-04 / ALERTA NO BAIRRO', location: 'REGIÃO DO DF', risk: 'SAÚDE PÚBLICA',
    known: ['Moradores relatam preocupação com dengue.', 'Circulam explicações diferentes para o cenário.', 'Existem dados e orientações oficiais.'],
    unknown: ['Os casos realmente aumentaram?', 'Quais fatores aparecem nas evidências?', 'Que ação pública está prevista?']
  }
};

export function renderMissionBriefing(app: App, id: CampaignId) {
  const team = app.team!;
  const c = getCampaign(id);
  const m = META[id];
  const roster = team.members.map((member, i) =>
    h('div', { class: 'brief-agent' },
      h('span', { class: 'brief-agent-n' }, String(i + 1).padStart(2, '0')),
      h('div', {}, h('b', {}, member.name), h('small', {}, roleById(member.role).name)),
      h('span', { class: 'brief-agent-status' }, 'ONLINE')));

  return h('div', { class: 'screen mission-brief-screen' },
    h('div', { class: 'mission-brief-scan' }),
    h('header', { class: 'mission-brief-top' },
      h('button', { class: 'iconbtn', 'aria-label': 'Voltar', onclick: () => app.showHub() }, '←'),
      h('div', {}, h('div', { class: 'eyebrow' }, 'CENTRAL // BRIEFING OPERACIONAL'), h('strong', {}, m.code)),
      h('div', { class: 'mission-clearance' }, 'EQUIPE ', h('b', {}, team.name.toUpperCase()), ' // AUTORIZADA')),
    h('main', { class: 'mission-brief-main' },
      h('section', { class: 'mission-brief-hero' },
        h('div', { class: 'mission-brief-number' }, c.number),
        h('div', {},
          h('div', { class: 'eyebrow' }, `${c.axis} // ${m.location}`),
          h('h1', {}, c.title),
          h('p', {}, c.briefing),
          h('div', { class: 'mission-brief-tags' },
            h('span', {}, 'RISCO // ', h('b', {}, m.risk)),
            h('span', {}, 'STATUS // ', h('b', {}, 'NÃO RESOLVIDO')),
            h('span', {}, 'PROTOCOLO // ', h('b', {}, 'VERIFICAR ANTES DE CONCLUIR'))))),
      h('section', { class: 'mission-intel-grid' },
        h('div', { class: 'panel intel' }, h('div', { class: 'eyebrow' }, 'O QUE SABEMOS'), ...m.known.map((x, i) => h('div', { class: 'intel-line' }, h('span', {}, `0${i + 1}`), x))),
        h('div', { class: 'panel intel unknown' }, h('div', { class: 'eyebrow' }, 'O QUE AINDA NÃO SABEMOS'), ...m.unknown.map((x, i) => h('div', { class: 'intel-line' }, h('span', {}, `?${i + 1}`), x)))),
      h('section', { class: 'mission-brief-bottom' },
        h('div', { class: 'panel squad' }, h('div', { class: 'eyebrow' }, `ESQUADRÃO // ${team.members.length} INTEGRANTES`), h('div', { class: 'brief-roster' }, roster)),
        h('div', { class: 'launch-card' },
          h('div', { class: 'eyebrow' }, 'REGRA DE CAMPO'),
          h('p', {}, 'Relato não é prova. Dado sem contexto não é resposta. A missão termina quando a equipe consegue sustentar uma conclusão com evidências.'),
          c.available
            ? h('button', { class: 'btn amber block launch-pulse', onclick: () => app.startCampaign(id) }, 'ENTRAR NA CIDADE →')
            : h('button', { class: 'btn block', disabled: true }, 'CAMPANHA EM PRODUÇÃO'),
          h('small', { class: 'mono muted' }, 'WASD / SETAS · MOUSE · E INTERAGIR · C CELULAR · J DOSSIÊ')))));
}

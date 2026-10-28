import type { App } from '../App';
import { h, clear } from '../dom';
import { REGIONS } from '@/data/regions';
import { ROLES } from '@/data/roles';
import {TEAM_ROLES,type TeamRole} from '@/data/cityCooperation';
import type { Member, RoleId, Team } from '@/types';
import { uid, makeLogin } from '@/services/util';
import { backend } from '@/services/backend';
import { randomAvatar } from '@/data/avatarOptions';
import { GAME } from '@/config';

/** Formação da equipe — o professor-mentor cadastra grupo, mentor e até 10 estudantes. */
export function renderTeamSetup(app: App) {
  const st = {
    step: 0,
    team: { name: '', school: '', ra: '', turma: '' },
    mentor: { name: '', email: '', phone: '', school: '', area: '' },
    members: [] as { name: string; email: string; phone: string; turma: string; role: RoleId; missionRole:TeamRole }[],
    password: '', password2: ''
  };
  const addMember = () => {
    if (st.members.length >= GAME.maxMembers) return;
    st.members.push({ name: '', email: '', phone: '', turma: st.team.turma, role: ROLES[st.members.length % ROLES.length].id, missionRole:Object.keys(TEAM_ROLES)[st.members.length%6] as TeamRole });
  };
  for(let i=0;i<GAME.minMembers;i++)addMember();

  const root = h('div', { class: 'screen setup' });
  const inner = h('div', { class: 'setup-inner' });
  root.append(inner);
  const STEPS = ['01 EQUIPE', '02 PROFESSOR-MENTOR', '03 INTEGRANTES E PAPÉIS', '04 ACESSO'];

  const bind = (obj: any, key: string, attrs: Record<string, any> = {}) => {
    const el = h('input', { value: obj[key] ?? '', ...attrs });
    el.oninput = () => { obj[key] = el.value; };
    return el;
  };
  const err = h('div', { class: 'err', role: 'alert' });

  const validate = (): string | null => {
    if (st.step === 0) {
      if (!st.team.name.trim()) return 'Dê um nome para a equipe.';
      if (!st.team.school.trim()) return 'Informe a escola.';
      if (!st.team.ra) return 'Escolha a Região Administrativa.';
    }
    if (st.step === 1) {
      if (!st.mentor.name.trim()) return 'Informe o nome do professor-mentor.';
      if (!/^\S+@\S+\.\S+$/.test(st.mentor.email)) return 'Informe um e-mail válido para o mentor.';
    }
    if (st.step === 2) {
      st.members = st.members.filter(m => m.name.trim() || st.members.length === 1);
      if(Object.keys(TEAM_ROLES).some(r=>!st.members.some(m=>m.name.trim()&&m.missionRole===r))) return 'Distribua os seis papéis entre os integrantes antes de concluir. Um papel pode ter apoio de mais de um estudante.';
      if (st.members.filter(m=>m.name.trim()).length<GAME.minMembers) return `Cadastre pelo menos ${GAME.minMembers} estudantes.`;
    }
    if (st.step === 3) {
      if (st.password.length < 6) return 'A senha precisa ter pelo menos 6 caracteres.';
      if (st.password !== st.password2) return 'As senhas não conferem.';
    }
    return null;
  };

  const render = () => {
    clear(inner); err.textContent = '';
    inner.append(
      h('div', { class: 'row' },
        h('button', { class: 'iconbtn', 'aria-label': 'Voltar', onclick: () => st.step ? (st.step--, render()) : app.showOpening() }, '←'),
        h('div', { class: 'eyebrow' }, 'FORMAÇÃO DA EQUIPE')),
      h('h1', {}, ['Quem entra nessa?', 'Quem acompanha a equipe?', 'Monte o esquadrão.', 'Credenciais da equipe.'][st.step]),
      h('p', { class: 'muted' }, [
        'O professor-mentor cria a equipe. Depois, os estudantes entram com o login da equipe.',
        'O mentor acompanha o progresso, envia pistas e valida a missão.',
        `De ${GAME.minMembers} a ${GAME.maxMembers} estudantes. Definam os papéis neste cadastro. Eles permanecerão fixos durante os desafios; o controle passa ao responsável por cada etapa.`,
        'O login é gerado automaticamente. A senha é definida pelo mentor e vale também para o painel do mentor.'][st.step]),
      h('div', { class: 'steps' }, STEPS.map((s, i) => h('span', { class: 'step' + (i === st.step ? ' on' : i < st.step ? ' done' : '') }, s))));

    if (st.step === 0) {
      const ra = h('select', {}, h('option', { value: '' }, 'Selecione…'), REGIONS.map(r => h('option', { value: r, selected: st.team.ra === r }, r)));
      ra.onchange = () => st.team.ra = ra.value;
      inner.append(h('div', { class: 'panel' }, h('div', { class: 'grid2' },
        h('label', { class: 'field' }, 'Nome da equipe', bind(st.team, 'name', { placeholder: 'Ex.: Vértice', maxlength: 32 })),
        h('label', { class: 'field' }, 'Escola', bind(st.team, 'school', { placeholder: 'Nome da escola' })),
        h('label', { class: 'field' }, 'Região Administrativa', ra),
        h('label', { class: 'field' }, 'Turma', bind(st.team, 'turma', { placeholder: 'Ex.: 2º B' })))));
    }
    if (st.step === 1) {
      if (!st.mentor.school) st.mentor.school = st.team.school;
      inner.append(h('div', { class: 'panel' }, h('div', { class: 'grid2' },
        h('label', { class: 'field' }, 'Nome', bind(st.mentor, 'name', { autocomplete: 'name' })),
        h('label', { class: 'field' }, 'E-mail', bind(st.mentor, 'email', { type: 'email', autocomplete: 'email' })),
        h('label', { class: 'field' }, 'Telefone', bind(st.mentor, 'phone', { type: 'tel', autocomplete: 'tel' })),
        h('label', { class: 'field' }, 'Escola', bind(st.mentor, 'school')),
        h('label', { class: 'field' }, 'Área / disciplina', bind(st.mentor, 'area', { placeholder: 'Ex.: Sociologia' })))));
    }
    if (st.step === 2) {
      const list = h('div', {});
      const drawList = () => {
        clear(list);
        list.append(h('div', { class: 'member mono muted', style: { fontSize: '.62rem', letterSpacing: '.14em' } },
          h('span', {}, '#'), h('span', {}, 'NOME'), h('span', {}, 'E-MAIL'), h('span', {}, 'TELEFONE'), h('span', {}, 'TURMA'), h('span', {}, 'PAPEL'), h('span', {})));
        st.members.forEach((m, i) => {
          const role = h('select', { 'aria-label': 'Papel' }, Object.entries(TEAM_ROLES).map(([id,r]) => h('option', { value:id, selected: m.missionRole === id }, r.name)));
          role.onchange = () => {m.missionRole=role.value as TeamRole;drawList()};
          list.append(h('div', { class: 'member' },
            h('span', { class: 'idx' }, String(i + 1).padStart(2, '0')),
            bind(m, 'name', { placeholder: 'Nome', 'aria-label': 'Nome', class: 'input' }),
            bind(m, 'email', { placeholder: 'E-mail', type: 'email', 'aria-label': 'E-mail', class: 'input' }),
            bind(m, 'phone', { placeholder: 'Telefone', 'aria-label': 'Telefone', class: 'input' }),
            bind(m, 'turma', { placeholder: 'Turma', 'aria-label': 'Turma', class: 'input' }),
            h('span', { class: 'wide' }, role,h('small',{},TEAM_ROLES[m.missionRole].task+' Papel fixo após concluir o cadastro.')),
            h('button', { class: 'iconbtn', 'aria-label': 'Remover integrante', disabled:st.members.length<=GAME.minMembers, onclick: () => { if(st.members.length>GAME.minMembers){st.members.splice(i, 1); drawList();} } }, '×')));
        });
        list.append(h('div', { class: 'row', style: { marginTop: '10px' } },
          h('button', { class: 'btn ghost sm', disabled: st.members.length >= GAME.maxMembers, onclick: () => { addMember(); drawList(); } }, '+ Integrante'),
          h('span', { class: 'mono muted' }, `${String(st.members.length).padStart(2, '0')} / ${GAME.maxMembers}`)));
      };
      drawList();
      inner.append(h('div', { class: 'panel' }, list),
        h('div', { class: 'eyebrow', style: { margin: '26px 0 10px' } }, 'PAPÉIS NA INVESTIGAÇÃO'),
        h('div', { class: 'rolegrid' }, Object.values(TEAM_ROLES).map(r => h('div', {class:'rolecard'},h('b',{},r.name),h('small',{},r.task)))));
    }
    if (st.step === 3) {
      inner.append(h('div', { class: 'panel' }, h('div', { class: 'grid2' },
        h('label', { class: 'field' }, 'Senha da equipe', bind(st, 'password', { type: 'password', autocomplete: 'new-password' })),
        h('label', { class: 'field' }, 'Confirmar senha', bind(st, 'password2', { type: 'password', autocomplete: 'new-password' })))));
    }

    inner.append(err, h('div', { class: 'row', style: { marginTop: '22px' } },
      h('span', { class: 'spacer' }),
      h('button', { class: 'btn', onclick: next }, st.step < 3 ? 'Avançar →' : 'Criar equipe')));
  };

  const next = async () => {
    const e = validate(); if (e) { err.textContent = e; return; }
    if (st.step < 3) { st.step++; render(); window.scrollTo(0, 0); return; }
    const members: Member[] = st.members.filter(m => m.name.trim()).map((m, i) => ({
      id: uid('m_'), name: m.name.trim(), email: m.email.trim(), phone: m.phone.trim(), turma: m.turma.trim(), role: m.role, missionRole:m.missionRole, avatar: {...randomAvatar(i * 13 + 5),cartoonLook:i%6}
    }));
    const team: Team = { id: uid('team_'), name: st.team.name.trim(), school: st.team.school.trim(), ra: st.team.ra, turma: st.team.turma.trim(),
      mentor: { ...st.mentor }, members, login: makeLogin(st.team.name), passwordHash: '', createdAt: new Date().toISOString() };
    try {
      const saved = await backend().createTeam(team, st.password);
      app.setTeam(saved);
      done(saved);
    } catch (ex: any) { err.textContent = 'Não foi possível criar a equipe: ' + (ex?.message ?? ex); }
  };

  const done = (t: Team) => {
    clear(inner);
    inner.append(
      h('div', { class: 'eyebrow' }, 'EQUIPE CRIADA'),
      h('h1', {}, t.name),
      h('p', { class: 'muted' }, `ID da equipe: ${t.id}. Anote o login abaixo — ele é usado pelos estudantes e, com o e-mail do mentor, no painel de acompanhamento.`),
      h('div', { class: 'panel cred' },
        h('div', {}, h('div', { class: 'eyebrow' }, 'LOGIN DA EQUIPE'), h('div', { class: 'big' }, t.login)),
        h('div', {}, h('div', { class: 'eyebrow' }, 'SENHA'), h('div', { class: 'big' }, '•'.repeat(Math.max(6, st.password.length))), h('small', { class: 'muted' }, 'definida por você — não é exibida'))),
      h('div', { class: 'row', style: { marginTop: '22px' } },
        h('button', { class: 'btn', onclick: () => app.showAvatar('hub') }, 'Criar avatares →'),
        h('button', { class: 'btn ghost', onclick: () => app.showAvatar('hub') }, 'Personalizar os integrantes')));
  };

  render();
  return root;
}

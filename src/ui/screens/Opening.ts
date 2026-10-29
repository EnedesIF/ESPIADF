import {storyStep} from '@/services/demoJourney';
import {audio} from '@/systems/AudioSystem';
import { gdfIdentity, developerCorner } from '../LandingBrand';
import type { App } from '../App';
import { h } from '../dom';
import { backend } from '@/services/backend';
import { modal } from '@/components/Modal';
import { openSettings } from '@/components/SettingsPanel';
import { createDemoTeam } from '@/services/demo';

export function renderOpening(app: App) {
  const loginModal = () => {storyStep(2);
    const login = h('input', { required: true, autocomplete: 'username', placeholder: 'Ex.: VERTICE-7K2Q' });
    const pass = h('input', { type: 'password', required: true, autocomplete: 'current-password', placeholder: '••••••••' });
    const err = h('div', { class: 'err', role: 'alert' });
    const form = h('form', { class: 'stack' },
      h('div', { class: 'eyebrow' }, 'ACESSO À MISSÃO'),
      h('h2', {}, 'Entrar'),h('p',{},'Equipe: use o login e a senha recebidos do professor. Para acompanhar as equipes, escolha o acesso do professor abaixo.'),
      h('label', { class: 'field' }, 'Login da equipe', login),
      h('label', { class: 'field' }, 'Senha', pass),
      err,
      h('button',{class:'btn ghost',type:'button',onclick:()=>m.close()},'← Voltar à abertura'),
      h('button', { class: 'btn block', type: 'submit' }, 'Entrar na missão'),
      h('button', { class: 'linkbtn', type: 'button', onclick: () => { m.close(); app.showSetup(); } }, 'Ainda não tem equipe? O professor cadastra aqui.'),h('button',{class:'btn ghost',type:'button',onclick:()=>{m.close();app.showMentor()}},'Sou professor • acompanhar equipes'));
    form.onsubmit = async e => {
      e.preventDefault(); err.textContent = '';
      const t = await backend().loginTeam(login.value, pass.value);
      if (!t) { err.textContent = 'Login ou senha não conferem.'; return; }
      app.setTeam(t); m.close(); app.enterTeam();
    };
    const m = modal(form);
  };

  const demo = async () => {
    void audio.activate(true);
    const body=h('div',{class:'panel modal'},h('h2',{},'Como deseja explorar a demo?'),h('p',{},'Veja o desafio inteiro pronto ou jogue o percurso desde o início.'));
    const box=modal(body);body.append(h('button',{class:'btn',onclick:()=>{box.close();void app.showCompletedDemo()}},'Ver desafio concluído • 9 etapas e 6 personagens'),h('button',{class:'btn ghost',onclick:async()=>{box.close();const t=await createDemoTeam();app.setTeam(t);await app.showPilot('mobility')}},'Jogar o percurso na cidade'));

  };

  const root = h('div', { class: 'screen opening game-landing espia-opening-v31' },
    gdfIdentity(),
    developerCorner(),

    h('div', { class: 'hero' },
      h('div', { class: 'eyebrow' }, 'CONTROLE SOCIAL • CIDADANIA • AÇÃO'),
      h('h1', { class: 'reveal' }, h('span', { class: 'game-title-df' }, 'ESPIA'), h('span', { class: 'game-title-action' }, 'DF')),
      h('button',{class:'start-sound',onclick:()=>void audio.activate(true)},'♫ ATIVAR TRILHA DO GAME'),
      h('p',{class:'demo-hero-copy'},'Uma cidade de desafios. Uma experiência de participação cidadã.'),h('div', { class: 'tagline' },
        h('span', {}, 'Entre na cidade. ', h('b', {}, 'Mude a história.'))),
      h('div', { class: 'ctas' },
        h('button', { class: 'btn', onclick: demo }, '▶ JOGAR DEMO • MEU CAMINHO PELA CIDADE'),
        h('div',{class:'teacher-registration'},h('button', { class: 'btn ghost', onclick: () => app.showSetup() }, 'CADASTRAR EQUIPE E ESCOLHER AVATARES'),h('small',{},'Cadastro realizado pelo professor.')))),
    h('div', { class: 'opening-foot' },
      h('nav', { class: 'access', 'aria-label':'Acessos do jogo' },
        h('button', { class: 'linkbtn', onclick: loginModal }, 'Entrar'),
        h('button', { class: 'linkbtn', onclick: () => { location.hash = 'admin'; app.showAdmin(); } }, 'Administração'),
        h('button', { class: 'linkbtn', onclick: openSettings }, 'Acessibilidade'))));
  return root;
}

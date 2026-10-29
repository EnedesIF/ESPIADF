import {completedDemo} from '@/services/completedDemo';
import {completedDemoScreen} from './challenge/CompletedDemo';
import {relayDashboard} from './challenge/RelayDashboard';
import {activeChallengeCase} from '@/services/parkChallenge';
import {challengeChoice} from './challenge/ChallengeChoice';
import {relayRoute} from '@/data/relayChallenges';
import {selectRoute} from '@/services/gdfRoutes';
import {createDemoTeam,playableDemoFor} from '@/services/demo';
import {ParkChallengeScene as PilotScene} from './challenge/ParkChallengeScene';
import {routeChoice} from './v02/RouteChoice';
import {selectedRoute} from '@/services/gdfRoutes';
import {demoControls,isDemo} from './demo/DemoControls';
import {mentorLearning} from './v02/LearningUI';
import {storyStep} from '@/services/demoJourney';
import {renderCentral} from './v02/Central';
import {availability,reserveChallenge} from '@/services/missionCapacity';
import {modal} from '@/components/Modal';
import {audio} from '@/systems/AudioSystem';
import { CityMission } from '@/game/CityMission';
import * as THREE from 'three';
import { Engine } from '@/game/Engine';
import { CameraRig } from '@/game/CameraRig';
import { applySettings } from '@/game/Settings';
import { CityWorld } from '@/worlds/CityWorld';
import { initBackend, backend } from '@/services/backend';
import { setCampaignOverrides, getCampaign, getCampaigns } from '@/data/campaigns';
import type { Team, CampaignId } from '@/types';
import { GameContext } from '@/systems/GameContext';
import { GameScene } from '@/game/GameScene';
import { h, clear } from './dom';
import { renderOpening } from './screens/Opening';
import { renderTeamSetup } from './screens/TeamSetup';
import { renderAvatarCreator } from './screens/AvatarCreator';
import { renderHub } from './screens/Hub';
import { renderMissionBriefing } from './screens/MissionBriefing';
import { renderCityTeacher as renderMentor } from './screens/CityDashboard';
import { renderAdmin } from './screens/Admin';
import { GameUI } from './game/GameUI';

const CURRENT = 'missaodf:currentTeam';

/** Controla as telas e o ciclo de vida do jogo. */
export class App {
  engine!: Engine;
  world!: CityWorld;
  rig!: CameraRig;
  ui: HTMLElement;
  team: Team | null = null;
  game: GameScene | null = null;
  city: CityMission | null = null;
  private pilot: PilotScene | null = null;
  private activeRelayRoute='park';
  gameUI: GameUI | null = null;
  private bgUpdate: (() => void) | null = null;

  constructor(private stage: HTMLElement, ui: HTMLElement) { this.ui = ui; }

  async start() {
    applySettings();
    await initBackend();
    try { setCampaignOverrides(await backend().getCampaignOverrides()); } catch { /* ok */ }
    try { const id=localStorage.getItem(CURRENT); if(id)this.team=await backend().getTeam(id); } catch {}
    if(location.hash==='#central'){this.mount(renderCentral(this,true));return}
    const canvas = h('canvas', { 'aria-label': 'Cena 3D do jogo' });
    this.stage.append(canvas);
    try {
      this.engine = new Engine(canvas);
    } catch (e) {
      this.ui.append(h('div', { class: 'screen', style: { display: 'grid', placeItems: 'center', padding: '24px' } },
        h('div', { class: 'panel', style: { maxWidth: '520px' } },
          h('div', { class: 'eyebrow' }, 'WEBGL INDISPONÍVEL'),
          h('h2', { class: 'display' }, 'Este navegador não conseguiu iniciar o 3D.'),
          h('p', { class: 'muted' }, 'Atualize o navegador (Chrome, Edge ou Firefox recentes) ou ative a aceleração de hardware nas configurações.'))));
      return;
    }
    this.world = new CityWorld();
    this.rig = new CameraRig(this.engine.camera);
    this.engine.setScene(this.world.scene);
    this.engine.start();
    // retoma equipe logada
    try {
      const id = localStorage.getItem(CURRENT);
      if (id) this.team = await backend().getTeam(id);
    } catch { /* ok */ }
    const hash = location.hash.replace('#', '');
    if (hash === 'mentor') return this.showMentor();
    if (hash === 'admin') return this.showAdmin();
    this.showOpening();
  }

  /* ---------- fundo cinematográfico ---------- */
  background(mode: 'night' | 'day' | 'none') {
    this.bgUpdate?.(); this.bgUpdate = null;
    if (mode === 'none') return;
    this.engine.setIllustrated(false);
    this.engine.setScene(this.world.scene);
    this.world.setTimeOfDay(mode === 'night' ? 'night' : 'morning');
    this.rig.mode = 'orbit';
    this.rig.orbitCenter.set(-30, 0, -10);
    this.rig.orbitRadius = mode === 'night' ? 105 : 85;
    this.rig.orbitHeight = mode === 'night' ? 42 : 52;
    this.bgUpdate = this.engine.add((dt, t) => { this.rig.update(dt, t); this.world.update(dt, t, this.rig.orbitCenter); });
  }

  mount(el: HTMLElement) { clear(this.ui); this.ui.append(el); if(isDemo(this.team))this.ui.append(demoControls(this)); }

  setTeam(t: Team | null) {
    this.team = t;
    try { if (t) localStorage.setItem(CURRENT, t.id); else localStorage.removeItem(CURRENT); } catch { /* ok */ }
  }

  async showPilot(campaign?:CampaignId){this.leaveGame();this.background('none');if(!this.team)this.setTeam(await createDemoTeam());this.mount(challengeChoice(this,campaign))}
  async showChallenge(routeId:string){if(!this.team)this.setTeam(await createDemoTeam());const requested=relayRoute(routeId);if(isDemo(this.team)&&this.team!.id!=='espia-playable-demo-'+routeId)this.setTeam(await playableDemoFor(routeId));const route=activeChallengeCase(this.team!,requested.campaign)??requested;if(!(await reserveChallenge(this.team!.id,route.campaign))){await this.startCity(route.campaign);return}this.activeRelayRoute=route.id;if(selectedRoute(this.team!.id,route.campaign)?.id!==route.id)selectRoute(this.team!.id,route.campaign,route.id,route.question);this.leaveGame();this.background('none');this.engine.setIllustrated(true);this.pilot=new PilotScene(this.team!,()=>void this.showPilot(route.campaign),mode=>this.showPilotReview(mode),route.id,memberId=>this.showAvatar('hub',memberId,()=>void this.showChallenge(route.id)));this.mount(this.pilot.root)}
  showPilotReview(mode:'teacher'|'admin'){if(!this.team?.name.includes('(demo)'))return;this.leaveGame();this.background('none');this.mount(h('div',{class:'screen dash'},h('button',{class:'btn',onclick:()=>void this.showChallenge(this.activeRelayRoute)},'← Voltar ao percurso e ao revezamento'),h('h1',{},mode==='teacher'?'Professor • demonstração local':'GDF • demonstração local'),relayDashboard(mode,this.team.mentor.email)))}
  async showCompletedDemo(routeId='park'){const team=await completedDemo(routeId);this.setTeam(team);this.leaveGame();this.background('none');this.engine.setIllustrated(true);this.mount(completedDemoScreen(this,team,routeId))}
  showOpening() { storyStep(1);this.leaveGame(); this.background('night'); this.mount(renderOpening(this)); }
  showSetup() { this.leaveGame(); this.background('day'); this.mount(renderTeamSetup(this)); }
  showAvatar(after: 'hub' | 'setup' = 'hub',memberId?:string,onDone?:()=>void) {storyStep(3); this.leaveGame(); this.background('none'); this.mount(renderAvatarCreator(this, after,memberId,onDone)); }
  enterTeam() {
    if (!this.team) return this.showOpening();
    if (!localStorage.getItem('missaodf:avatarReady:' + this.team.id)) return this.showAvatar('hub');
    this.showHub();
  }
  showCentral() { storyStep(29);this.leaveGame(); this.background('none'); this.mount(renderCentral(this)); }
  showHub() {
    storyStep(4);this.leaveGame();
    this.background('day'); this.mount(renderHub(this));
  }
  showBriefing(id: CampaignId) { this.leaveGame(); this.background('night'); this.mount(renderMissionBriefing(this, id)); }
  showDemoMentor(){this.leaveGame();this.background('none');storyStep(32);const root=h('div',{class:'screen dash demo-teacher'},h('header',{},h('div',{},h('span',{class:'eyebrow'},'VISÃO DO PROFESSOR • DEMONSTRAÇÃO'),h('h1',{},'Evidências, raciocínio e devolutivas'))),h('p',{class:'sim-badge'},'Mentoria local da equipe fictícia. O percurso concluído contém avaliações de exemplo; nas equipes jogáveis, professor e GDF validam cada entrega.'),relayDashboard('teacher',this.team?.mentor.email));this.mount(root)}
  showDemoAdmin(){this.leaveGame();this.background('none');this.mount(h('div',{class:'screen dash'},h('h1',{},'Administração • demonstração'),relayDashboard('admin')))}
  showMentor() { this.leaveGame(); this.background('none'); this.engine.setScene(new THREE.Scene()); this.mount(renderMentor(this)); }
  showAdmin() { this.leaveGame(); this.background('none'); this.engine.setScene(new THREE.Scene()); this.mount(renderAdmin(this)); }

  showRouteChoice(id:CampaignId){this.leaveGame();this.background('none');this.mount(routeChoice(this,id))}
  async startCity(id: CampaignId) {
    if (!this.team) return this.showOpening();
    if(!(await reserveChallenge(this.team.id,id))){audio.play('alert');let dialog:ReturnType<typeof modal>;const alternatives=getCampaigns().filter(c=>c.available&&c.id!==id&&!availability(c.id,this.team!.id).full);dialog=modal(h('div',{class:'capacity-popup'},h('span',{class:'eyebrow'},'DESAFIO LOTADO'),h('h2',{},'Escolha outro desafio'),h('p',{},'Este desafio já tem 3 equipes. Escolha outro para entrar na competição.'),...alternatives.map(c=>h('button',{class:'btn block',onclick:()=>{dialog.close();void this.startCity(c.id)}},c.title+' • '+availability(c.id,this.team!.id).remaining+' vaga(s)')),alternatives.length?null:h('p',{},'Todos os desafios atingiram o limite. Consulte o professor para organizar outra rodada.'),h('button',{class:'btn ghost',onclick:()=>dialog.close()},'Voltar à seleção')));return}
    if(!selectedRoute(this.team.id,id)){this.leaveGame();this.background('none');this.mount(routeChoice(this,id));return}
    await this.showChallenge(selectedRoute(this.team.id,id)!.id);
  }

  async startCampaign(id: CampaignId) {
    if (!this.team) return this.showOpening();
    const campaign = getCampaign(id);
    let session = await backend().getSession(this.team.id, id);
    if (!session) session = GameContext.newSession(this.team, campaign);
    // campos novos em sessões antigas
    session.messages ??= []; session.appliedMentorActions ??= []; session.flagTimes ??= {};
    const ctx = new GameContext(session, campaign, this.team);
    ctx.save(true);
    this.background('none');
    this.game = new GameScene(this.engine, this.world, ctx);
    this.gameUI = new GameUI(this, this.game);
    this.mount(this.gameUI.root);
    ctx.log('campaign_started', { campaign: id, resumed: session.evidences.length > 0 });
  }

  leaveGame() {
    this.pilot?.dispose();this.pilot=null;
    if (this.city) { this.city.dispose(); this.city = null; }
    if (this.gameUI) { this.gameUI.dispose(); this.gameUI = null; }
    if (this.game) { this.game.dispose(); this.game = null; }
  }
}

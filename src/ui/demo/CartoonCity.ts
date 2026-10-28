import {walkable,ACCESS,CROSSING_NORTH,CROSSING_SOUTH,enteringCrossing,pedestrianWindow,onStairs} from './WalkableCity';
import {audio} from '@/systems/AudioSystem';
import {NPC_FEET} from './SceneSpacing';
import {IllustratedTraffic,roadPose,busOccupies,depthAt} from './IllustratedTraffic';
import {GROUND_ANCHORS,GroundWalker,groundScale} from './CartoonGround';
import {CityResident,ACTIVITY_LABELS} from './CityResidents';
import {cartoonAvatar,cartoonLook} from './CartoonAvatar';
import type {CampaignId,Member} from '@/types';
import {h,clear} from '../dom';
type Point={x:number;z:number};
export const CARTOON_ANCHORS=GROUND_ANCHORS;
/** Illustrated 2.5D presentation. The mission keeps its real navigation, proximity and state. */
export class CartoonCity{
 readonly root:HTMLElement;
 private hero=h('div',{class:'cartoon-hero','aria-hidden':'true'},h('div',{class:'cartoon-hero-shadow'}),h('div',{class:'cartoon-hero-sprite'}));
 private buttons=new Map<string,HTMLButtonElement>();
 private caption=h('div',{class:'cartoon-caption'});
 readonly walker=new GroundWalker();
 private world=h('div',{class:'cartoon-world'});
 private travelState=h('div',{class:'city-travel-state',role:'status','aria-live':'polite'});
 private activeTarget='contact';
 private phase='';
 private direction:[number,number]=[0,0];
 private keyDirection:[number,number]=[0,0];
 private controls=h('nav',{class:'city-walk-pad','aria-label':'Controles de movimento do personagem'});
 private manualChange:()=>void=()=>{};
 private squad:{member:Member;node:HTMLElement;walker:GroundWalker;routine:CityResident;card:HTMLElement;status:HTMLElement;shown:boolean}[]=[];
 private controller:()=>string=()=>'';
 private heroName=h('span',{class:'squad-name'});
 private heroArt:HTMLElement|undefined;
 private currentMember='';
 private greeted=new Set<string>();
 private busStates:string[]=[];
 private ambientAge=0;
 private streetPanel=h('button',{class:'street-terminal','aria-label':'Caminhar até o painel digital da parada'},h('span',{},'214'),h('small',{},'LINHAS • TOQUE'),h('i',{'aria-hidden':'true'}));
 private streetStatus=h('div',{class:'street-status','aria-hidden':'true'},h('span',{class:'street-status-dot'}),h('span',{},'PARADA 214'));
 private project=h('div',{class:'street-project',hidden:true},h('b',{},'PROPOSTA DA EQUIPE'),h('small',{},'SIMULAÇÃO • consulte o dossiê'));
 private encounterNote=h('div',{class:'city-encounter-note',role:'status','aria-live':'polite'});
 private noteAge=0;
 private explore=h('nav',{class:'city-neighborhoods','aria-label':'Explorar setores da cidade'});
 private destination:{label:string;point:[number,number];station?:string;arrived:boolean}|null=null;
 private destinationMarker=h('div',{class:'city-destination-marker',hidden:true,'aria-hidden':'true'},'◆');
 private destinationCard=h('section',{class:'city-destination-card',hidden:true,'aria-label':'Destino selecionado'});
 private time=0;
 private arrivalKey='';
 private arrivalAge=0;
 private arrivalBurst=h('div',{class:'target-arrival-burst',hidden:true,'aria-hidden':'true'},h('span',{},'★'),h('i',{},'✦'),h('i',{},'✧'));
 private arrivalBanner=h('div',{class:'target-arrival-banner',hidden:true,role:'status','aria-live':'polite'},h('b',{},'★ ALVO ALCANÇADO!'),h('span',{},'Boa! Agora converse e descubra o próximo passo.'));
 arrivalReady(name:string){return this.arrivalKey===this.phase+':'+name&&this.arrivalAge>=1.2}

 private fast=false;
 private controlsHidden=false;
 private controlsRight=false;
 private controlsToggle=h('button',{class:'city-controls-toggle','aria-expanded':'true',onclick:()=>{this.controlsHidden=!this.controlsHidden;this.controlsToggle.textContent=this.controlsHidden?'🎮 Mostrar controle':'Ocultar controle';this.controlsToggle.setAttribute('aria-expanded',String(!this.controlsHidden));this.pauseMovement();}},'Ocultar controle');
 private sprintKey=false;
 private routeDots=Array.from({length:12},()=>h('i',{class:'city-route-dot',hidden:true,'aria-hidden':'true'}));
 private currentZone:'praca'|'calcadao'|'servicos'='praca';
 private zoneFor(name:string){return ['research','mentor'].includes(name)?'servicos':['witness','verify'].includes(name)?'calcadao':'praca'}
 private enterZone(name:string){this.currentZone=this.zoneFor(name);this.root.setAttribute('data-neighborhood',this.currentZone);this.walker.zone=this.id==='mobility'||this.currentZone!=='praca'?this.currentZone:this.id;Array.from(this.explore.children).filter(b=>b.getAttribute?.('data-station')).forEach(b=>b.setAttribute('aria-pressed',String(this.zoneFor(b.getAttribute('data-station')!)===this.currentZone)))}
 targetHere(name:string){return this.zoneFor(name)===this.currentZone}
 switchEnvironment(name:string,label:string){this.pauseMovement();this.enterZone(name);this.walker.position=[39,77];this.arrivalKey='';this.arrivalBurst.hidden=true;this.arrivalBanner.hidden=true;this.encounterNote.textContent='📍 '+label;this.noteAge=3;this.root.classList.remove('environment-enter');void this.root.offsetWidth;this.root.classList.add('environment-enter');audio.play('message')}

 readonly road=new IllustratedTraffic();
 private buses:HTMLElement[]=[];
 private signal=h('div',{class:'illustrated-signal','aria-label':'Semáforo da via'},h('i',{class:'red'}),h('i',{class:'green'}));
 private actors=new Map<string,HTMLButtonElement>();
 constructor(private id:CampaignId,stations:Map<string,Point>,labels:Record<string,string>,navigate:(id:string)=>void,manualChange:()=>void=()=>{},private observeLocation:(label:string)=>void=()=>{}){
  this.manualChange=()=>{manualChange();this.cancelDestination()};this.walker.zone=this.id==='mobility'?'praca':this.id;this.walker.allow=(from,to)=>this.safeStep(from,to);
  this.project.hidden=true;
  this.root=h('section',{class:'cartoon-city cartoon-'+id,'aria-label':'Cidade ilustrada interativa'},this.world);
  this.world.addEventListener('click',(e:MouseEvent)=>{if(this.root.classList.contains('conversation')||(e.target as HTMLElement).closest('button,a,input,textarea,select'))return;const box=this.world.getBoundingClientRect();const point:[number,number]=[(e.clientX-box.left)/box.width*100,(e.clientY-box.top)/box.height*100];this.manualChange();this.direction=[0,0];this.keyDirection=[0,0];this.walker.stop();if(walkable(point,this.walker.zone)&&this.walker.explore(point)){this.showDestination('Explorar a cidade',point)}else{this.encounterNote.textContent='Escolha uma calçada, praça ou acesso. Prédios e vias fora da faixa não são destinos de caminhada.';this.noteAge=4}});
this.world.append(h('div',{class:'cartoon-scenery','aria-hidden':'true'}),h('div',{class:'cartoon-atmosphere','aria-hidden':'true'}));
  if(id==='mobility')this.world.append(h('div',{class:'cartoon-location location-school','aria-hidden':'true'}),h('div',{class:'cartoon-location location-civic','aria-hidden':'true'}));
  for(const [name] of stations){const [x,y]=CARTOON_ANCHORS[name];const button=h('button',{class:'cartoon-place',style:{left:x+'%',top:(y-21)+'%'},onclick:(e:Event)=>{e.stopPropagation();navigate(name)},'aria-label':'Caminhar até '+labels[name]},h('span',{class:'cartoon-place-icon','aria-hidden':'true'},name==='inspect'?'⌕':name==='research'?'▤':name==='mentor'?'✉':'●'),h('b',{},labels[name]));button.hidden=true;this.buttons.set(name,button);this.world.append(button)}
  for(const [name,variant] of [['contact','lia'],['witness','caio'],['research','tech'],['mentor','tech']]){const [x,y]=NPC_FEET[name];const actor=h('button',{class:'cartoon-npc npc-'+variant,style:{left:x+'%',top:y+'%','--ground-x':x+'%','--ground-y':y+'%','--ground-scale':String(groundScale(y)),'zIndex':String(Math.round(y))},'aria-label':'Ir conversar com '+labels[name],onclick:()=>navigate(name)},h('span',{class:'cartoon-npc-shadow'}),h('span',{class:'cartoon-npc-sprite','aria-hidden':'true'}));actor.hidden=true;this.actors.set(name,actor);this.world.append(actor)}
  this.hero.hidden=true;this.world.append(this.hero,this.project);if(id==='mobility'){this.streetPanel.addEventListener('click',()=>navigate('inspect'));this.world.append(this.streetPanel,this.streetStatus)}this.world.append(this.destinationMarker,...this.routeDots,this.arrivalBurst);this.root.append(this.arrivalBanner);this.root.append(this.caption,this.encounterNote,this.explore,this.destinationCard);
  this.explore.append(h('small',{},'AMBIENTES'));
  for(const [label,station] of [[{mobility:'Praça e parada',work:'Estação e mural',territory:'Praça e quadra',health:'Vila e UBS'}[id],'contact'],['Calçadão','witness'],['Serviços públicos','research']]){
   this.explore.append(h('button',{class:'environment-switch','data-station':station,'aria-pressed':String(station==='contact'),onclick:()=>this.switchEnvironment(station,label)},label));
  }
  this.explore.append(h('small',{},'EXPLORAR'));
  for(const [label,target] of (id==='mobility'?[['Atravesse na faixa','crossing'],['Escadas / entrada','entrance']]:id==='work'?[['Acesso ao metrô','secondary'],['Escadas da agência','entrance']]:id==='health'?[['Pátio da UBS','secondary'],['Escadas da UBS','entrance']]:[['Quadra e PEC','entrance'],['Caminho da horta','secondary']])){
   this.explore.append(h('button',{onclick:()=>{
    this.manualChange();this.direction=[0,0];this.keyDirection=[0,0];if(this.id!=='mobility')this.enterZone('contact');
    const point:[number,number]=target==='crossing'?(this.walker.position[1]<57?CROSSING_SOUTH:CROSSING_NORTH):target==='secondary'?(id==='work'?[17,61]:id==='territory'?[69,61]:[75,63]):(ACCESS[this.walker.zone]??ACCESS.praca)[2];
    this.walker.go(point);this.showDestination(label,point);
   }},label));
  }
  if(id==='mobility'){for(let i=0;i<2;i++){const bus=h('div',{class:'illustrated-bus',role:'img','aria-label':'Ônibus em circulação'},h('div',{class:'bus-art'}));this.buses.push(bus);this.world.append(bus)}this.world.append(this.signal,h('div',{class:'traffic-occluder','aria-hidden':'true'}))}
  this.world.append(h('div',{class:'city-foliage foliage-left','aria-hidden':'true'}),h('div',{class:'city-foliage foliage-right','aria-hidden':'true'}),h('div',{class:'city-foliage foliage-center','aria-hidden':'true'}));
  for(const [label,dx,dy,glyph] of [['Caminhar para cima',0,-1,'↑'],['Caminhar para esquerda',-1,0,'←'],['Parar personagem',0,0,'■'],['Caminhar para direita',1,0,'→'],['Caminhar para baixo',0,1,'↓']] as const){
   const button=h('button',{class:'walk-key walk-'+glyph,'aria-label':label,title:label,onclick:(e:MouseEvent)=>{if(e.detail>0)return;this.manualChange();this.walker.stop();if(dx||dy){const from:[number,number]=[...this.walker.position];for(let step=0;step<5;step++)this.walker.steer(dx,dy,.1);const to:[number,number]=[...this.walker.position];this.walker.position=from;this.walker.path=[to];this.walker.moving=true}}},glyph);
   button.addEventListener('pointerdown',(e:PointerEvent)=>{e.preventDefault();this.manualChange();this.direction=[dx,dy];this.walker.stop();button.setPointerCapture?.(e.pointerId)});
   const release=()=>{this.direction=[0,0];this.walker.stop()};button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);this.controls.append(button);
  }
  this.controls.append(h('button',{class:'walk-interact','aria-label':'Interagir com o objetivo',onclick:()=>{if(this.destination?.arrived&&this.destination.station!==this.activeTarget)this.observeLocation(this.destination.label);else navigate(this.activeTarget)}},'E • Interagir')); 
  this.controls.append(h('button',{class:'walk-pace','aria-pressed':'false',onclick:(e:Event)=>{this.fast=!this.fast;const b=e.currentTarget as HTMLButtonElement;b.setAttribute('aria-pressed',String(this.fast));b.textContent=this.fast?'⚡ Ritmo rápido':'♧ Caminhada';}},'♧ Caminhada'));
  const handle=h('button',{class:'walk-drag','aria-label':'Arrastar controle',title:'Arraste para reposicionar o controle'},'⠿ Arrastar controle');
  let drag:{x:number;y:number;left:number;top:number}|null=null;
  handle.addEventListener('pointerdown',(e:PointerEvent)=>{e.preventDefault();this.pauseMovement();const r=this.controls.getBoundingClientRect(),parent=this.root.getBoundingClientRect();drag={x:e.clientX,y:e.clientY,left:r.left-parent.left,top:r.top-parent.top};handle.setPointerCapture?.(e.pointerId)});
  handle.addEventListener('pointermove',(e:PointerEvent)=>{if(!drag)return;const x=Math.max(0,Math.min(this.root.clientWidth-this.controls.offsetWidth,drag.left+e.clientX-drag.x)),y=Math.max(0,Math.min(this.root.clientHeight-this.controls.offsetHeight,drag.top+e.clientY-drag.y));Object.assign(this.controls.style,{left:x+'px',top:y+'px',right:'auto',bottom:'auto'})});
  const endDrag=()=>{drag=null};handle.addEventListener('pointerup',endDrag);handle.addEventListener('pointercancel',endDrag);this.controls.append(handle);
  this.controls.append(h('button',{class:'walk-position' ,onclick:()=>{this.controlsRight=!this.controlsRight;Object.assign(this.controls.style,{left:'',top:'',right:'',bottom:''});this.root.classList.toggle('controls-right',this.controlsRight);}},'⇄ Mudar de lado'));
  this.root.append(this.controls,this.controlsToggle,this.travelState);
  this.world.append(h('div',{class:'city-cloud-shadow','aria-hidden':'true'}),h('div',{class:'city-birds','aria-hidden':'true'},'⌁  ⌁   ⌁'));

 }
 private safeStep(from:[number,number],to:[number,number]){
  if(this.id!=='mobility')return true;
  if(enteringCrossing(from,to)&&!pedestrianWindow(this.road.clock))return false;
  return !this.road.buses.some(bus=>busOccupies(to,bus.s,this.currentZone));
 }
 private trafficCanMove(s:number,next:number){
  if(this.id!=='mobility')return true;
  const pedestrians=[this.walker.position,...this.squad.filter(person=>person.shown).map(person=>person.walker.position)];
  return !pedestrians.some(point=>!busOccupies(point,s,this.currentZone)&&busOccupies(point,next,this.currentZone));
 }
 configureTeam(members:Member[],controller:()=>string,choose:(memberId?:string)=>void){
  this.controller=controller;this.hero.classList.add('squad-leader');this.hero.append(this.heroName);
  const roster=h('details',{class:'city-squad-roster'},h('summary',{},'Equipe • '+members.length+' integrantes'),h('small',{},'Revezamento: somente o responsável atual entra em cena.'));
  members.forEach((member,i)=>{
   const look=cartoonLook(member.avatar.cartoonLook,i),art=cartoonAvatar(look,'',member.avatar),routine=new CityResident(i,look);
   routine.extended=true;routine.walker.zone=this.id==='mobility'?routine.zone:this.id;routine.walker.allow=(from,to)=>this.safeStep(from,to);
   const node=h('button',{class:'squad-companion activity-'+look,'aria-label':member.name+' • '+ACTIVITY_LABELS[look],onclick:()=>choose(member.id)},h('span',{class:'cartoon-hero-shadow'}),art,h('span',{class:'squad-name'},member.name.split(' ')[0]));
   const status=h('small',{},'Explorando o bairro');
   const card=h('button',{class:'squad-member',onclick:()=>choose(member.id),'aria-label':'Ver tarefas e localização de '+member.name},cartoonAvatar(look),h('span',{},member.name.split(' ')[0]),status);
   node.hidden=true;this.world.append(node);roster.append(card);this.squad.push({member,node,walker:routine.walker,routine,card,status,shown:false});
  });this.root.append(roster);
 }
 /** The controlled avatar alone responds to destination clicks. */
 keyboard(keys:Set<string>,dt:number){this.sprintKey=keys.has('shift');const x=(keys.has('arrowright')||keys.has('d')?1:0)-(keys.has('arrowleft')||keys.has('a')?1:0),y=(keys.has('arrowdown')||keys.has('s')?1:0)-(keys.has('arrowup')||keys.has('w')?1:0);this.keyDirection=[x,y];if(x||y){this.manualChange();return true}return false}
 goTo(name:string){this.direction=[0,0];this.keyDirection=[0,0];this.enterZone(name);this.walker.go(CARTOON_ANCHORS[name]);this.showDestination(this.buttons.get(name)?.textContent??name,CARTOON_ANCHORS[name],name);}
 private cancelDestination(){this.destination=null;this.destinationCard.hidden=true;this.destinationMarker.hidden=true;Array.from(this.explore.children).filter(b=>b.tagName==='BUTTON').forEach(b=>b.removeAttribute('aria-current'))}
 private showDestination(label:string,point:[number,number],station?:string){
  this.destination={label,point:[...point],station,arrived:false};
  this.destinationMarker.style.left=point[0]+'%';this.destinationMarker.style.top=point[1]+'%';
  this.destinationMarker.hidden=false;this.renderDestination(false);
  Array.from(this.explore.children).filter(b=>b.tagName==='BUTTON').forEach(b=>b.setAttribute('aria-current',String(b.textContent===label)));
 }
 private renderDestination(arrived:boolean){
  const d=this.destination;if(!d)return;d.arrived=arrived;clear(this.destinationCard);
  this.destinationCard.append(h('small',{role:'status','aria-live':'polite'},arrived?'VOCÊ CHEGOU':'DESTINO SELECIONADO'),h('b',{},d.label));
  this.destinationCard.append(h('p',{},arrived?(d.station===this.activeTarget?'Objetivo da etapa disponível neste local.':d.station?'Você pode observar este local. As tarefas seguem a ordem da missão.':'Ponto de observação neste ambiente. Explore os detalhes do local.'):'Siga o marcador ◆. O avatar está a caminho.'));
  this.destinationCard.append(h('button',{onclick:()=>{if(arrived){if(d.station===this.activeTarget)this.buttons.get(d.station)?.click();else this.observeLocation(d.label)}else{this.manualChange();this.walker.stop()}}},arrived?(d.station===this.activeTarget?'Interagir com o objetivo':'Observar local'):'Cancelar percurso'));
 }

 pauseMovement(){this.manualChange();this.direction=[0,0];this.keyDirection=[0,0];this.walker.stop()}
 memberStation(memberId:string){return this.squad.find(s=>s.member.id===memberId)?.routine.nearestStation()??'contact'}
 memberActivity(memberId:string){const s=this.squad.find(s=>s.member.id===memberId);return s?ACTIVITY_LABELS[s.routine.activity]:''}

 setProject(title:string){this.project.hidden=false;this.project.setAttribute('aria-label','Proposta simulada: '+title);this.project.title=title;this.project.classList.add('installed')}
 clueSpot(index:number):[number,number]{return ([[48,76],[58,80],[66,83],[90,82]] as [number,number][])[index%4]}
 clueDistance(index:number){if(this.zoneFor(['inspect','witness','verify','research'][index%4])!==this.currentZone)return Infinity;const p=this.clueSpot(index);return Math.hypot(p[0]-this.walker.position[0],p[1]-this.walker.position[1])}
 goToClue(index:number){this.direction=[0,0];this.enterZone(['inspect','witness','verify','research'][index%4]);this.cancelDestination();this.walker.go(this.clueSpot(index))}
 mountClue(node:HTMLElement,index:number){const p=this.clueSpot(index);node.classList.add('street-clue');node.style.left=p[0]+'%';node.style.top=p[1]+'%';this.world.append(node)}
 distanceTo(name:string){const p=CARTOON_ANCHORS[name];return p?Math.hypot(p[0]-this.walker.position[0],p[1]-this.walker.position[1]):Infinity}
 get arrived(){return this.walker.arrived}
 update(player:Point,stations:Map<string,Point>,active:string,overlay:boolean,speed:number,phase:string,heading:number,dt=0){
  this.activeTarget=active;this.controls.hidden=overlay||this.controlsHidden;this.controlsToggle.hidden=overlay;if(overlay){this.direction=[0,0];this.keyDirection=[0,0]}
  this.walker.pace=this.fast||this.sprintKey?1.65:.8;this.root.classList.toggle('fast-walk',this.walker.pace>1.2);
  this.routeDots.forEach((dot,i)=>{const point=this.walker.path[i];dot.hidden=overlay||!point;if(point){dot.style.left=point[0]+'%';dot.style.top=point[1]+'%'}});
  const movement=this.keyDirection[0]||this.keyDirection[1]?this.keyDirection:this.direction;
  if(!overlay&&(movement[0]||movement[1]))this.walker.steer(...movement,dt);else this.walker.advance(dt,overlay);this.road.update(dt,overlay,(s,next)=>this.trafficCanMove(s,next));
  if(this.destination&&!this.destination.arrived&&this.walker.arrived&&Math.hypot(this.walker.position[0]-this.destination.point[0],this.walker.position[1]-this.destination.point[1])<1)this.renderDestination(true);
  this.destinationCard.hidden=overlay||!this.destination;this.destinationMarker.hidden=overlay||!this.destination;
  const interactButton=this.controls.querySelector('.walk-interact') as HTMLButtonElement|null;if(interactButton){const near=this.targetHere(active)&&this.distanceTo(active)<=5&&this.walker.arrived;interactButton.hidden=!near;interactButton.textContent='E • Conversar / interagir'}
  this.destinationMarker.classList.toggle('arrived',!!this.destination?.arrived);
  this.ambientAge+=overlay?0:dt;
  if(!overlay&&this.ambientAge>17){this.ambientAge=0;audio.world('bird',.16,-.45)}
  this.streetPanel.hidden=this.currentZone!=='praca'||overlay;this.streetStatus.hidden=this.currentZone!=='praca'||overlay;
  this.streetPanel.classList.toggle('terminal-near',Math.hypot(this.walker.position[0]-45,this.walker.position[1]-76)<15);
  const boarding=this.road.buses.some(b=>b.status==='embarque no ponto');this.streetStatus.textContent=boarding?'214 • EMBARQUE NO PONTO':'214 • EM CIRCULAÇÃO';
  this.streetStatus.classList.toggle('boarding',boarding);
  this.signal.classList.toggle('green-on',this.road.green);this.signal.setAttribute('aria-label',this.road.green?'Semáforo verde para os veículos':'Semáforo vermelho para os veículos');
  this.buses.forEach((bus,i)=>{const state=this.road.buses[i],pose=roadPose(state.s,this.currentZone);bus.style.left=pose.x+'%';bus.style.top=pose.y+'%';bus.style.opacity=String(pose.opacity);bus.style.zIndex=String(depthAt(pose.y));bus.style.setProperty('--bus-scale',String(pose.scale));bus.style.setProperty('--bus-skew',pose.skew+'deg');bus.setAttribute('aria-label','Ônibus • '+state.status);bus.classList.toggle('bus-stopped',state.status!=='circulando');if(!overlay&&this.busStates[i]!==state.status&&pose.opacity>.4){audio.world(state.status==='embarque no ponto'?'busDoor':'bus',Math.max(.06,.2-Math.abs(pose.x-this.walker.position[0])*.003),Math.max(-1,Math.min(1,(pose.x-this.walker.position[0])/45)))}this.busStates[i]=state.status});

  const controller=this.controller();
  // Presence belongs to a district, never to a proximity or dialogue threshold.
  for(const [name,actor] of this.actors){const show=this.zoneFor(name)===this.currentZone&&(!['research','mentor'].includes(name)||name===active);actor.hidden=!show;actor.classList.toggle('current',name===active);const foot=NPC_FEET[name],near=show&&Math.hypot(foot[0]-this.walker.position[0],foot[1]-this.walker.position[1])<13;actor.classList.toggle('welcoming',near&&!overlay);actor.style.setProperty('--look-turn',this.walker.position[0]<foot[0]?'-2deg':'2deg');const key=this.currentZone+':'+name;if(near&&!overlay&&!this.greeted.has(key)){this.greeted.add(key);actor.classList.add('greeted');actor.title='Olá! Aproxime-se para conversar.'}}

  this.time+=overlay?0:dt;this.noteAge=Math.max(0,this.noteAge-dt);this.encounterNote.hidden=this.noteAge<=0||overlay;this.explore.hidden=overlay;
  for(const [i,s] of this.squad.entries()){
   const selected=s.member.id===controller;
   s.routine.update(dt,overlay,selected);
   const inDistrict=this.id!=='mobility'||s.routine.zone===this.currentZone;
   const near=s.routine.nearby(this.walker.position)&&inDistrict;
   const show=false; // Relay: waiting teammates remain in the roster, not in the scene.
   s.node.hidden=!show;s.shown=show;s.node.classList.toggle('resident-near',near&&!s.walker.moving);s.node.style.setProperty('--look-turn',this.walker.position[0]<s.walker.position[0]?'-2deg':'2deg');

   if(show&&s.routine.encounter(this.walker.position)){audio.play('message');this.hero.classList.remove('found-person');void this.hero.offsetWidth;this.hero.classList.add('found-person');this.encounterNote.textContent='Você encontrou '+s.member.name.split(' ')[0]+' • '+ACTIVITY_LABELS[s.routine.activity].toLowerCase();this.noteAge=4}
   s.card.classList.toggle('active',selected);s.card.setAttribute('aria-pressed',String(selected));s.status.textContent=selected?'Responsável atual':'Aguardando sua vez';
   const [x,y]=s.walker.position;s.node.style.left=x+'%';s.node.style.top=y+'%';s.node.style.zIndex=String(Math.round(y));s.node.setAttribute('data-facing',s.walker.facing);s.node.style.setProperty('--actor-scale',String(groundScale(y)));s.node.classList.toggle('walking',s.walker.moving);s.node.classList.toggle('facing-left',s.walker.facingLeft);s.node.classList.toggle('activity-pose',!s.walker.moving);
   if(selected&&this.currentMember!==controller){this.currentMember=controller;this.hero.hidden=false;this.heroArt?.remove();this.heroArt=cartoonAvatar(cartoonLook(s.member.avatar.cartoonLook,i),'',s.member.avatar);this.hero.append(this.heroArt);this.heroName.textContent=s.member.name.split(' ')[0]+' • NO CONTROLE'}
  }

  const [px,py]=this.walker.position;
  const atTarget=this.targetHere(active)&&this.walker.arrived&&this.distanceTo(active)<=5;
  if(!overlay&&atTarget&&this.arrivalKey!==phase+':'+active){
   this.arrivalKey=phase+':'+active;this.arrivalAge=0;
   for(const node of [this.arrivalBurst,this.arrivalBanner]){node.hidden=false;node.classList.remove('celebrate-arrival');void node.offsetWidth;node.classList.add('celebrate-arrival')}
   this.arrivalBurst.style.left=px+'%';this.arrivalBurst.style.top=py+'%';audio.play('phase');
  }
  if(this.arrivalKey)this.arrivalAge+=dt;
  if(this.arrivalAge>3.5){this.arrivalBurst.hidden=true;this.arrivalBanner.hidden=true}
  if(!overlay&&this.distanceTo(active)>8)this.arrivalKey='';

  const width=this.world.clientWidth,viewport=this.root.clientWidth;if(width>viewport&&viewport>0){const half=viewport/width*50;this.world.style.setProperty('--camera-x',Math.max(half,Math.min(100-half,px))+'%')}
  this.hero.style.left=px+'%';this.hero.style.top=py+'%';this.hero.style.setProperty('--ground-x',px+'%');this.hero.style.setProperty('--ground-y',py+'%');this.hero.style.zIndex=String(Math.round(py));this.hero.style.setProperty('--actor-scale',String(groundScale(py)));
  this.hero.setAttribute('data-facing',this.walker.facing);this.hero.classList.toggle('walking',this.walker.moving&&!overlay);this.hero.classList.toggle('climbing',onStairs(this.walker.position,this.walker.zone)&&this.walker.moving);const travel=this.travelState;if(travel){travel.hidden=overlay;const text=this.walker.blocked?'AGUARDE • liberação segura da travessia':onStairs(this.walker.position,this.walker.zone)?'ACESSO • escadas / patamar externo':this.walker.position[1]<54?(this.id==='mobility'?'OUTRO LADO DA RUA':'ÁREA DE EXPLORAÇÃO'):this.walker.position[1]<61?(this.id==='mobility'?'TRAVESSIA • siga pela faixa':'ACESSO • siga pelo caminho'):'';if(travel.textContent!==text)travel.textContent=text}this.hero.classList.toggle('facing-left',this.walker.facingLeft);
  for(const [name,b] of this.buttons){b.classList.toggle('current',name===active);b.hidden=overlay||name!==active||this.zoneFor(name)!==this.currentZone;b.setAttribute('aria-current',name===active?'step':'false')}

  this.root.classList.toggle('conversation',overlay);this.caption.textContent=overlay?'':this.destination?.arrived?this.destination.label+' • você chegou':(this.id==='mobility'?{praca:'Praça e parada',calcadao:'Escola e travessia',servicos:'Centro cidadão'}[this.currentZone]:{health:'Vila e UBS',work:'Estação e agência',territory:'Praça e quadra'}[this.id])+' • clique no chão para explorar';
  if(phase!==this.phase){this.phase=phase;this.root.setAttribute('data-phase',phase);/* Environment switches stay selected until the player chooses another destination. */}
 }
}

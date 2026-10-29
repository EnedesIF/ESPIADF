import {campaignFinish} from '@/data/routeExperience';
import {challengeFor} from '@/data/challenges';
import {h} from '../dom';
import type {Team} from '@/types';
import type {ParkState} from '@/services/parkChallenge';
import {stateRoute,parkScore} from '@/services/parkChallenge';
import {celebrationPositions} from '@/services/missionCelebration';
import {avatarName} from '@/services/avatarNames';
import {worldFor} from './ChallengeWorld';
import {cartoonAvatar} from '../demo/CartoonAvatar';
import {audio} from '@/systems/AudioSystem';
import './mission-celebration.css';
export function missionCelebration(team:Team,state:ParkState,onReview:()=>void){
 const scene=worldFor(stateRoute(state).campaign,stateRoute(state).id).square,score=parkScore(state),points=celebrationPositions(team.members.length);
 const root=h('section',{class:'mission-celebration celebrating',role:'dialog','aria-modal':'true','aria-label':'Comemoração da equipe na praça'});
 const world=h('div',{class:'mission-celebration-world',style:{backgroundImage:"url('"+scene.asset+"')",backgroundSize:scene.atlasPosition?'201% 201%':'100% 100%',backgroundPosition:scene.atlasPosition??'center'},'aria-label':scene.title+' • equipe reunida'});
 for(const [i,member] of team.members.entries()){const [x,y]=points[i],columns=team.members.length<=6?team.members.length:Math.ceil(team.members.length/2),row=Math.floor(i/columns),col=i%columns,n=Math.min(columns,team.members.length-row*columns);world.append(h('figure',{class:'mission-celebration-member',style:{left:x+'%',top:y+'%',zIndex:Math.round(y*10)+i,'--join-delay':(i*.14)+'s','--mobile-x':(n===1?50:10+col*80/(n-1))+'%','--mobile-y':(team.members.length<=6?84:row===0?71:86)+'%'},'aria-label':'Avatar de '+member.name+': '+avatarName(member)},cartoonAvatar(member.avatar.cartoonLook??i%6,'',member.avatar),h('figcaption',{},avatarName(member))))}
 const fireworks=h('div',{class:'mission-fireworks','aria-hidden':'true'}),colors=['#ffe486','#8ff6c0','#8cddff','#ffa6d0'];
 for(let b=0;b<6;b++){const burst=h('div',{class:'mission-firework',style:{left:(12+b*15)+'%',top:(15+b%3*12)+'%','--burst-delay':(b*.6)+'s','--firework-color':colors[b%colors.length]}});for(let p=0;p<18;p++){const angle=p*Math.PI*2/18,reach=70+(p%3)*18;burst.append(h('i',{style:{'--spark-x':Math.cos(angle)*reach+'px','--spark-y':Math.sin(angle)*reach+'px'}}))}fireworks.append(burst)}
 const replay=()=>{root.classList.remove('celebrating');void root.offsetWidth;root.classList.add('celebrating');audio.play('success')};
 root.append(world,h('div',{class:'mission-celebration-shade','aria-hidden':'true'}),fireworks,h('header',{},h('span',{},'9/9 ETAPAS ENTREGUES • '+challengeFor(stateRoute(state).campaign).title+' • '+team.name),h('h1',{},'Parabéns, equipe!',h('br'),h('em',{},score.completed===9?'Missão validada!':'Percurso concluído!')),h('p',{},campaignFinish[stateRoute(state).campaign]),h('p',{class:'mission-celebration-review'},score.completed===9?'Professor e GDF confirmaram as nove etapas. Pontuação oficial: '+score.total+'/900.':'Todas as etapas foram enviadas! As entregas ainda serão avaliadas. A pontuação final aparecerá após a validação.')),h('footer',{},h('button',{onclick:onReview},'Ver entregas e avaliações'),h('button',{onclick:replay},'Repetir comemoração')));
 audio.play('success');return root;
}

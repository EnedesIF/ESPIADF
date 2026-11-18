import type {Team} from '@/types';
import {h} from '../dom';
import {avatarName} from '@/services/avatarNames';
import {cartoonAvatar} from '../demo/CartoonAvatar';
export function teamAvatarRoster(team:Team,edit?:(memberId:string)=>void){
 return h('section',{'aria-label':'Avatares de todos os integrantes'},h('h3',{},team.members.length+' integrantes • um avatar para cada pessoa'),h('div',{class:'park-role-grid'},...team.members.map((member,i)=>h('article',{class:'park-role-card'},cartoonAvatar(member.avatar.cartoonLook??i,'',member.avatar),h('b',{},(i+1)+'/'+team.members.length+' • '+avatarName(member)),edit?h('button',{'aria-label':'Personalizar avatar do integrante '+(i+1),onclick:()=>edit(member.id)},'Personalizar este avatar'):null))));
}

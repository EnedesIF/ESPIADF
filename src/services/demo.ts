import type { Team } from '@/types';
import { backend } from './backend';
import { uid, makeLogin } from './util';
import { randomAvatar, DEFAULT_AVATAR } from '@/data/avatarOptions';

export const DEMO_PASSWORD = 'demo1234';

/** Equipe fictícia para demonstração rápida (sem dados pessoais reais). */
export async function createDemoTeam(): Promise<Team> {
  const existing = (await backend().listTeams()).find(t => t.name === 'Vértice (demo)');
  if (existing) {if(existing.members.length<6){for(let i=existing.members.length;i<6;i++)existing.members.push({id:uid('m_'),name:['','','','','Ravi','Sofia'][i],email:'',phone:'',turma:'2º B',role:i===4?'comunicador':'relator',avatar:{...randomAvatar(i*7+3),cartoonLook:i}});await backend().updateTeam(existing)}return existing;}
  const names = ['Ana Clara', 'Davi', 'Luiza', 'Kauã', 'Ravi', 'Sofia'];
  const roles = ['campo', 'dados', 'estrategista', 'articulador', 'comunicador', 'relator'] as const;
  const team: Team = {
    id: uid('team_'), name: 'Vértice (demo)', school: 'Centro de Ensino 214 (fictício)', ra: 'Outra', turma: '2º B',
    mentor: { name: 'Prof.ª Demonstração', email: 'mentor@demo.local', phone: '', school: 'Centro de Ensino 214 (fictício)', area: 'Sociologia' },
    members: names.map((name, i) => ({ id: uid('m_'), name, email: '', phone: '', turma: '2º B', role: roles[i],
      avatar: i === 0 ? {...DEFAULT_AVATAR,hair:'cacheado',top:'camiseta',topColor:2,backpackColor:4,accessory:'nenhum'} : {...randomAvatar(i * 7 + 3),cartoonLook:i} })),
    login: makeLogin('VERTICE'), passwordHash: '', createdAt: new Date().toISOString()
  };
  return backend().createTeam(team, DEMO_PASSWORD);
}

/** Route-specific demo saves keep the player's other investigations intact. */
export async function playableDemoFor(routeId:string){
 const id='espia-playable-demo-'+routeId,old=await backend().getTeam(id);if(old)return old;
 const base=await createDemoTeam();return backend().createTeam({...base,id,name:'Vértice • '+routeId+' (demo)',login:'DEMO-'+routeId.toUpperCase(),members:base.members.map((member,index)=>({...member,id:id+'-m'+index,avatar:{...member.avatar,cartoonLook:member.avatar.cartoonLook??index}}))},DEMO_PASSWORD);
}

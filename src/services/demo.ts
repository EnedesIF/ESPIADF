import {AVATAR_GENDERS} from '@/data/avatarCatalog';
import type { Team } from '@/types';
import { backend } from './backend';
import { uid, makeLogin } from './util';
import { randomAvatar, DEFAULT_AVATAR } from '@/data/avatarOptions';

const DEMO_CAST=[1,2,3,5,4,6];
const DEMO_NAMES=['Ana Clara','Davi','Luiza','Kauã','Ravi','Sofia'];
export async function correctDemoCast(team:Team){if(!team.name.toLowerCase().includes('demo'))return team;let changed=false;team.members.forEach((m,i)=>{if(m.name===DEMO_NAMES[i]&&!m.avatar.characterGender&&(m.avatar.cartoonLook??i)===i){m.avatar={...m.avatar,cartoonLook:DEMO_CAST[i],characterGender:AVATAR_GENDERS[DEMO_CAST[i]]};changed=true}});if(changed)await backend().updateTeam(team);return team}
export const DEMO_PASSWORD = 'demo1234';

/** Equipe fictícia para demonstração rápida (sem dados pessoais reais). */
export async function createDemoTeam(): Promise<Team> {
  const existing = (await backend().listTeams()).find(t => t.name === 'Vértice (demo)');
  if (existing) {if(existing.members.length<6){for(let i=existing.members.length;i<6;i++)existing.members.push({id:uid('m_'),name:['','','','','Ravi','Sofia'][i],email:'',phone:'',turma:'2º B',role:i===4?'comunicador':'relator',avatar:{...randomAvatar(i*7+3),cartoonLook:DEMO_CAST[i],characterGender:AVATAR_GENDERS[DEMO_CAST[i]]}});await backend().updateTeam(existing)}return correctDemoCast(existing);}
  const names = ['Ana Clara', 'Davi', 'Luiza', 'Kauã', 'Ravi', 'Sofia'];
  const roles = ['campo', 'dados', 'estrategista', 'articulador', 'comunicador', 'relator'] as const;
  const team: Team = {
    id: uid('team_'), name: 'Vértice (demo)', school: 'Centro de Ensino 214 (fictício)', ra: 'Outra', turma: '2º B',
    mentor: { name: 'Prof.ª Demonstração', email: 'mentor@demo.local', phone: '', school: 'Centro de Ensino 214 (fictício)', area: 'Sociologia' },
    members: names.map((name, i) => ({ id: uid('m_'), name, email: '', phone: '', turma: '2º B', role: roles[i],
      avatar: i === 0 ? {...DEFAULT_AVATAR,cartoonLook:DEMO_CAST[i],characterGender:AVATAR_GENDERS[DEMO_CAST[i]],hair:'cacheado',top:'camiseta',topColor:2,backpackColor:4,accessory:'nenhum'} : {...randomAvatar(i * 7 + 3),cartoonLook:DEMO_CAST[i],characterGender:AVATAR_GENDERS[DEMO_CAST[i]]} })),
    login: makeLogin('VERTICE'), passwordHash: '', createdAt: new Date().toISOString()
  };
  return backend().createTeam(team, DEMO_PASSWORD);
}

/** Route-specific demo saves keep the player's other investigations intact. */
export async function playableDemoFor(routeId:string){
 const id='espia-playable-demo-'+routeId,old=await backend().getTeam(id);if(old)return correctDemoCast(old);
 const base=await createDemoTeam();return backend().createTeam({...base,id,name:'Vértice • '+routeId+' (demo)',login:'DEMO-'+routeId.toUpperCase(),members:base.members.map((member,index)=>({...member,id:id+'-m'+index,avatar:{...member.avatar,cartoonLook:member.avatar.cartoonLook??index}}))},DEMO_PASSWORD);
}

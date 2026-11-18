import type {App} from '../App';
import {h} from '../dom';
import {backend} from '@/services/backend';
export function teamProfile(app:App){
 const team=app.team!,root=h('main',{class:'screen real-central'});
 const notice=h('p',{role:'status','aria-live':'polite'});
 const rows=team.members.map(m=>{
  const email=h('input',{class:'input',type:'email',required:true,'aria-label':'E-mail de '+m.name});email.value=m.email??'';
  const phone=h('input',{class:'input',type:'tel',maxlength:30,'aria-label':'Telefone de '+m.name});phone.value=m.phone??'';
  return {m,email,phone,node:h('section',{class:'route-card',style:{padding:'16px',marginBottom:'12px'}},h('h2',{},m.name),h('p',{},'Avatar: '+(m.avatarName||'Escolher nome')),h('label',{},'E-mail de contato',email),h('label',{},'Telefone de contato',phone),h('p',{},'Os papéis da investigação permanecem conforme o cadastro.'),h('button',{class:'btn ghost',type:'button',onclick:()=>app.showAvatar('hub',m.id,()=>app.showTeamProfile())},'Personalizar avatar'))};
 });
 const save=h('button',{class:'btn',type:'submit'},'Salvar contatos');
 const form=h('form',{onsubmit:async(e:Event)=>{
  e.preventDefault();save.disabled=true;notice.textContent='Salvando…';
  try{
   const contacts=rows.map(r=>({id:r.m.id,email:r.email.value.trim(),phone:r.phone.value.trim()}));
   const repo=backend();
   if(repo.updateMemberContacts)await repo.updateMemberContacts(team.id,contacts);
   else if(repo.mode==='local'){const copy=structuredClone(team);for(const c of contacts)Object.assign(copy.members.find(m=>m.id===c.id)!,c);await repo.updateTeam(copy);}
   else throw Error('Edição de contatos indisponível.');
   for(const c of contacts)Object.assign(team.members.find(m=>m.id===c.id)!,c);
   notice.textContent=repo.mode==='supabase'?'Contatos salvos e conferidos no banco.':'Contatos salvos neste dispositivo.';
  }catch(err){notice.textContent=(err as Error).message;}finally{save.disabled=false;}
 }},...rows.map(r=>r.node),save,notice);
 root.append(h('button',{class:'btn ghost',onclick:()=>void app.showPilot()},'← Voltar aos desafios'),h('h1',{},'Minha equipe • '+team.name),h('p',{},team.school+' • '+team.turma),h('p',{},'Edite os contatos abaixo ou personalize cada avatar. Salve os contatos antes de abrir um avatar.'),form);
 return root;
}

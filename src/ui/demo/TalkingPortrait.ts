import {h} from '../dom';
export type SpeakerLook='lia'|'caio'|'tech';
/** Small cutout puppet: separate mouth and hand layers preserve the approved artwork. */
export class TalkingPortrait{
 readonly root:HTMLElement;
 private timer:ReturnType<typeof setTimeout>|undefined;
 private utterance:SpeechSynthesisUtterance|undefined;
 constructor(look:SpeakerLook,name:string,text:string){
  const puppet=h('div',{class:'talking-puppet '+look,'aria-hidden':'true'},h('div',{class:'puppet-art'}),h('div',{class:'puppet-mouth'},h('div',{class:'puppet-art'})),h('div',{class:'puppet-hand'},h('div',{class:'puppet-art'})));
  const status=h('small',{},'Conversa em cena • leia a fala abaixo');
  const animate=()=>{clearTimeout(this.timer);this.root.classList.add('speaking');this.timer=setTimeout(()=>this.root.classList.remove('speaking'),Math.min(12000,Math.max(4000,text.length*35)))};
  this.root=h('section',{class:'animated-dialogue','aria-label':'Conversa com '+name},puppet,h('div',{class:'dialogue-performance'},h('strong',{},name),status,h('button',{class:'btn ghost sm',onclick:()=>animate()},'↻ Repetir gestos')));
  if('speechSynthesis' in window){this.root.querySelector('.dialogue-performance')!.append(h('button',{class:'btn ghost sm',onclick:()=>{
   this.stop();const u=new SpeechSynthesisUtterance(text);this.utterance=u;u.lang='pt-BR';u.rate=.95;
   u.onstart=()=>{this.root.classList.add('speaking');status.textContent='Falando • voz do dispositivo'};
   const done=()=>{this.root.classList.remove('speaking');status.textContent='Sua vez • investigue e responda'};
   u.onend=done;u.onerror=done;window.speechSynthesis.speak(u);
  }},'▶ Ouvir fala'),h('button',{class:'btn ghost sm',onclick:()=>this.stop()},'■ Parar voz'))}
  animate();
 }
 stop(){clearTimeout(this.timer);this.root.classList.remove('speaking');if(this.utterance){this.utterance.onend=null;this.utterance.onerror=null;window.speechSynthesis.cancel();this.utterance=undefined}}
 destroy(){this.stop()}
}

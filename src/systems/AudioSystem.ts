import {h} from '@/ui/dom';
export type Sound='click'|'evidence'|'success'|'alert'|'step'|'camera'|'message'|'phase';
/** Original local loops; playback begins inside a user gesture. */
export class AudioSystem{
 private ctx:AudioContext|null=null;
 private gain:GainNode|null=null;
 private music:HTMLAudioElement|null=null;
 private city:HTMLAudioElement|null=null;
 private enabled=localStorage.getItem('missaodf:sound')!=='off';
 private volume=this.readVolume();
 private button:HTMLButtonElement|null=null;
 private hint:HTMLElement|null=null;
 private slider:HTMLInputElement|null=null;
 private active=false;
 private mounted=false;
 private footstepsAt=0;
 private pausedForPage=false;
 private readVolume(){const v=Number(localStorage.getItem('missaodf:volume')??'.65');return Number.isFinite(v)?Math.min(1,Math.max(0,v)):.65}
 private setup(){if(!this.music){this.music=new Audio('/audio/cidade-beat.wav');this.city=new Audio('/audio/cidade-ambiente.wav');for(const a of [this.music,this.city]){a.loop=true;a.preload='auto'}this.music.addEventListener('error',()=>{this.active=false;this.label('Áudio não carregou. Toque para tentar novamente.')})}if(!this.ctx){const C=window.AudioContext||(window as any).webkitAudioContext;if(C){this.ctx=new C();this.gain=this.ctx!.createGain();this.gain.connect(this.ctx!.destination)}}this.applyVolume()}
 private applyVolume(){if(this.gain)this.gain.gain.value=this.enabled?this.volume:0;if(this.music)this.music.volume=this.enabled?this.volume*.52:0;if(this.city)this.city.volume=this.enabled?this.volume*.45:0;this.label()}
 async activate(force=true){try{if(force){this.enabled=true;if(this.volume===0){this.volume=.65;if(this.slider)this.slider.value='65'}localStorage.setItem('missaodf:sound','on');localStorage.setItem('missaodf:volume',String(this.volume))}if(!this.enabled)return false;this.setup();const resume=this.ctx?.resume();const musicPlay=this.music!.play();void this.city!.play().catch(()=>{});await Promise.all([resume,musicPlay]);this.active=!this.music!.paused;this.label();if(force)this.play('evidence');return this.active}catch{this.active=false;this.label('Toque em ATIVAR SOM para liberar o áudio.');return false}}
 private tone(freq:number,delay=0,duration=.15,type:OscillatorType='sine',level=.15){if(!this.ctx||!this.gain||!this.enabled||document.hidden||this.ctx.state!=='running')return;const now=this.ctx.currentTime+delay,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,now);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(level,now+.008);g.gain.exponentialRampToValueAtTime(.0001,now+duration);o.connect(g);g.connect(this.gain);o.start(now);o.stop(now+duration+.02);o.onended=()=>{o.disconnect();g.disconnect()}}
 play(kind:Sound='click'){try{if(!this.enabled)return;if(!this.ctx||this.ctx.state!=='running'){if(!document.hidden)void this.activate(false);return}if(kind==='success')[523.25,659.25,783.99,1046.5].forEach((f,i)=>this.tone(f,i*.11,.55,'triangle',.26));else if(kind==='phase')[392,523.25,659.25].forEach((f,i)=>this.tone(f,i*.12,.35,'triangle',.22));else if(kind==='evidence')[784,1046.5,1568].forEach((f,i)=>this.tone(f,i*.07,.22,'sine',.2));else if(kind==='message')[880,659,880].forEach((f,i)=>this.tone(f,i*.12,.12,'triangle',.18));else if(kind==='camera'){this.tone(1700,0,.035,'sawtooth',.09);this.tone(650,.055,.05,'triangle',.12)}else if(kind==='step'){const now=this.ctx.currentTime;if(now-this.footstepsAt<.28)return;this.footstepsAt=now;this.tone(95+Math.random()*35,0,.065,'triangle',.18)}else this.tone(kind==='alert'?180:720,0,kind==='alert'?.22:.07,'sine',kind==='alert'?.2:.13)}catch{this.label('Toque para reativar o som.')}}
 /** Short spatial cues. No new audio context, polling timer or autoplay loop. */
 world(kind:'bus'|'busDoor'|'bird',strength=.12,pan=0){
  if(!this.ctx||!this.gain||!this.enabled||document.hidden||this.ctx.state!=='running')return;
  const now=this.ctx.currentTime,osc=this.ctx.createOscillator(),level=this.ctx.createGain();
  const spatial=this.ctx.createStereoPanner?.();
  const duration=kind==='bus'?.8:kind==='busDoor'?.45:.3;
  osc.type=kind==='bus'?'triangle':'sine';
  osc.frequency.setValueAtTime(kind==='bus'?65:kind==='busDoor'?540:1900,now);
  osc.frequency.exponentialRampToValueAtTime(kind==='bus'?90:kind==='busDoor'?280:2700,now+duration*.7);
  level.gain.setValueAtTime(.0001,now);level.gain.exponentialRampToValueAtTime(Math.max(.001,Math.min(.2,strength)),now+.05);level.gain.exponentialRampToValueAtTime(.0001,now+duration);
  osc.connect(level);if(spatial){spatial.pan.value=Math.max(-1,Math.min(1,pan));level.connect(spatial);spatial.connect(this.gain)}else level.connect(this.gain);
  osc.start(now);osc.stop(now+duration+.02);osc.onended=()=>{osc.disconnect();level.disconnect();spatial?.disconnect()};
 }
 private silence(){this.enabled=false;this.active=false;localStorage.setItem('missaodf:sound','off');this.music?.pause();this.city?.pause();void this.ctx?.suspend();this.applyVolume()}
 mount(){if(this.mounted)return;this.mounted=true;this.button=h('button',{class:'audio-toggle',type:'button',onclick:()=>{if(this.active&&this.enabled)this.silence();else void this.activate(true)}});const slider=h('input',{type:'range',min:0,max:100,value:this.volume*100,'aria-label':'Volume do jogo'});this.slider=slider;slider.oninput=()=>{this.volume=Number(slider.value)/100;localStorage.setItem('missaodf:volume',String(this.volume));this.applyVolume()};this.hint=h('small',{class:'audio-state','aria-live':'polite'});const test=h('button',{class:'audio-test',onclick:()=>{void this.activate(true).then(ok=>{if(ok)this.play('success')})}},'TESTAR');document.body.append(h('div',{class:'sound-dock'},this.button,slider,test,this.hint));this.label();const unlock=()=>{if(this.enabled&&!this.active)void this.activate(false)};document.addEventListener('pointerdown',unlock);document.addEventListener('keydown',unlock);document.addEventListener('click',e=>{const el=e.target as Element;if(el?.closest?.('button')&&!el.closest('.sound-dock'))this.play('click')});document.addEventListener('visibilitychange',()=>{if(document.hidden){this.pausedForPage=this.enabled;this.music?.pause();this.city?.pause();void this.ctx?.suspend();this.active=false;this.label()}else if(this.pausedForPage){this.pausedForPage=false;void this.activate(false)}})}
 private label(message?:string){if(this.button){this.button.textContent=!this.enabled?'ATIVAR SOM':this.volume===0?'VOLUME ZERO':this.active?'♫ SOM LIGADO':'▶ ATIVAR SOM';this.button.setAttribute('aria-pressed',String(this.enabled&&this.active&&this.volume>0));this.button.setAttribute('aria-label',this.active?'Silenciar som do jogo':'Ativar som do jogo')}if(this.hint)this.hint.textContent=message??(!this.enabled?'Silenciado':this.active?(this.volume===0?'Aumente o volume':'Música + cidade + efeitos'):'Toque para ouvir')}
}
export const audio=new AudioSystem();

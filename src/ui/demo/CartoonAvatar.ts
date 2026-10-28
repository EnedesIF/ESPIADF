import {AVATAR_LOOKS,avatarArt,avatarCell,gearSelection,type GearSlot} from '@/data/avatarCatalog';
import {avatarGear} from './AvatarGear';
import './avatar-collection.css';
import type {AvatarConfig} from '@/types';
import {h} from '../dom';
export const CARTOON_LOOKS=AVATAR_LOOKS.map(look=>look.name);
export function cartoonLook(value:number|undefined,index=0){return Number.isInteger(value)&&value!>=0&&value!<AVATAR_LOOKS.length?value!:index%AVATAR_LOOKS.length}
export const STYLE_COLORS=['Original','Preto','Castanho','Dourado','Vermelho','Azul','Violeta','Verde','Cinza','Rosa','Turquesa','Branco','Laranja'];
export function cartoonAvatar(look:number,className='',config?:AvatarConfig){
 look=cartoonLook(look);const cell=avatarCell(look);const customized=true; // Every look walks from its own atlas cell; never cycle through neighbouring figures.
 const puppet=(customized||look===2||look===5)?[
  h('span',{class:'rig-body rig-torso'}),
  h('span',{class:'rig-body rig-leg rig-left'},h('span',{class:'rig-piece rig-thigh'}),h('span',{class:'rig-piece rig-shin'})),
  h('span',{class:'rig-body rig-leg rig-right'},h('span',{class:'rig-piece rig-thigh'}),h('span',{class:'rig-piece rig-shin'}))
 ]:[];
 const avatar=h('div',{class:'team-cartoon-avatar look-'+look+' '+className+(look>=6?' avatar-extended':'')+(customized?' avatar-calibrated':''),'aria-hidden':'true',style:{'--look-x':`${cell%3*50}%`,'--look-y':`${Math.floor(cell/3)*100}%`,...(look>=6?{'--pants-art-mask':`url('/art/avatar-mask-${look}-trousers.svg')`}:{}),'--avatar-art':`url('${avatarArt(look)}')`,'--rear-art':`url('${avatarArt(look,true)}')`,'--walk-art':`url('/art/cartoon-walk-${Math.min(look,4)}.webp')`}},h('span',{class:'team-cartoon-sprite'}),...puppet,h('span',{class:'rear-avatar'},h('span',{class:'rear-part rear-body'}),h('span',{class:'rear-part rear-leg rear-left'}),h('span',{class:'rear-part rear-leg rear-right'})));
 const spriteParts=Array.from(avatar.children);
 const style=config?.cartoonStyle;if(style){
  for(const [region,value] of [['hair',style.hair],['outfit',style.outfit],['trousers',style.trousers]] as const){if(!value)continue;const layer=h('div',{class:`avatar-color-region region-${region} color-${value}`});for(const child of spriteParts)layer.append(child.cloneNode(true));avatar.append(layer)}
  for(const [slot,item] of Object.entries(gearSelection(style)))if(item)avatar.append(...[avatarGear(look,slot as GearSlot,item)].filter(Boolean) as HTMLElement[]);
 }
 return avatar;
}

// Warm walking textures before a destination is selected, avoiding a blank first stride.
if(typeof Image!=='undefined')for(const i of [0,1,3,4]){const image=new Image();image.src='/art/cartoon-walk-'+i+'.webp'}

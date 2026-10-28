import type {AvatarGear,GearSlot} from '@/data/avatarCatalog';
import {h} from '../dom';
/** All positions are percentages of the same square sprite, never page pixels. */
export interface GearAnchor{x:number;y:number;w:number;wrist:[number,number]}
export const GEAR_ANCHORS:GearAnchor[]=[
 {x:54.5,y:13.1,w:10.4,wrist:[41,51]}, {x:53.4,y:14.3,w:10.6,wrist:[39,50]},
 {x:52.8,y:12.9,w:10.5,wrist:[39,49]}, {x:54.8,y:11.9,w:10.5,wrist:[40,51]},
 {x:53.2,y:11.2,w:11.5,wrist:[39,51]}, {x:52.8,y:11.9,w:10.5,wrist:[40,46]},
 {x:54,y:16,w:11,wrist:[39,50]}, {x:54,y:12.5,w:11,wrist:[39,51]},
 {x:53,y:13,w:11,wrist:[40,46]}, {x:54,y:15.7,w:11,wrist:[39,53]},
 {x:55,y:13.9,w:11,wrist:[40,49]}, {x:54,y:14.2,w:11,wrist:[40,50]},
 {x:54,y:14.2,w:11,wrist:[40,46]}, {x:55,y:13.4,w:11,wrist:[39,46]},
 {x:54,y:14.2,w:11,wrist:[39,52]}, {x:54,y:15.2,w:11,wrist:[40,44]},
 {x:55,y:15.2,w:11,wrist:[39,48]}, {x:54,y:13.4,w:11,wrist:[40,50]}
];
export function avatarGear(look:number,slot:GearSlot,item:AvatarGear){
 if(item==='nenhum'||look===4&&item==='oculos')return null;
 const {x,y,w,wrist}=GEAR_ANCHORS[look];const ink='#173340',accent='#efbf5d',l=x-w*.55,r=x+w*.55;
 let art='';
 if(item==='oculos'||item==='solar'){const fill=item==='solar'?'#213f51':'#b4e8ec55';art=`<g stroke="${ink}" stroke-width=".55" fill="${fill}"><rect x="${l}" y="${y-1.4}" width="${w*.46}" height="2.8" rx="1.1"/><rect x="${x+w*.09}" y="${y-1.4}" width="${w*.46}" height="2.8" rx="1.1"/><path d="M${x-w*.09} ${y-.4}Q${x} ${y-1} ${x+w*.09} ${y-.4}" fill="none"/></g>`}
 if(item==='bone')art=`<g class="gear-front" fill="#258c7d" stroke="${ink}" stroke-width=".4"><path d="M${l-1} ${y-4}Q${x} ${12-y} ${r+1} ${y-4}Z"/><path d="M${l-1} ${y-4}Q${x+2} ${y-6} ${r+4} ${y-3.5}Q${x+3} ${y-1.5} ${l-1} ${y-4}"/></g><path class="gear-back" d="M${l-1} ${y-4}Q${x} ${12-y} ${r+1} ${y-4}Z" fill="#258c7d" stroke="${ink}" stroke-width=".4"/>`;
 if(item==='gorro')art=`<path d="M${l-1} ${y-4.6}Q${l-1} ${y-11} ${x} ${y-11.5}Q${r+1} ${y-11} ${r+1} ${y-4.6}Z" fill="#ad5268" stroke="${ink}" stroke-width=".35"/><rect x="${l-1.4}" y="${y-5.3}" width="${w*1.1+2.8}" height="2" rx=".6" fill="#d78595" stroke="${ink}" stroke-width=".3"/>`;
 if(item==='bandana')art=`<path d="M${l-.5} ${y-3.7}Q${x} ${y-5.2} ${r+.5} ${y-3.7}L${r+.5} ${y-2.2}Q${x} ${y-3.6} ${l-.5} ${y-2.2}Z" fill="${accent}" stroke="${ink}" stroke-width=".25"/>`;
 if(item==='fone')art=`<path d="M${l-1.8} ${y+1}Q${l-3} ${y-9} ${x} ${y-9}Q${r+3} ${y-9} ${r+1.8} ${y+1}" fill="none" stroke="${ink}" stroke-width="1.2"/><g fill="#49bca9" stroke="${ink}" stroke-width=".45"><rect x="${l-2.6}" y="${y-.3}" width="2" height="4" rx=".8"/><rect x="${r+.6}" y="${y-.3}" width="2" height="4" rx=".8"/></g>`;
 if(item==='brincos')art=`<g fill="none" stroke="${accent}" stroke-width=".8"><ellipse cx="${l-.2}" cy="${y+3.6}" rx=".8" ry="1.3"/><ellipse cx="${r-.1}" cy="${y+3.6}" rx=".8" ry="1.3"/></g>`;
 if(item==='pulseira')art=`<path d="M${wrist[0]-1.3} ${wrist[1]}l2.5 .6" stroke="${accent}" stroke-width="1.3" stroke-linecap="round"/><circle cx="${wrist[0]+.2}" cy="${wrist[1]+.3}" r=".55" fill="#e88f95"/>`;
 return h('span',{class:'avatar-gear gear-slot-'+slot,'data-gear':item,html:`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${art}</svg>`});
}

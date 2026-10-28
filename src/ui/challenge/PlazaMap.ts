import {h} from '../dom';
/** The same tangible landmark is shown by the live city and the illustrated walkthrough. */
export function plazaMap(onclick?:()=>void){return h('button',{class:'plaza-map-stand','aria-label':'Caminhar até o mapa da praça',onclick},h('span',{class:'plaza-map-face'},h('i'),h('i'),h('i')),h('b',{},'MAPA DA PRAÇA'),h('span',{class:'plaza-map-leg'}))}

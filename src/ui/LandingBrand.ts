import {h} from './dom';
/** Exibe somente o brasão do GDF da marca fornecida, sem o texto da CGDF. */
export function gdfIdentity(){return h('div',{class:'gdf-identity'},h('div',{class:'gdf-crest',role:'img','aria-label':'Brasão do Governo do Distrito Federal'},h('img',{src:'./brand/gdf-cgdf-oficial.png',alt:''})),h('div',{},h('b',{},'GOVERNO DO'),h('strong',{},'DISTRITO FEDERAL')))}
export function developerCorner(){return h('div',{class:'developer-corner'},h('span',{},'DESENVOLVIDO POR'),h('img',{src:'./brand/enedes-oficial.png',alt:'ENEDES — desenvolvedora do game'}))}

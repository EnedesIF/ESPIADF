import {CASES} from '@/data/simulation';
import {CITY_MISSIONS,CITY_EXTENSIONS} from '@/data/cityMissions';
import type {CampaignId} from '@/types';
import {REAL_MISSIONS} from './missions';
import {CLUES} from './clues';
export const DEFAULT_GUIDE='Objetivo: localizar informação pública, cruzar fontes, reconhecer lacunas, escolher o instrumento e multiplicar o aprendizado. Roda: o que confirmamos? O que falta? Quem pode agir? Critérios: evidência legível, fonte e data, interpretação própria, limites e encaminhamento justificado.';
export interface ContentOverrides{missions:Record<string,{title?:string;steps?:string[];prompts?:string[];concept?:string;xp?:number}>;clues:Record<string,{title?:string;near?:string;steps?:string[]}>;guides:Record<string,string>;dialogues?:Record<string,{agent:string;rumor:string;testimony:string;observation:string}>}
const KEY='missaodf:content:v02';
export function content():ContentOverrides{try{return {...{missions:{},clues:{},guides:{}},...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return {missions:{},clues:{},guides:{}}}}
export function applyContent(){const c=content();for(const [key,v] of Object.entries(c.dialogues??{})){const id=key as CampaignId;if(CASES[id]){CASES[id].agent=v.agent;CASES[id].rumor=v.rumor;CITY_EXTENSIONS[id].testimony=v.testimony;CITY_MISSIONS[id].observation=v.observation}}for(const m of REAL_MISSIONS)Object.assign(m,c.missions[m.id]??{});for(const [id,clues] of Object.entries(CLUES))for(const clue of clues)Object.assign(clue,c.clues[id+':'+clue.id]??{})}
export function saveContent(c:ContentOverrides){for(const v of Object.values(c.missions)){if(v.xp!==undefined&&(!Number.isInteger(v.xp)||v.xp<0||v.xp>1000))throw Error('Reputação: inteiro entre 0 e 1.000.');if(v.steps&&!v.steps.length||v.prompts&&v.prompts.length!==3)throw Error('Use pelo menos um passo e exatamente três perguntas.')}localStorage.setItem(KEY,JSON.stringify(c));applyContent()}
applyContent();

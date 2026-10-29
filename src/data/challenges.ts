import type {CampaignId} from '@/types';
export const CHALLENGES:{id:CampaignId;number:number;title:string;pitch:string}[]=[
 {id:'mobility',number:1,title:'Meu caminho pela cidade',pitch:'Investiguem situações do caminho pela cidade e descubram como buscar informações e soluções.'},
 {id:'work',number:2,title:'Meu próximo passo',pitch:'Descubram oportunidades de estudo, trabalho e outras atividades usando informações oficiais.'},
 {id:'territory',number:3,title:'Nosso lugar na cidade',pitch:'Investiguem os espaços e serviços da comunidade e descubram como buscar melhorias na Região Administrativa.'},
 {id:'health',number:4,title:'Saúde na nossa Região Administrativa',pitch:'Descubram onde encontrar informações sobre serviços de saúde e como buscar orientações e melhorias.'}
];
export const challengeFor=(id:CampaignId)=>CHALLENGES.find(c=>c.id===id)!;

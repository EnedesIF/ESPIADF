import type {CampaignId} from '@/types';
export const CHALLENGES:{id:CampaignId;number:number;title:string;pitch:string}[]=[
 {id:'mobility',number:1,title:'Meu caminho pela cidade',pitch:'Investiguem um problema no deslocamento e proponham um caminho fundamentado.'},
 {id:'work',number:2,title:'Meu próximo passo',pitch:'Investiguem oportunidades, formação ou uma carreira com informação verificada.'},
 {id:'territory',number:3,title:'Nosso lugar na cidade',pitch:'Investiguem o uso dos espaços e os serviços que atendem a comunidade.'},
 {id:'health',number:4,title:'Saúde no bairro',pitch:'Investiguem as informações e os canais de acesso aos serviços de saúde.'}
];
export const challengeFor=(id:CampaignId)=>CHALLENGES.find(c=>c.id===id)!;

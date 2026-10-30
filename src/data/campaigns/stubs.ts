import type { CampaignDef } from '@/types';

/** Campanhas 02–04: roteiro oficial em OfficialMission.
 *  A cidade 3D detalhada permanece específica para mobilidade. */
const base = (c: Partial<CampaignDef> & Pick<CampaignDef, 'id' | 'number' | 'axis' | 'title' | 'pitch' | 'briefing'>): CampaignDef => ({
  available: true, startClock: '14:00', phases: [], npcs: [], pois: [], evidences: [], hypotheses: [],
  events: [], crossRefs: [], tools: {}, agencyResponses: [], expectedAgencies: [], bestCause: [], ...c
});

export const work = base({
  id: 'work', number: '02', axis: 'OPORTUNIDADES', title: 'MEU PRÓXIMO PASSO',
  pitch: 'Emprego, formação profissional, remuneração e cargos vagos. Qual próximo passo faz sentido?',
  briefing: 'Uma oportunidade de qualificação está circulando entre os estudantes. Dizem que fecha hoje, mas ninguém encontrou o edital completo. Descubra se ela existe, quem pode participar e como.'
});

export const territory = base({
  id: 'territory', number: '03', axis: 'TERRITÓRIO', title: 'NOSSO LUGAR NA CIDADE',
  pitch: 'Quadra esportiva, coleta seletiva ou relatórios da PMDF: escolha o que investigar.',
  briefing: 'Uns dizem que o problema da praça é lixo. Outros, falta de atividades e manutenção. Investigue quem usa o espaço, o que funciona e quem responde por ele.'
});

export const health = base({
  id: 'health', number: '04', axis: 'SAÚDE', title: 'SAÚDE NA REGIÃO ADMINISTRATIVA',
  pitch: 'UBS, vacinação, dengue e vigilância sanitária: informação pública para orientar o próximo passo.',
  briefing: 'Os moradores acham que os casos de dengue aumentaram. Um culpa o terreno abandonado, outro a chuva, outro a coleta de lixo. Investigue antes de concluir.'
});

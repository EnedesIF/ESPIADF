import {h} from '../dom';
import {GDF_STEPS} from '@/data/gdf/routes';
export const STAGE_MAX=100;
export const CAMPAIGN_MAX=900;
export const STAGE_DELIVERIES=[
 ['Pergunta da equipe e rota escolhida.','Cadastro da rota / pergunta da equipe'],
 ['Síntese do relato inicial e observação do objeto.','Dossiê • histórico da investigação'],
 ['Comparação entre os relatos dos personagens.','Dossiê • histórico da investigação'],
 ['Fontes escolhidas, hipótese e comparação das evidências.','Celular / Laboratório de Evidências'],
 ['Interpretação fundamentada e limites da conclusão.','Dossiê • verificação em campo'],
 ['Proposta de solução com justificativa e responsáveis.','Laboratório de Soluções'],
 ['Escolha fundamentada do canal e minuta da participação.','Registro de participação simulada'],
 ['Análise da resposta: o que esclarece e o que fica pendente.','Dossiê • avaliação da resposta'],
 ['Conclusão e duas entregas reais: pesquisa e participação pertinente.','Relatório final + Missões reais']
];
/** One shared scoring rule for the route picker, instructions and in-city guide.
 * Exploration XP is independent and is never presented as an academic grade. */
export function stageScoring(titles=GDF_STEPS){
 return h('section',{class:'stage-scoring','aria-label':'Pontuação por etapa'},
  h('h3',{},'Pontuação por etapa • até 900 pontos'),
  h('p',{},'Cada etapa vale de 0 a 100 pontos. O professor atribui a nota; o GDF revisa e valida a pontuação final. Entregar ou visitar um local não concede automaticamente os 100 pontos.'),
  h('div',{class:'stage-scoring-scroll',tabindex:0,'aria-label':'Tabela de instruções e pontuação'},
   h('table',{},h('caption',{},'Nove etapas • valor máximo e local de registro'),
    h('thead',{},h('tr',{},...['Etapa','O que entregar','Onde registrar','Pontuação máxima'].map(t=>h('th',{scope:'col'},t)))),
    h('tbody',{},...titles.map((title,i)=>h('tr',{},h('th',{scope:'row'},(i+1)+'. '+title),h('td',{},STAGE_DELIVERIES[i][0]),h('td',{},STAGE_DELIVERIES[i][1]),h('td',{class:'stage-max'},'100 pontos')))),
    h('tfoot',{},h('tr',{},h('th',{scope:'row',colspan:3},'Total máximo da campanha'),h('td',{class:'stage-max'},'900 pontos'))))),
  h('p',{class:'learning-concept'},'Nota do professor: provisória. Pontuação final: somente após validação do GDF. XP / REP de exploração são indicadores separados da nota.'),
  h('details',{},h('summary',{},'Critérios de avaliação • 100 pontos'),
   h('ul',{},h('li',{},'Atendimento à tarefa: até 30 pontos.'),h('li',{},'Qualidade das evidências e das fontes: até 30 pontos.'),h('li',{},'Análise e justificativa: até 30 pontos.'),h('li',{},'Clareza e organização: até 10 pontos.')),
   h('p',{},'Os critérios devem ser aplicados ao produto esperado em cada etapa. O GDF pode validar a nota ou devolver ao professor para revisão justificada.')));
}

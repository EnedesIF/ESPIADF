import {caseScript} from '@/data/caseScripts';
import type {GdfRoute} from '@/data/gdf/routes';
import {GDF_ROUTES} from '@/data/gdf/routes';
import type {LinkKey} from '@/data/v02/missions';
export interface SourceChoice{value:string;key:LinkKey;label:string;feedback:string}
const ALTERNATIVES:Record<string,[[string,string],[string,string]]>={
 transport:[['park','As regras de um parque não informam linha, sentido e horário de ônibus.'],['employment','O quadro de vagas de emprego não permite planejar o deslocamento de ônibus.']],
 accessibility:[['transport','O DF no Ponto informa linhas de ônibus; não identifica a responsabilidade pela manutenção da calçada.'],['park','Regras de parques não determinam a responsabilidade pelo trecho de calçada investigado.']],
 lighting:[['transport','Horários de ônibus não indicam o canal de primeiro reparo da luminária.'],['accessibility','A página de vias urbanas não substitui o canal específico da CEB para iluminação pública.']],
 employment:[['training','O Pró-Jovem Digital trata de qualificação, não confirma os requisitos e a candidatura desta vaga de emprego.'],['pay','Remuneração de servidores não comprova oportunidade nem candidatura no quadro de vagas da Sedet.']],
 training:[['employment','Uma vaga de emprego não informa as regras de participação no Pró-Jovem Digital.'],['pay','Registros de remuneração não informam público, áreas e condições do programa de formação.']],
 pay:[['employment','Um anúncio de emprego não é registro de remuneração de uma profissão pública.'],['training','Um programa de formação não permite comparar bruto, líquido e componentes de pagamento.']],
 vacancies:[['employment','Vagas de emprego da Sedet não são o quadro de cargos efetivos ocupados e vagos de uma carreira pública.'],['training','Condições de um programa de formação não comprovam vacância ou concurso aberto.']],
 court:[['park','Orientações de parques não confirmam as regras nem a disponibilidade da quadra investigada.'],['waste','O cronograma de coleta não informa gestor, uso livre ou reserva da quadra.']],
 waste:[['court','A Carta de Serviços para uso da quadra não substitui o cronograma e a orientação de coleta do SLU.'],['police','Relatórios de produtividade policial não identificam coleta convencional ou seletiva.']],
 police:[['pay','Registros de pessoal e remuneração não substituem os indicadores do relatório mensal da PMDF.'],['transport','Horários de ônibus não informam definição, unidade e abrangência de produtividade policial.']],
 ubs:[['vaccination','A lista de locais de vacinação não substitui a busca de UBS e suas orientações gerais de acesso.'],['dengue','A Vigilância Ambiental orienta situações ambientais, não identifica a referência da UBS nesta busca.']],
 vaccination:[['dengue','Orientações sobre água parada não respondem à regra de acesso após perda do cartão de vacinação.'],['sanitary','A Vigilância Sanitária não é a fonte de orientação sobre documentos para procurar uma sala de vacina.']],
 dengue:[['vaccination','Locais de vacinação não indicam como encaminhar uma observação de possível criadouro.'],['sanitary','A fiscalização sanitária de alimentos não substitui a orientação da Vigilância Ambiental para água parada.']],
 sanitary:[['dengue','A Vigilância Ambiental trata de situações como possíveis criadouros; higiene de alimentos requer o canal sanitário pertinente.'],['vaccination','A orientação de vacinação não informa atribuições e contatos dos núcleos de inspeção sanitária.']]
};
/** One GDF-indicated source, two case-specific alternatives; all are real services. */
export function sourceChoices(route:GdfRoute):SourceChoice[]{
 const correct:SourceChoice={value:'oficial',key:`gdf-${route.id}`,label:route.source,feedback:'★ Este site ajuda a investigar: '+caseScript(route).questions[4]+' Abra a página e conte o que encontrou.'};
 const alternatives:SourceChoice[]=route.id==='park'?[
  {value:'participa',key:'participa',label:'Participa DF • pedidos de informação e ouvidoria',feedback:'Para consultar os horários já publicados, comece pela fonte do parque. O Participa DF pode ser usado para informação existente não localizada ou manifestação pertinente, discutidas na etapa 7.'},
  {value:'transparency',key:'transparency',label:'Portal da Transparência • receitas e despesas',feedback:'O recorte de receitas e despesas não informa os horários de acesso por portão. Procure a fonte responsável pelo funcionamento do parque.'}
 ]:ALTERNATIVES[route.id].map(([id,feedback])=>{const alternative=GDF_ROUTES.find(r=>r.id===id)!;return {value:id,key:('gdf-'+id) as LinkKey,label:alternative.source,feedback}});
 const choices=[correct,...alternatives],offset=Math.max(0,GDF_ROUTES.findIndex(r=>r.id===route.id))%3;
 return [...choices.slice(offset),...choices.slice(0,offset)];
}

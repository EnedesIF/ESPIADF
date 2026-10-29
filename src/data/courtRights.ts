import type {GdfRoute} from './gdf/routes';
import type {CaseScript} from './caseScripts';
export const COURT_NORM_URL='https://www.sinj.df.gov.br/sinj/Norma/698986606f294f7bb6cf57fd89c308cd/Ordem_de_Servi_o_30_05_06_2025.html';
export const COURT_ADMIN_URL='https://www.aguasclaras.df.gov.br/';
export const COURT_STEPS=['Definir a dúvida','Identificar a fonte oficial','Consultar a norma','Ouvir a outra perspectiva','Confrontar a alegação com as fontes','Organizar fatos e lacunas','Escolher o encaminhamento','Interpretar o retorno','Orientar a comunidade'];
export const COURT_STEP_BY_KIND:Record<string,number>={route:1,agent:2,board:3,compare:4,source:5,verify:5,solution:6,channel:7,response:8,final:9};
export const COURT_ROUTE_UPDATE:Partial<GdfRoute>={
 title:'A quadra é pública. Mas quem pode usar?',question:'Outro grupo afirma ter prioridade na quadra às quartas-feiras, às 17h. O que precisamos verificar?',
 initial:'A equipe quer jogar futebol numa quadra pública de Águas Claras na quarta-feira, às 17h. Outro grupo afirma que tem prioridade nesse horário. Será que isso é verdade? Investiguem as regras oficiais e descubram como resolver a situação de forma justa.',
 agency:'Administração Regional de Águas Claras',source:'SINJ-DF • Ordem de Serviço nº 30/2025 — Águas Claras',url:COURT_NORM_URL,
 search:'Consultem a norma de utilização dos espaços esportivos sob gestão da Administração de Águas Claras. Diferenciem uso comunitário, programação autorizada e alegação de prioridade.',
 facts:['Situação fictícia: outro grupo afirma ter prioridade na quadra às quartas-feiras, às 17h.','A alegação de um frequentador precisa ser confrontada com a regra e com eventual programação ou autorização do responsável pelo espaço.'],
 other:'Nosso grupo joga aqui toda quarta-feira, às 17h. Por isso, esse horário é nosso!',
 limit:'A norma geral não comprova autorização para este grupo, nesta quadra e neste horário. Confiram a gestão do espaço, o alcance atual da norma e eventual programação autorizada.',
 record:'Norma consultada, link, data, trecho relevante, o que foi confirmado, o que não foi possível verificar e orientação à comunidade.',
 participation:'A consulta pode ser suficiente. Para informação pública existente não localizada, avaliem a LAI; diante de impedimento irregular real ou necessidade de providência, avaliem a ouvidoria. O jogo não envia solicitações.',
 warning:'',extra:{label:'Administração Regional de Águas Claras • orientação e contatos',url:COURT_ADMIN_URL}
};
export const COURT_SCRIPT_UPDATE:Partial<CaseScript>={
 sourceTitle:'Conferir a regra e a eventual autorização',
 agent:'As quadras públicas atendem à comunidade, mas devem seguir regras de utilização. Alguns horários podem ter programação autorizada. Consultem a norma oficial antes de concluir quem pode usar o espaço.',
 verify:'Ter usado a quadra antes não significa que o próximo horário esteja garantido. Uma autorização específica precisa ser confirmada com quem administra o espaço.',
 response:'Resposta simulada para a atividade: o uso da quadra deve respeitar as regras do espaço. Para saber se há autorização para o horário pretendido, é necessário consultar a programação da unidade responsável. Esta mensagem não representa uma resposta real da Administração.',
 hypothesis:'Que documento ou informação pode comprovar autorização para o grupo e o horário alegados?',
 questions:[
 'Antes de decidir quem pode usar o espaço, o que precisamos descobrir?',
 'Quem administra o espaço e onde a equipe pode consultar as regras oficiais de utilização da quadra?',
 'O uso de quadra pública exige sempre reserva? Expliquem com base no trecho da norma que consultaram.',
 'O que a fala do frequentador comprova? Que informação oficial ainda falta verificar?',
 'Que documento ou informação pode confirmar se existe uso autorizado para a quarta-feira às 17h?',
 'A fonte consultada comprova que o outro grupo tem autorização para usar a quadra exclusivamente na quarta-feira às 17h? O que falta confirmar?',
 'O que sabemos sobre a regra de uso e o que ainda precisa ser confirmado? Indiquem a fonte e o próximo passo.',
 'Por que a equipe escolheu esse encaminhamento? Registrem a conclusão ou a minuta adequada à necessidade.',
 'O retorno comprova disponibilidade ou autorização para quarta-feira às 17h? O que ainda falta verificar?',
 'Que orientação a equipe daria aos moradores para usar a quadra respeitando as regras e os demais usuários?'
 ],
 clues:[
 'Outro grupo diz que a quadra é reservada para ele às quartas-feiras. Descubram o que precisa ser verificado antes de aceitar essa afirmação.',
 'Procurem a Administração Regional e a regra oficial de utilização dos espaços esportivos.',
 'Encontrem a Ordem de Serviço nº 30/2025 no SINJ-DF. Leiam as condições de uso comunitário e de atividades autorizadas.',
 'Ouçam o outro frequentador. Jogar sempre no mesmo horário comprova uma autorização exclusiva?',
 'Confrontem a alegação com a norma. Procurem eventual programação ou autorização; se não a encontrarem, registrem a lacuna.',
 'Uma boa solução separa fatos, opiniões e dúvidas. Organizem a regra encontrada e quem fará cada parte do plano.',
 'Nem toda dúvida exige manifestação: consulta suficiente, informação existente não localizada pela LAI ou providência diante de problema real pela ouvidoria.',
 'Leiam a resposta simulada e identifiquem o que ela esclarece e o que ainda não confirma.',
 'Reúnam a norma, o trecho consultado e os limites da conclusão. Orientem a comunidade sem afirmar que uma reserva foi feita.'
 ]
};
export const COURT_TASK_TITLES:Record<string,string>={route:'Nossa dúvida',agent:'Conversar com a Administração',board:'Consultar a norma oficial',compare:'Ouvir o outro grupo',source:'Conferir a regra',verify:'Verificar a alegação',solution:'Organizar fatos e lacunas',channel:'Escolher o encaminhamento',response:'Interpretar o retorno simulado',final:'Orientar a comunidade'};

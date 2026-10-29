import type {CampaignId} from '@/types';
import type {CityStage} from './cityMissions';
export const TEAM_ROLES={
 campo:{name:'Explorador de campo',task:'Observar objetos e verificar outro ponto da Região Administrativa.'},
 escuta:{name:'Repórter da comunidade',task:'Ouvir personagens e comparar experiências.'},
 dados:{name:'Analista de evidências',task:'Escolher ferramentas do GDF e reunir fontes.'},
 articulacao:{name:'Articulador de soluções',task:'Propor a intervenção e revisar a entrega coletiva.'},
 participacao:{name:'Porta-voz da participação',task:'Preparar o encaminhamento e explicar a escolha do instrumento público.'},
 verificacao:{name:'Verificador de informações',task:'Cruzar fontes, verificar limites e avaliar a resposta recebida.'}
};
export type TeamRole=keyof typeof TEAM_ROLES;
export const ROLE_FOR_STAGE:Record<CityStage,TeamRole>={contact:'escuta',inspect:'campo',listen:'escuta',research:'dados',verify:'campo',action:'articulacao',participate:'participacao',impact:'verificacao',return:'articulacao',done:'articulacao'};
export interface Consequence{benefit:string;limit:string;reaction:string;next:string;metrics:[number,number,number]}
/** Indicadores de jogo, sem previsão de impacto real. Ordem: informação, acesso, cuidado. */
export const CONSEQUENCES:Record<CampaignId,Consequence[]>={
 mobility:[
 {benefit:'O aviso mostra o desvio e o acesso ao itinerário.',limit:'A informação melhora, mas a frequência dos ônibus permanece igual.',reaction:'Caio: Agora sei onde embarcar. Ainda preciso conferir se o horário atende à minha aula.',next:'Acompanhar os horários com usuários da linha.',metrics:[90,55,45]},
 {benefit:'Um ponto de orientação ajuda quem tem dificuldade para interpretar o trajeto.',limit:'O apoio depende de pessoas disponíveis; não amplia a frota.',reaction:'Caio: Consegui pedir ajuda, mas o ponto precisa funcionar nos horários de aula.',next:'Combinar horários de apoio e sinalização acessível.',metrics:[70,90,55]},
 {benefit:'A proposta de revisão de horários aparece no mural de acompanhamento.',limit:'O pedido ainda depende de análise. Nenhum horário foi alterado nesta simulação.',reaction:'Caio: Nossa necessidade foi registrada. Falta acompanhar a resposta sobre viabilidade.',next:'Solicitar retorno sobre o planejamento e manter informação provisória.',metrics:[55,65,80]}],
 work:[
 {benefit:'O mural passa a destacar edital, requisitos e prazo.',limit:'Divulgar regras não resolve sozinho dificuldades com documentos.',reaction:'Bia: Entendi as regras. Ainda há colegas que precisam de apoio para se inscrever.',next:'Observar se os estudantes conseguem completar a inscrição.',metrics:[95,60,45]},
 {benefit:'Um balcão de apoio orienta a preparação de documentos.',limit:'O atendimento precisa de equipe e não altera os critérios do edital.',reaction:'Bia: Agora tenho onde tirar dúvidas. Precisamos divulgar quando haverá atendimento.',next:'Definir atendimento e conferir as regras com o órgão.',metrics:[70,95,60]},
 {benefit:'Novos avisos levam a oportunidade a outros pontos da escola.',limit:'Maior alcance pode gerar dúvidas se os avisos não forem atualizados.',reaction:'Bia: Mais colegas viram a oportunidade. O prazo precisa continuar correto em todos os avisos.',next:'Indicar responsável pela atualização da divulgação.',metrics:[80,80,50]}],
 territory:[
 {benefit:'Uma lixeira aparece perto dos bancos e o recorte é limpo na demonstração.',limit:'A conservação depende de coleta e cuidado contínuos.',reaction:'Marcos: O lugar está melhor. Quem vai acompanhar a coleta e o uso?',next:'Verificar manutenção e acessibilidade do ponto de descarte.',metrics:[50,65,95]},
 {benefit:'Placas orientam a convivência e preservam o acesso ao espaço.',limit:'A sinalização não substitui limpeza nem diálogo entre usuários.',reaction:'Marcos: As orientações ajudam. Ainda precisamos cuidar dos resíduos.',next:'Ouvir diferentes usuários sobre as orientações.',metrics:[90,85,55]},
 {benefit:'Uma agenda comunitária organiza propostas de uso da praça.',limit:'A agenda precisa ser pactuada e não garante manutenção.',reaction:'Marcos: Podemos combinar atividades, sem excluir quem usa a praça de outro jeito.',next:'Revisar a agenda com usuários de diferentes horários.',metrics:[75,95,60]}],
 health:[
 {benefit:'O recipiente recebe uma tampa no cenário.',limit:'Cuidar deste ponto não comprova redução de notificações nem elimina outros riscos.',reaction:'Helena: Este ponto foi cuidado. O bairro inteiro ainda precisa de atenção.',next:'Acompanhar ações ambientais com a equipe responsável.',metrics:[50,55,95]},
 {benefit:'Uma placa destaca cuidado ambiental e informação verificada.',limit:'O aviso não elimina a água acumulada no recipiente.',reaction:'Helena: Entendi o cuidado necessário, mas este recipiente continua descoberto.',next:'Articular uma medida ambiental junto à orientação.',metrics:[95,65,40]},
 {benefit:'Um ponto de orientação conecta moradores às informações oficiais.',limit:'O atendimento precisa continuar e não substitui a ação ambiental.',reaction:'Helena: Posso tirar dúvidas com informação confiável. Ainda precisamos cuidar do ambiente.',next:'Combinar orientação e acompanhamento das ações previstas.',metrics:[80,95,60]}]
};

export const STAGE_TASKS:Record<CityStage,{action:string;delivery:string}>={
 contact:{action:'Leia ou ouça o relato inicial e identifique o problema apresentado.',delivery:'Responda com suas palavras: qual é o problema e o que precisa ser verificado?'},
 inspect:{action:'Observe o objeto indicado e procure informações ausentes ou contraditórias.',delivery:'Guarde a observação no dossiê para compará-la com as fontes.'},
 listen:{action:'Ouça a segunda pessoa e compare seu relato com o problema inicial.',delivery:'Registre sua interpretação: o que esse relato acrescenta e o que ainda precisa de evidência?'},
 research:{action:'Escolha ferramentas adequadas, justifique a escolha e compare os registros encontrados.',delivery:'Guarde as fontes e registre uma hipótese fundamentada, reconhecendo os limites.'},
 verify:{action:'Examine o segundo ponto do cenário e compare com as fontes já reunidas.',delivery:'Registre a segunda observação e diferencie o que foi observado do que foi inferido.'},
 action:{action:'Discuta com a equipe uma solução sustentada pelas evidências.',delivery:'Escolha a intervenção e escreva a proposta, justificativa e responsável por agir.'},
 participate:{action:'Identifique se falta informação, se há uma manifestação pertinente ou se a consulta bastou.',delivery:'Justifique o canal e prepare o texto. Na atividade real, aguarde revisão do professor antes de enviar ao órgão.'},
 impact:{action:'Compare a resposta recebida com a necessidade inicial e com as evidências.',delivery:'Explique o que foi esclarecido, os limites e o que exige acompanhamento.'},
 return:{action:'Revise com a equipe a conclusão e as entregas da rota.',delivery:'Registre descobertas e dúvida restante. Na atividade real, anexe fonte, data, print ou foto e explicação para o professor validar.'},
 done:{action:'Consulte a devolutiva e acompanhe o que ficou pendente.',delivery:'Revise as entregas se o professor solicitar ajustes.'}
};
/** Legacy teams receive a stable mapping from their registration roles, never per campaign. */
export function registrationAssignments(members:import('@/types').Member[]){
 const legacy:Record<string,TeamRole>={campo:'campo',mapeador:'campo',dados:'dados',pesquisador:'dados',comunicador:'escuta',articulador:'participacao',relator:'articulacao',estrategista:'verificacao'};
 const result:Record<string,string>={};for(const [i,r] of Object.keys(TEAM_ROLES).entries()){const owner=members.find(m=>m.missionRole===r)??members.find(m=>!m.missionRole&&legacy[m.role]===r)??members[i%members.length];result[r]=owner.id}return result;
}

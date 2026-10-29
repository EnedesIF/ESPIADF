import type {GdfRoute} from './gdf/routes';
import type {CaseScript} from './caseScripts';
export const HEALTH_PRIVACY='Não inclua endereço residencial, dados de identificação ou informações clínicas de pessoas reais. Use somente informações públicas.';
export const UBS_ROUTE_UPDATE:Partial<GdfRoute>={
 question:'Onde encontrar uma UBS e como saber quais serviços ela oferece?',
 initial:'Uma pessoa precisa descobrir onde encontrar uma UBS e quais serviços ela oferece. Vamos pesquisar informações públicas, sem usar dados de saúde de pessoas reais.',
 agency:'SES-DF',
 other:'Uma pessoa acredita que uma UBS próxima garante atendimento imediato. Como podemos conferir os serviços e as orientações de acesso?',
 facts:['Registro fictício: a unidade e o local de referência servem apenas ao jogo. Use um local público como referência para pesquisar.', 'Consulte os canais oficiais da SES-DF para verificar a localização, os serviços e as orientações reais. Encontrar uma UBS no mapa não garante consulta ou atendimento imediato.'],
 limit:'Estar perto da UBS não significa atendimento imediato. Confira o serviço e como acessá-lo antes de orientar a pessoa.',
 record:'Unidade ou serviço pesquisado, fonte oficial, informação confirmada, data da consulta, orientação de acesso e dúvida ainda não resolvida.',
 participation:'Verifique primeiro se a informação já está disponível. Use a LAI para solicitar informação pública existente não encontrada; a ouvidoria para relatar uma situação concreta do serviço. Dúvidas clínicas devem ser tratadas pelos canais de saúde apropriados.'
};
export const UBS_SCRIPT_UPDATE:Partial<CaseScript>={
 sourceTitle:'Consultar as fontes oficiais da UBS',
 agent:'Oi, equipe! Para encontrar uma UBS, consultem os canais oficiais da Secretaria de Saúde. Usem um local público como referência e verifiquem os serviços e as orientações de acesso. Não compartilhem endereços residenciais ou dados de saúde.',
 verify:'Encontrar a UBS no mapa garante atendimento imediato? O que a fonte informa e o que ainda precisa ser confirmado?',
 response:'Conteúdo fictício para o jogo — não é resposta real da SES-DF. A orientação indica onde procurar informações sobre a unidade, os serviços e o acesso. Não confirma vaga nem atendimento imediato. O que ainda precisa ser verificado com a UBS?',
 hypothesis:'Qual informação você encontrou? Informe o nome da fonte e resuma o que ela esclarece sobre a localização ou os serviços da UBS.',
 questions:[
 'Quais informações precisamos verificar para encontrar uma UBS e conhecer seus serviços?',
 'O que precisamos conferir para orientar alguém a encontrar uma UBS e consultar seus serviços?',
 'Quais informações do registro ajudam a localizar a UBS? A referência escolhida é um local público?',
 'O que devemos verificar antes de afirmar que essa UBS oferece o atendimento procurado?',
 'Qual informação você encontrou? Informe o nome da fonte e resuma o que ela esclarece sobre a localização ou os serviços da UBS.',
 'Encontrar a UBS no mapa garante atendimento imediato? O que a fonte informa e o que ainda precisa ser confirmado?',
 'Como a equipe vai orientar alguém a localizar uma UBS e consultar seus serviços? Indiquem a fonte, a informação confirmada e o ponto a verificar.',
 'A consulta resolveu a dúvida ou falta uma informação pública ou situação concreta do serviço a encaminhar?',
 'O que o retorno confirma? O que não garante e ainda precisa ser verificado com o serviço?',
 'Que informação real de uma UBS a equipe conferiu e qual orientação ou participação pertinente realizou?'
 ],
 clues:[
 'Uma pessoa precisa localizar uma UBS e descobrir onde consultar seus serviços. Comecem pelo mapa e procurem pistas para responder.',
 'Use um local público como referência para pesquisar uma UBS. Não informe endereços residenciais nem dados de saúde de pessoas reais.',
 'Antes de afirmar que há atendimento, confira os serviços e as orientações de acesso em fontes oficiais.',
 'Qual destas ferramentas ajuda a localizar uma UBS e consultar os serviços oferecidos?',
 'Encontrar a UBS no mapa não garante atendimento imediato. Confira o que a fonte informa e o que ainda depende do serviço.',
 'Montem um plano para orientar alguém a localizar uma UBS e consultar seus serviços, usando informações públicas.',
 'Verifique primeiro se a informação já está disponível. LAI é para informação pública; ouvidoria é para uma situação concreta do serviço; questões clínicas seguem para os canais de saúde.',
 'Identifique o que o retorno confirma e o que ainda precisa ser verificado com a UBS. O conteúdo é fictício e educativo.',
 'Consolidem a descoberta, a fonte efetivamente consultada, a data e as contribuições já registradas. Não é necessário contatar órgãos ou relatar casos pessoais para concluir.'
 ]
};

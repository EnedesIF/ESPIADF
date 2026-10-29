/** Revisão pedagógica GDF — cenário 1, recebida em 29/10/2026. */
import type {GdfRoute} from './gdf/routes';
import type {CaseScript} from './caseScripts';
export const CIVIC_CONCEPTS={
  "control": "Controle social é quando a população acompanha os serviços e as decisões do governo e participa para ajudar a melhorá-los.",
  "active": "Transparência ativa é quando o governo publica informações para qualquer pessoa consultar, sem precisar fazer um pedido.",
  "passive": "Transparência passiva é quando o governo fornece uma informação pública em resposta a um pedido feito por uma pessoa.",
  "lai": "A Lei de Acesso à Informação (LAI) garante a qualquer pessoa o direito de pedir informações públicas aos órgãos e entidades do governo.",
  "request": "O pedido de acesso à informação é um direito garantido por lei. Qualquer pessoa ou empresa pode pedir dados, documentos ou registros que órgãos e entidades públicas produzem ou guardam. No pedido, expliquem claramente qual informação desejam receber.",
  "ombudsman": "A ouvidoria é um canal para enviar elogios, sugestões, solicitações, reclamações e denúncias sobre serviços públicos. É uma forma de participar e ajudar a melhorar esses serviços.",
  "practice": "A equipe praticou controle social ao consultar informações oficiais, avaliar os resultados e decidir como compartilhar ou encaminhar suas descobertas."
} as const;
export const ROLE_ACTIONS:Record<string,string>={
  "escuta": "Conhecer o problema e ouvir orientações.",
  "campo": "Explorar o percurso e registrar evidências.",
  "verificacao": "Ouvir outra perspectiva e comparar relatos.",
  "dados": "Consultar fontes e conferir as informações.",
  "articulacao": "Planejar a solução e decidir como agir.",
  "participacao": "Analisar o retorno e apresentar as descobertas."
};
export const MOBILITY_ROUTE_UPDATES:Record<string,Partial<GdfRoute>>={
  "transport": {
    "question": "Qual ônibus podemos pegar para chegar ao IFB e em quais horários ele passa?",
    "initial": "Precisamos chegar ao IFB às 8h. O mural do jogo apresenta uma linha de ônibus e um horário estimado. Vamos descobrir se essas informações correspondem às fontes oficiais.",
    "facts": [
      "DEMO-214 (fictícia) • sentido Escola • dia útil • partida prevista 6h50 • chegada prevista 7h42.",
      "A previsão pode mudar. Confiram o dia, o sentido e o itinerário antes de planejar a viagem."
    ],
    "limit": "A linha DEMO-214 é fictícia. No DF no Ponto, pesquisem linhas reais que atendam ao trajeto escolhido.",
    "other": "Peguei essa linha em outro dia e esperei mais. Será que o horário que vi vale para a viagem de vocês hoje?",
    "deep": "Quer saber mais sobre os recursos públicos destinados ao transporte? Explore despesas ou programas relacionados, sem associar valores a uma linha específica sem fonte."
  },
  "accessibility": {
    "initial": "Uma calçada irregular perto da escola dificulta a passagem de pedestres e cria obstáculos para pessoas com mobilidade reduzida. A equipe vai investigar como pedir melhorias.",
    "agency": "Orientação sobre a calçada",
    "facts": [
      "Registro fictício: desnível na calçada junto a um ponto de referência conhecido da Região Administrativa.",
      "A irregularidade dificulta a passagem de pedestres e exige cuidado especial de quem usa cadeira de rodas, carrinho ou tem mobilidade reduzida."
    ],
    "limit": "Encontrar uma orientação geral não confirma quem cuida deste trecho. Verifiquem a responsabilidade conforme o local e o serviço.",
    "other": "Eu consigo passar por aqui, mas vi outras pessoas com dificuldade. Uma delas precisou mudar de caminho. O que podemos observar para entender melhor esse problema?",
    "deep": "Quer saber mais? Consulte contratos relacionados a obras ou manutenção de calçadas. Verifique se o local e o serviço correspondem ao trecho investigado. Esta pesquisa é opcional."
  },
  "lighting": {
    "initial": "Uma luminária está apagada no caminho e seu número de identificação não está visível. A equipe precisa encontrar uma maneira de localizar o ponto para solicitar o conserto.",
    "source": "Ilumina DF • manutenção de iluminação pública",
    "url": "https://brasilia.cidadeiluminada.com.br/",
    "agency": "Orientação sobre iluminação pública",
    "facts": [
      "Observação fictícia: luminária apagada perto de um ponto de referência conhecido, sem número de identificação visível.",
      "A equipe deve verificar no canal oficial quais informações são exigidas e como acompanhar a solicitação."
    ],
    "limit": "Confiram o canal de iluminação pública; ele pode ser diferente do atendimento de problemas no fornecimento de energia. Não presumam que QR Code é obrigatório.",
    "other": "Ouvi dizer que precisamos usar um QR Code para solicitar o conserto. Será que isso é obrigatório? Onde podemos conferir?",
    "warning": "",
    "extra": {
      "label": "CEB IPes • canais oficiais e informações para manutenção",
      "url": "https://www.agenciabrasilia.df.gov.br/w/ceb-ipes-realiza-21-mil-atendimentos-de-manutencao-em-90-dias"
    }
  },
  "park": {
    "initial": "O grupo quer usar o Parque Horizonte como atalho para ir às 7h e voltar às 19h. Será possível passar pelo parque nos dois horários?",
    "other": "Costumo passar pelo parque à tarde, mas nunca precisei sair pela outra entrada às 19h. Será que ela ainda estará aberta?",
    "facts": [
      "Quadro fictício — Parque Horizonte: entrada Norte, 6h–18h; entrada Sul, 8h–18h.",
      "A equipe precisa passar às 7h e voltar às 19h. Cada entrada pode funcionar em horários diferentes."
    ],
    "limit": "O quadro pertence ao parque fictício. Confiram os horários atuais e eventuais avisos sobre os acessos do parque real escolhido."
  }
};
export const MOBILITY_SCRIPT_UPDATES:Record<string,Partial<CaseScript>>={
  "transport": {
    "places": {"board":"square","compare":"square","source":"square","verify":"park","solution":"lab","channel":"park","response":"lab"},
    "agent": "Antes de decidir, confiram se o horário é de um dia útil e se o ônibus segue no sentido da escola. O relato de outra pessoa pode ser de outro dia.",
    "verify": "A previsão indica a chegada às 7h42, mas pode mudar. Que margem de segurança vocês escolheriam? Como verificar o trajeto de volta?",
    "response": "No exercício, a orientação trata da viagem de ida no dia e sentido indicados, mas não confirma o trajeto de volta. A equipe precisa conferir essa informação antes de recomendar o percurso.",
    "questions": [
      "Que informações precisamos para planejar a ida e a volta?",
      "O que devemos conferir para saber se o horário serve para nossa viagem?",
      "Qual sentido, dia e horário aparecem no mural? A chegada prevista permite entrar às 8h?",
      "O relato do passageiro confirma o horário de hoje? Expliquem considerando o dia da viagem.",
      "Qual linha, sentido e horários encontraram? A opção permite chegar antes das 8h? Indiquem a fonte consultada.",
      "O horário consultado corresponde ao dia e ao sentido da viagem? O que pode causar atrasos?",
      "Qual é o plano de ida e volta da equipe? Incluam uma alternativa em caso de atraso.",
      "A consulta resolveu a dúvida? Se não, o que falta saber ou resolver?",
      "O retorno esclarece o trajeto de volta? Que informação ainda falta conferir?",
      "Qual trajeto a equipe recomenda e por quê?"
    ],
    "clues": [
      "A equipe precisa chegar ao IFB às 8h. Que informações ajudam a planejar o trajeto?",
      "Uma previsão não é garantia de chegada. Confiram a data, o sentido e o itinerário antes de tirar conclusões.",
      "O passageiro conhece outra experiência de viagem. Ouçam quando e em que sentido ele viajou.",
      "O número da linha não basta: verifiquem também o sentido e os horários do trajeto.",
      "Comparem o dia e o sentido da pesquisa com a viagem planejada.",
      "A ida foi planejada. Como conferir a viagem de volta e uma alternativa em caso de atraso?",
      "Consultem o que está publicado antes de decidir se falta uma informação ou providência.",
      "O retorno é fictício. Identifiquem o que ele esclarece e o que ainda falta conferir.",
      "Reúnam as fontes e as descobertas já registradas."
    ]
  },
  "accessibility": {
    "agent": "Essa irregularidade pode dificultar o caminho de qualquer pedestre e tornar a passagem ainda mais difícil para quem tem mobilidade reduzida. Registrem onde fica o problema. Depois vamos descobrir qual órgão pode receber a solicitação.",
    "verify": "Encontrar uma orientação geral é o primeiro passo. Mas ela não confirma quem cuida exatamente deste trecho. O que ainda precisamos verificar?",
    "response": "A orientação indica onde verificar a responsabilidade pela calçada e como solicitar manutenção, mas não confirma quem cuida deste trecho nem que o serviço foi realizado.",
    "questions": [
      "O que a equipe precisa descobrir sobre essa calçada?",
      "Como descrever o problema para que o órgão responsável consiga localizar a calçada e entender a dificuldade?",
      "Descreva o problema e informe uma referência para localizar a calçada.",
      "Por que a mesma calçada pode ser mais difícil de usar para algumas pessoas?",
      "O que a página informa sobre a manutenção? O que ainda precisamos confirmar?",
      "Encontramos o responsável por esta calçada ou apenas informações gerais? O que falta confirmar?",
      "Como a equipe pretende relatar o problema e indicar onde fica a calçada?",
      "O que falta resolver: consertar a calçada ou obter uma informação pública? Escolham o encaminhamento adequado.",
      "O retorno confirmou qual órgão é responsável pela calçada? O que ainda precisamos verificar?",
      "Qual foi a principal descoberta da equipe e o que recomenda para melhorar a passagem nessa calçada?"
    ],
    "clues": [
      "Há um desnível no caminho. Observem como ele dificulta a passagem.",
      "Registrem o problema e um ponto de referência conhecido da Região Administrativa.",
      "Ouçam a experiência do pedestre e comparem dificuldades diferentes.",
      "Onde podemos procurar informações sobre a manutenção dessa calçada?",
      "Uma orientação geral não confirma o responsável por este trecho.",
      "Reúnam o que sabem e o que falta confirmar para solicitar uma solução.",
      "Consertar a calçada e pedir uma informação pública são necessidades diferentes.",
      "O retorno é fictício. Ele confirma quem cuida do trecho?",
      "Reúnam a pesquisa real e as ações que realmente realizaram."
    ]
  },
  "lighting": {
    "agent": "Como o número da luminária não está visível, procurem um ponto de referência que ajude a localizar o problema. Depois, consultem o canal oficial de iluminação pública para descobrir como pedir e acompanhar o reparo.",
    "verify": "Na página de atendimento, verifiquem quais informações são necessárias para localizar a luminária e acompanhar a solicitação. Se não conseguirem acessar o serviço, informem ao professor.",
    "response": "O canal indicado apresenta orientações de solicitação e acompanhamento. Isso não comprova que a luminária foi consertada.",
    "questions": [
      "Quais informações ajudam a identificar o local da luminária apagada?",
      "Como podemos descrever a localização da luminária apagada, mesmo sem o número de identificação?",
      "O número da luminária está visível? Que ponto de referência ajudaria a localizar o problema?",
      "Onde podemos verificar se é necessário um QR Code para solicitar o conserto?",
      "Qual canal oficial encontraram e como ele orienta solicitar o conserto da luminária?",
      "Quais dados o canal oficial solicita para localizar a luminária? Como acompanhar o atendimento?",
      "Como a equipe vai identificar a luminária e organizar a solicitação?",
      "Escolham o encaminhamento adequado à necessidade identificada.",
      "A resposta confirma o conserto ou apenas orienta como solicitar o atendimento? O que ainda precisa ser verificado?",
      "Qual canal oficial a equipe encontrou e como utilizou essa informação para orientar a solução?"
    ],
    "clues": [
      "Uma luminária está apagada no caminho e seu número não está visível. Procurem referências que ajudem a identificar o local.",
      "Há uma luminária apagada perto de um ponto de referência conhecido. O número de identificação não está visível.",
      "Ouçam a dúvida de uma pessoa que utiliza esse caminho.",
      "Precisamos descobrir como solicitar o reparo da luminária. Qual é o canal oficial indicado para esse serviço?",
      "Confiram quais dados o canal oficial solicita e como acompanhar o atendimento.",
      "Organizem a localização e as informações necessárias para solicitar reparo.",
      "Consultem o canal oficial para decidir o encaminhamento pertinente.",
      "O retorno fictício orienta atendimento; ele comprova conserto?",
      "Reúnam as informações pesquisadas. Não é necessário enviar uma solicitação real apenas para terminar o jogo."
    ]
  },
  "park": {
    "agent": "Nem todas as entradas de um parque têm o mesmo horário. Que informações a equipe precisa conferir antes de escolher o caminho?",
    "verify": "O quadro apresenta horários diferentes para cada entrada. O que a equipe pode concluir sobre a ida e a volta? Verifiquem também uma alternativa de retorno.",
    "response": "O retorno trata dos horários do parque, mas não confirma as condições do caminho externo. A equipe precisa pesquisar essa alternativa antes de recomendá-la.",
    "questions": [
      "O que a equipe quer descobrir primeiro sobre a ida às 7h e a volta às 19h?",
      "Por que é importante conferir os horários de cada entrada do parque?",
      "Compare os horários das duas entradas. Qual permite a ida às 7h? O que acontece com a volta às 19h?",
      "Por que o relato do morador não é suficiente para confirmar a travessia às 19h?",
      "Que horários de entrada e saída vocês encontraram na fonte oficial? A consulta permite planejar a ida e a volta?",
      "Com base nos horários, o parque é uma opção segura para a ida e a volta? Expliquem.",
      "Qual caminho usaremos na ida? Qual alternativa verificaremos para a volta?",
      "A pesquisa já responde à dúvida ou é necessário solicitar uma informação?",
      "O que o retorno esclareceu sobre os horários e o que ainda precisamos conferir sobre o caminho externo?",
      "Qual parque a equipe pesquisou? Podemos utilizá-lo nos horários necessários? Que orientação vamos compartilhar?"
    ],
    "clues": [
      "O Parque Horizonte tem entradas diferentes. Precisamos conferir se podemos entrar às 7h e sair às 19h.",
      "Procurem o quadro fictício e confiram separadamente os horários de ida e volta.",
      "O morador conhece a passagem à tarde. Ouçam se ele já saiu às 19h.",
      "Comecem pela página oficial do parque para verificar os horários.",
      "Confiram o acesso que pretendem utilizar, na ida e na volta.",
      "Usem os horários para planejar a ida e uma alternativa para a volta.",
      "Avaliem se a consulta já resolveu a dúvida antes de solicitar informações.",
      "O retorno é fictício e não confirma as condições do caminho externo.",
      "Confirmem o parque real pesquisado e revisem os registros do percurso."
    ]
  }
};
export const MOBILITY_MAP_DESCRIPTIONS:Record<string,string[]>={
  "transport": [
    "Observe o ponto e procure informações que ajudem a entender o trajeto.",
    "Siga pelo caminho da escola e encontre pistas para continuar a investigação.",
    "Converse com a agente e receba orientações para avançar no percurso.",
    "Reúna o que a equipe descobriu e organize os próximos passos."
  ],
  "accessibility": [
    "Observe o local e identifique o problema.",
    "Conheça diferentes experiências de quem passa por aqui.",
    "Encontre informações para compreender a situação.",
    "Organize as descobertas e pense em soluções."
  ],
  "lighting": [
    "Observe a área e identifique o problema.",
    "Conheça relatos de quem passa pelo local.",
    "Descubra onde buscar informações.",
    "Organize as descobertas da equipe."
  ],
  "park": [
    "Conheça o caminho que a equipe quer utilizar.",
    "Observe uma alternativa de passagem.",
    "Consulte as informações sobre acesso ao parque.",
    "Organize as descobertas da equipe."
  ]
};
export const reviewedMobility=(route:GdfRoute)=>route.campaign==='mobility';

MOBILITY_MAP_DESCRIPTIONS.ubs=['Conheça a situação e consulte o mapa.','Explore o caminho e encontre a orientação da unidade.','Converse sobre o acesso e consulte o registro da unidade.','Pesquise informações públicas e organize as descobertas.'];

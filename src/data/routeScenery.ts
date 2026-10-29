/** Fictional illustrated locations for each case specified by the GDF.
 * Order: meeting plaza, connecting promenade, field guidance, team planning room.
 * No image conveys live schedules, clinical information or real statistics.
 */
export const ROUTE_SCENERY:Record<string,[string,string,string,string]>={
 transport:['Praça do ponto de ônibus','Alameda do trajeto escolar','Orientação do transporte público','Sala de planejamento do trajeto'],
 accessibility:['Praça do acesso público','Alameda da calçada em observação','Orientação de manutenção e acessibilidade','Sala de planejamento da acessibilidade'],
 lighting:['Praça da iluminação pública','Alameda das luminárias','Orientação de iluminação pública','Sala de planejamento do reparo'],
 park:['Praça do percurso pelo parque','Alameda externa do parque','Entradas do parque fictício','Sala de planejamento da travessia'],
 employment:['Praça das oportunidades de trabalho','Alameda da orientação profissional','Centro de orientação para emprego','Sala do plano de carreira'],
 training:['Praça da formação digital','Alameda das oficinas digitais','Centro de formação digital','Laboratório de projetos digitais'],
 pay:['Praça das carreiras públicas','Alameda da informação pública','Orientação de pesquisa remuneratória','Sala de pesquisa sobre remuneração'],
 vacancies:['Praça das carreiras do serviço público','Alameda da administração pública','Orientação sobre cargos públicos','Sala de pesquisa de cargos e seleções'],
 court:['Praça e quadra comunitária','Alameda do esporte comunitário','Orientação de uso da quadra','Sala de planejamento do uso da quadra'],
 waste:['Praça da separação de resíduos','Alameda da coleta convencional e seletiva','Orientação sobre coleta e separação','Sala do plano de resíduos da Região Administrativa'],
 police:['Praça da informação cidadã','Alameda dos relatórios públicos','Pavilhão de leitura de relatórios','Sala de pesquisa dos indicadores da PMDF'],
 ubs:['Praça de acesso à UBS','Alameda dos serviços de saúde','Orientação de acesso à UBS','Sala de pesquisa dos serviços da UBS'],
 vaccination:['Praça da orientação sobre vacinação','Alameda do acesso à vacinação','Orientação de acesso à sala de vacina','Sala de pesquisa das orientações de vacinação'],
 dengue:['Praça da prevenção ambiental','Alameda da observação de água parada','Orientação da Vigilância Ambiental','Sala do plano de prevenção'],
 sanitary:['Praça da lanchonete fictícia','Alameda da observação de higiene','Orientação da Vigilância Sanitária','Sala do relato e encaminhamento sanitário']
};

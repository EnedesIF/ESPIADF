import type { RoleId } from '@/types';

export interface RoleDef {
  id: RoleId;
  name: string;
  short: string;
  mission: string;
  task: { id: string; text: string; check: string; min: number };
}

/** Papéis da equipe. Cada um tem uma tarefa complementar verificada automaticamente
 *  pela telemetria — quem estiver "no controle" pode cumprir tarefas de qualquer papel,
 *  mas o crédito vai para o papel correspondente, estimulando o revezamento. */
export const ROLES: RoleDef[] = [
  { id: 'campo', name: 'Investigador de campo', short: 'CAMPO', mission: 'Observa o território e registra o que vê.',
    task: { id: 't_campo', text: 'Registrar 2 observações de campo com a câmera', check: 'kind:campo', min: 2 } },
  { id: 'dados', name: 'Analista de dados', short: 'DADOS', mission: 'Consulta bases públicas e lê números com cuidado.',
    task: { id: 't_dados', text: 'Extrair 2 registros de dados públicos', check: 'kind:dado', min: 2 } },
  { id: 'estrategista', name: 'Estrategista', short: 'ESTRATÉGIA', mission: 'Formula e revisa hipóteses.',
    task: { id: 't_estr', text: 'Revisar a hipótese ativa diante de uma evidência', check: 'revisions', min: 1 } },
  { id: 'comunicador', name: 'Comunicador', short: 'COMUNICAÇÃO', mission: 'Escuta pessoas e diferencia fato de boato.',
    task: { id: 't_com', text: 'Conversar com 5 pessoas diferentes', check: 'talked', min: 5 } },
  { id: 'mapeador', name: 'Mapeador', short: 'MAPA', mission: 'Percorre e mapeia os pontos críticos.',
    task: { id: 't_map', text: 'Visitar 5 pontos do mapa', check: 'visited', min: 5 } },
  { id: 'pesquisador', name: 'Pesquisador', short: 'PESQUISA', mission: 'Procura documentos e registros oficiais.',
    task: { id: 't_pesq', text: 'Encontrar 1 documento público', check: 'kind:documento', min: 1 } },
  { id: 'articulador', name: 'Articulador', short: 'ARTICULAÇÃO', mission: 'Descobre quem pode agir e aciona o canal certo.',
    task: { id: 't_art', text: 'Registrar uma manifestação no Participa DF', check: 'participation', min: 1 } },
  { id: 'relator', name: 'Relator', short: 'RELATO', mission: 'Organiza a proposta e conduz o pitch.',
    task: { id: 't_rel', text: 'Montar a proposta no Laboratório de Soluções', check: 'flag:solution_ready', min: 1 } }
];

export const roleById = (id: RoleId) => ROLES.find(r => r.id === id)!;

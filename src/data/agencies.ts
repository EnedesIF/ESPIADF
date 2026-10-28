import type { AgencyDef } from '@/types';

/** Diretório de órgãos usado pelo app "Portal do GDF" dentro do jogo.
 *  As descrições de competência são RESUMOS DIDÁTICOS e devem ser validadas
 *  pela CGDF antes do uso em produção. */
export const AGENCIES: AgencyDef[] = [
  { id: 'semob', short: 'SEMOB', name: 'Secretaria de Transporte e Mobilidade',
    scope: 'Planejamento e gestão do transporte público coletivo: linhas, itinerários, frota e fiscalização da operação.' },
  { id: 'metro', short: 'METRÔ-DF', name: 'Companhia do Metropolitano do DF',
    scope: 'Operação do sistema metroviário.' },
  { id: 'novacap', short: 'NOVACAP', name: 'Companhia Urbanizadora da Nova Capital',
    scope: 'Execução de obras de urbanização e infraestrutura urbana, como pavimentação e calçadas.' },
  { id: 'cebipes', short: 'CEB IPES', name: 'CEB Iluminação Pública e Serviços',
    scope: 'Manutenção e expansão da iluminação pública.' },
  { id: 'admreg', short: 'ADM. REGIONAL', name: 'Administração Regional',
    scope: 'Zeladoria e serviços locais da Região Administrativa; ponte entre moradores e órgãos do GDF.' },
  { id: 'sesdf', short: 'SES-DF', name: 'Secretaria de Estado de Saúde',
    scope: 'Gestão da rede pública de saúde e da vigilância em saúde.' },
  { id: 'cgdf', short: 'CGDF', name: 'Controladoria-Geral do Distrito Federal',
    scope: 'Controle interno, transparência e coordenação da ouvidoria do Poder Executivo distrital.' }
];

export const agencyById = (id: string) => AGENCIES.find(a => a.id === id);

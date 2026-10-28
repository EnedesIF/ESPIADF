/** Registro das ferramentas públicas que aparecem no celular do personagem.
 *  As URLs são as indicadas pelo projeto. Onde não há URL confirmada, o ADMIN pode preencher.
 *  Todo conteúdo exibido DENTRO do jogo é simulado e identificado como tal. */
export interface PublicTool {
  id: string;
  name: string;
  tagline: string;
  url?: string;
  kind: 'search' | 'live' | 'participation' | 'directory';
  glyph: string; // nome do ícone SVG
}

export const PUBLIC_TOOLS: PublicTool[] = [
  { id: 'dfnoponto', name: 'DF no Ponto', tagline: 'Linhas, horários e ônibus em tempo real', url: 'https://dfnoponto.semob.df.gov.br', kind: 'live', glyph: 'bus' },
  { id: 'participa', name: 'Participa DF', tagline: 'Ouvidoria e acesso à informação', url: 'https://participa.df.gov.br', kind: 'participation', glyph: 'megaphone' },
  { id: 'transparencia', name: 'Transparência DF', tagline: 'Contratos, despesas e orçamento', url: 'https://www.transparencia.df.gov.br', kind: 'search', glyph: 'coin' },
  { id: 'dadosabertos', name: 'Dados Abertos DF', tagline: 'Bases de dados governamentais', url: 'https://www.dados.df.gov.br', kind: 'search', glyph: 'grid' },
  { id: 'portalgdf', name: 'Portal do GDF', tagline: 'Órgãos, serviços e competências', url: 'https://www.df.gov.br', kind: 'directory', glyph: 'building' },
  { id: 'infosaude', name: 'InfoSaúde DF', tagline: 'Painéis da saúde pública', url: 'https://info.saude.df.gov.br', kind: 'search', glyph: 'pulse' },
  { id: 'dengue', name: 'Portal Dengue', tagline: 'Arboviroses e prevenção', kind: 'search', glyph: 'drop' },
  { id: 'neoenergia', name: 'Neoenergia Brasília', tagline: 'Canais de serviços de energia elétrica', url: 'https://www.neoenergia.com/web/brasilia/sua-casa/canais-de-atendimento', kind: 'directory', glyph: 'building' },
  { id: 'sisdia', name: 'SISDIA', tagline: 'Informações ambientais do DF', kind: 'search', glyph: 'leaf' }
];

export const toolById = (id: string) => PUBLIC_TOOLS.find(t => t.id === id);

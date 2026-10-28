/* Planta do mundo "Quadra 214" — coordenadas em metros. x = leste, z = sul (norte = -z).
   Compartilhada entre a construção 3D, os dados da campanha e o minimapa. */

export type V2 = [number, number];

export const WORLD = { minX: -150, maxX: 150, minZ: -95, maxZ: 95 };

export const L = {
  spawn: [-98, -31] as V2,
  parada: [-60, 12] as V2,
  rampa: [-50, 10.2] as V2,
  posteQuebrado: [-78, -45] as V2,
  obraPlaca: [-10, -12] as V2,
  passagem: [4, -24] as V2,
  paradaCed: [70, 12] as V2,
  cedGate: [80, -27] as V2,
  admDoor: [62, 27] as V2,
  ubs: [110, 34] as V2
};

/** Ruas: retângulos [x1, z1, x2, z2] */
export const ROADS: [number, number, number, number][] = [
  [-160, -8, 160, 8],          // via principal (leste-oeste)
  [-23, -50, -13, -8],         // desvio — trecho norte (x=-18)
  [-23, -51, 43, -41],         // desvio — via da Quadra 300 (z=-46)
  [33, -50, 43, -8],           // desvio — retorno (x=38)
  [-86, -78, -78, -8],         // rua da Quadra 214 (x=-82)
  [80, 8, 88, 60]              // acesso à área central sul
];

/** Rota de ônibus (sentido leste) — com o desvio provocado pela obra. */
export const BUS_ROUTE: V2[] = [
  [-170, 4], [-60, 4], [-24, 4], [-16, 0], [-16, -40], [-12, -44], [32, -44], [36, -40], [36, 0], [40, 4], [70, 4], [180, 4]
];
/** índices de BUS_ROUTE onde há parada */
export const BUS_STOP_IDX = { parada214: 1, paradaCed: 10 };
/** trecho do desvio (índices) — ônibus andam devagar, trânsito pesado */
export const DETOUR_IDX: [number, number] = [3, 9];
export const BUS_ROUTE_OFFICIAL: V2[] = [[-170, 4], [180, 4]];
/** carros no sentido oeste (também desviam) */
export const CAR_ROUTE_WEST: V2[] = [
  [180, -4], [44, -4], [40, -8], [40, -44], [36, -48], [-14, -48], [-20, -44], [-20, -8], [-24, -4], [-170, -4]
];

/** Barreira que só bloqueia pedestres (obra + via expressa) */
export const PEDESTRIAN_WALL = { x1: 7, x2: 11, z1: -95, z2: 95 };

/** Locais para deslocamento rápido (liberado após chegar à escola) */
export const FAST_TRAVEL: { id: string; name: string; pos: V2; side: 'west' | 'east' }[] = [
  { id: 'casa', name: 'Bloco da Quadra 214', pos: [-100, -22], side: 'west' },
  { id: 'parada', name: 'Parada 214', pos: [-60, 9.5], side: 'west' },
  { id: 'obra', name: 'Obra na via', pos: [-14, -16], side: 'west' },
  { id: 'ced', name: 'Centro de Ensino', pos: [76, -20], side: 'east' },
  { id: 'adm', name: 'Administração Regional', pos: [62, 21], side: 'east' }
];

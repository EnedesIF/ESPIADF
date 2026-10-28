import type { AvatarConfig } from '@/types';

export const SKIN = ['#f1c9a5', '#e0ac85', '#c68b62', '#a86c48', '#7d4d31', '#5a3522', '#3f2618'];
export const HAIR_COLORS = ['#141010', '#2e1d14', '#5b3a22', '#8a5a2b', '#c49a5a', '#7a1f2b', '#2b5d7a', '#e6e6e6'];
export const CLOTH = ['#0f1d24', '#e9eef0', '#1d6b5a', '#2b6f9a', '#d4a72c', '#a33b3b', '#5a4a8a', '#3a3f44', '#c8562e', '#7fbf9a'];
export const SHOES = ['#f2f2f2', '#111417', '#2fe3a1', '#d4a72c', '#a33b3b', '#2b6f9a'];

export const HAIR_STYLES: AvatarConfig['hair'][] = ['curto', 'crespo', 'cacheado', 'trancas', 'coque', 'raspado', 'longo'];
export const TOPS: AvatarConfig['top'][] = ['camiseta', 'moletom', 'jaqueta', 'regata'];
export const BOTTOMS: AvatarConfig['bottom'][] = ['calca', 'bermuda', 'saia'];
export const ACCESSORIES: AvatarConfig['accessory'][] = ['nenhum', 'fone', 'bone', 'oculos', 'bandana'];

export const LABELS: Record<string, string> = {
  curto: 'Curto', crespo: 'Crespo', cacheado: 'Cacheado', trancas: 'Tranças', coque: 'Coque', raspado: 'Raspado', longo: 'Longo',
  camiseta: 'Camiseta', moletom: 'Moletom', jaqueta: 'Jaqueta', regata: 'Regata',
  calca: 'Calça', bermuda: 'Bermuda', saia: 'Saia',
  nenhum: 'Nenhum', fone: 'Fone', bone: 'Boné', oculos: 'Óculos', bandana: 'Bandana',
  A: 'Corpo A', B: 'Corpo B', C: 'Corpo C'
};

export const DEFAULT_AVATAR: AvatarConfig = {
  build: 'A', skin: 3, hair: 'crespo', hairColor: 0, top: 'moletom', topColor: 2,
  bottom: 'calca', bottomColor: 0, shoeColor: 0, backpack: true, backpackColor: 7, accessory: 'fone'
};

export function randomAvatar(seed: number): AvatarConfig {
  let s = seed * 9301 + 49297;
  const r = (n: number) => { s = (s * 9301 + 49297) % 233280; return Math.floor((s / 233280) * n); };
  return {
    build: (['A', 'B', 'C'] as const)[r(3)], skin: r(SKIN.length), hair: HAIR_STYLES[r(HAIR_STYLES.length)],
    hairColor: r(5), top: TOPS[r(TOPS.length)], topColor: r(CLOTH.length), bottom: BOTTOMS[r(2)],
    bottomColor: r(CLOTH.length), shoeColor: r(SHOES.length), backpack: r(3) > 0, backpackColor: r(CLOTH.length),
    accessory: ACCESSORIES[r(ACCESSORIES.length)]
  };
}

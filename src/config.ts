import {ESPIA_SUPABASE_URL,ESPIA_SUPABASE_ANON_KEY} from './data/supabasePublic';
/* Configuração central — marca, Supabase e parâmetros de jogo. */

export const BRAND = {
  /** Marcas oficiais fornecidas pela ENEDES. */
  enedesLogo: './brand/enedes-oficial.png',
  cgdfLogo: './brand/gdf-cgdf-oficial.png',
  enedesName: 'ENEDES',
  enedesFull: 'Escola de Negócios e Desenvolvimento Social',
  partnerName: 'CGDF',
  partnerFull: 'Controladoria-Geral do Distrito Federal'
};

export const SUPABASE = {
  url: (import.meta.env.VITE_SUPABASE_URL as string | undefined) || ESPIA_SUPABASE_URL,
  anonKey: (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || ESPIA_SUPABASE_ANON_KEY
};

export const ADMIN_PIN = (import.meta.env.VITE_ADMIN_PIN as string | undefined) ?? 'enedes-admin';

export const GAME = {
  /** segundos de jogo por segundo real */
  clockSpeed: 7,
  clockFastMultiplier: 6,
  playerSpeed: 6.2,
  runMultiplier: 1.55,
  interactRadius: 3.2,
  minMembers: 5,
  maxMembers: 10,
  telemetrySampleSec: 3,
  flushSec: 8
};

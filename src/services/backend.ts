import { SUPABASE } from '@/config';
import type { Repository } from './repository';
import { LocalRepository } from './localRepository';

/** Ponto único de acesso à persistência.
 *  Com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY definidos, usa Supabase;
 *  caso contrário, modo local. O SDK do Supabase só é baixado se for usado. */
let repo: Repository = new LocalRepository();

export async function initBackend(): Promise<Repository> {
  if (SUPABASE.url && SUPABASE.anonKey) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const { SupabaseRepository } = await import('./supabaseRepository');
      repo = new SupabaseRepository(createClient(SUPABASE.url, SUPABASE.anonKey));
    } catch (e) {
      console.warn('[MISSÃO DF] Falha ao iniciar Supabase — usando modo local.', e);
    }
  }
  return repo;
}

export const backend = () => repo;

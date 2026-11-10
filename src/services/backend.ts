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
      const { RegistrationRepository } = await import('./registrationRepository');
      repo = new RegistrationRepository(createClient(SUPABASE.url, SUPABASE.anonKey));
    } catch (e) {
      throw new Error('Não foi possível iniciar a conexão com o banco. O cadastro real está indisponível.');
    }
  }
  return repo;
}

export const backend = () => repo;

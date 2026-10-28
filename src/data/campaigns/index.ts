import type { CampaignDef, CampaignId } from '@/types';
import { mobility } from './mobility';
import { work, territory, health } from './stubs';

export const BASE_CAMPAIGNS: CampaignDef[] = [mobility, work, territory, health];

let overrides: Partial<Record<CampaignId, Partial<CampaignDef>>> = {};

/** Overrides vêm da área ADMIN (repositório). São mesclados sobre o conteúdo-base. */
export function setCampaignOverrides(o: typeof overrides) { overrides = o || {}; }

export function getCampaigns(): CampaignDef[] {
  return BASE_CAMPAIGNS.map(c => ({ ...c, ...(overrides[c.id] || {}) } as CampaignDef));
}

export function getCampaign(id: CampaignId): CampaignDef {
  return getCampaigns().find(c => c.id === id)!;
}

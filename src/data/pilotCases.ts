import type {CampaignId} from '@/types';
/** One case selection shared by the demonstration and real team entry points. */
export const PILOT_CASES:Record<CampaignId,string>={mobility:'lighting',work:'pay',territory:'waste',health:'dengue'};
export const DEFAULT_PILOT_CASE=PILOT_CASES.mobility;

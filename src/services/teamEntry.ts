import type {Team} from '@/types';
import {GDF_ROUTES} from '@/data/gdf/routes';
import {activeChallengeCase,parkState} from './parkChallenge';
export function teamEntry(team:Team):{screen:'avatar'|'choice'}|{screen:'case';routeId:string}{
 if(!team.members.every(m=>m.avatarName?.trim()))return {screen:'avatar'};
 const ongoing=GDF_ROUTES.filter(route=>activeChallengeCase(team,route.campaign)?.id===route.id&&!parkState(team,route.id).finished);
 return ongoing.length===1?{screen:'case',routeId:ongoing[0].id}:{screen:'choice'};
}

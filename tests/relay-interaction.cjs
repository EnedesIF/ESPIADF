const assert=require('node:assert/strict'),esbuild=require('esbuild');
esbuild.buildSync({stdin:{contents:"export * from './src/ui/challenge/ActivityInteraction';export * from './src/services/parkChallenge';export {GDF_ROUTES} from './src/data/gdf/routes';",resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',outfile:'/tmp/relay-interaction.cjs',alias:{'@':process.cwd()+'/src'},define:{'import.meta.env':'{}'}});
const M=require('/tmp/relay-interaction.cjs');
const mem=new Map();global.localStorage={getItem:k=>mem.get(k)||null,setItem:(k,v)=>mem.set(k,v)};global.window={dispatchEvent(){}};global.crypto=require('node:crypto').webcrypto;
const team={id:'interaction',name:'Teste',mentor:{email:'prof@test.local'},members:M.PARK_ROLES.map((missionRole,i)=>({id:'m'+i,name:'Pessoa '+i,missionRole,avatar:{}}))};
for(const route of M.GDF_ROUTES){const s=M.newParkState({...team,id:'interaction-'+route.id},route.id),activities=M.activitiesFor(s),compare=activities.find(a=>a.kind==='compare');
 assert(M.nearActivity(compare,compare.place,[60,77]),route.id+': visible resident');
 assert(M.nearActivity(compare,compare.place,compare.target));assert(!M.nearActivity(compare,compare.place==='park'?'lab':'park',[60,77]));assert(!M.nearActivity(compare,compare.place,[40,90]));
 for(const a of activities.filter(a=>a.speaker))assert(M.nearActivity(a,a.place,M.speakerPosition(a)));
}
const s=M.newParkState(team);M.lockParkRoles(team,s,s.assignments,'Compararemos as perspectivas e registraremos uma conclusão.');s.index=3;s.place='square';s.position=[60,77];
assert(!M.parkCanAdvance(s),'Clue/arrival alone cannot finish comparison');
assert.throws(()=>M.submitPark(team,s,{answer:'curto'}),/20/);
M.submitPark(team,s,{answer:'O relato da tarde não comprova a passagem à noite; comparamos horários e limites.'});assert(M.parkCanAdvance(s));M.advancePark(s);
assert.equal(M.activitiesFor(s)[s.index].step,4);assert.equal(M.activitiesFor(s)[s.index].kind,'source');assert.equal(M.parkScore(s).total,0);
console.log('PASS: visible NPC interaction in all 15 routes, wrong scene/distance blocked, comparison required, submission advances 3→4 before teacher/GDF grading.');

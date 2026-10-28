const assert=require('node:assert/strict'),esbuild=require('esbuild');
esbuild.buildSync({stdin:{contents:"export * from './src/ui/demo/CityResidents';export * from './src/ui/demo/IllustratedTraffic';",resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',outfile:'/tmp/espia-city-life.cjs'});
const {CityResident,IllustratedTraffic,roadPoint,roadPose,ROAD_ROUTES,ROAD_LENGTH}=require('/tmp/espia-city-life.cjs');
const residents=Array.from({length:6},(_,i)=>new CityResident(i,i)),initial=residents.map(r=>[...r.walker.position]);
assert.equal(new Set(initial.map(p=>p.join(','))).size,6,'Residents start at distinct sites');
for(let i=0;i<4000;i++)residents.forEach(r=>r.update(.016,false,false));
for(const i of [0,1,3,4])assert.deepEqual(residents[i].walker.position,initial[i],'Seated/map/phone residents remain at their activity');
for(const i of [2,5])assert.notDeepEqual(residents[i].walker.position,initial[i],'Circulating residents follow independent schedules');
const far=residents[4];assert(!far.encounter([35,76]));assert(!far.discovered);assert(far.encounter([...far.walker.position]));assert(far.discovered);assert(!far.encounter([...far.walker.position]),'Encounter announced once');
const before=residents.map(r=>[...r.walker.position]);for(let i=0;i<100;i++)residents.forEach(r=>r.update(.016,true,false));assert.deepEqual(residents.map(r=>r.walker.position),before,'Residents pause during panels');
const traffic=new IllustratedTraffic();let boarding=false,redStop=false,moving=false,cycles=0;
for(let i=0;i<30000;i++){const previous=traffic.buses.map(b=>b.s);traffic.update(.016);traffic.buses.forEach((b,j)=>{const [x,y]=roadPoint(b.s);assert(y>=45&&y<=65,'Vehicles stay on the calibrated road, above the pedestrian corridor');assert(x>=-18&&x<=108);boarding||=b.status==='embarque no ponto';redStop||=b.status==='aguardando semáforo'&&!traffic.green;moving||=b.s>previous[j];if(b.s<previous[j])cycles++;const gap=(traffic.buses[1-j].s-b.s+ROAD_LENGTH)%ROAD_LENGTH;assert(gap>=17.9,'Buses keep headway');})}
assert(boarding&&redStop&&moving&&cycles>2,'Buses complete cycles with stop dwell and red light');const snapshot=JSON.stringify(traffic);traffic.update(5,true);assert.equal(JSON.stringify(traffic),snapshot,'Traffic pauses while reading');
console.log('PASS: distinct resident activities, proximity encounters, independent circulation, pause; bus cycles, boarding, red lights and headway.');
esbuild.buildSync({entryPoints:['src/ui/demo/SceneSpacing.ts'],bundle:true,platform:'node',format:'cjs',outfile:'/tmp/espia-spacing.cjs'});
const {freeAppearance,silhouettesOverlap,NPC_FEET}=require('/tmp/espia-spacing.cjs');
for(const hero of [[39,77],[78,68],[69,71],[37,78]]){const occupied=[hero,NPC_FEET.research];for(let i=0;i<6;i++){const p=freeAppearance([77-i,70+i%3],occupied);if(p){assert(occupied.every(q=>!silhouettesOverlap(q,p)),'No silhouette overlap on appearance');occupied.push(p)}}}
console.log('PASS: nearby residents reserve distinct visible slots before appearing.');

for(const zone of ['praca','calcadao','servicos'])for(let step=0;step<=1000;step++){const pose=roadPose(step/1000*ROAD_LENGTH,zone);assert(pose.y<66);assert(pose.scale>0&&pose.scale<=1.15);if(zone!=='servicos'){assert(pose.x<=70,'Bus never crosses the right-hand sidewalk');if(pose.x>=68)assert(pose.opacity===0,'Distant road exits behind the island');}else assert(pose.y===57.5,'Civic bus stays on the horizontal road');}
assert.deepEqual(roadPoint(0),ROAD_ROUTES.praca[0]);
console.log('PASS: three calibrated roads, perspective and distant occlusion; no route across the right sidewalk.');

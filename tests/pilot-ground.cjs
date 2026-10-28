const assert=require('node:assert/strict'),esbuild=require('esbuild');
esbuild.buildSync({entryPoints:['src/ui/demo/PilotGround.ts'],bundle:true,platform:'node',format:'cjs',outfile:'/tmp/pilot-ground.cjs'});
const {pilotWalkable,pilotPath,pilotSegment,PILOT_AGENT,pilotDistance}=require('/tmp/pilot-ground.cjs');
for(const point of [[48,88],[46,81],[64,82],[72,77],[35,92],[82,85]])assert(pilotWalkable(point),'Accessible destination '+point);
for(const point of [[10,82],[25,84],[90,73],[80,45],[95,93],PILOT_AGENT])assert(!pilotWalkable(point),'Solid obstacle '+point);
const destinations=[];for(let x=30;x<=90;x+=3)for(let y=63;y<=96;y+=3)if(pilotWalkable([x,y]))destinations.push([x,y]);
let count=0;for(const goal of destinations){let previous=[48,88];const path=pilotPath(previous,goal);assert(path.length,'Every allowed destination is reachable '+goal);for(const next of path){assert(pilotSegment(previous,next),'Entire segment clears swept shoe footprint');for(let t=0;t<=1;t+=.02)assert(pilotWalkable([previous[0]+(next[0]-previous[0])*t,previous[1]+(next[1]-previous[1])*t]),'No wall or planter tunnelling');previous=next}assert.deepEqual(previous,goal);count++}
assert(pilotDistance([72,77],PILOT_AGENT)<6,'Interaction target is within reach without overlapping the agent');
console.log('PASS: '+count+' pilot paths, swept foot collisions, solid scenery, agent clearance and reachable clues.');

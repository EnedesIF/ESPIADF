const assert=require('node:assert/strict'),esbuild=require('esbuild');
esbuild.buildSync({stdin:{contents:"export * from './src/data/routeJourney';export {GDF_ROUTES} from './src/data/gdf/routes';export {CLUES} from './src/data/v02/clues';export {walkable} from './src/ui/demo/WalkableCity';",resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',outfile:'/tmp/route-journey-test.cjs',alias:{'@':process.cwd()+'/src'}});
const {GDF_ROUTES,CLUES,ROUTE_STEP,investigationClues,walkable}=require('/tmp/route-journey-test.cjs');
for(const route of GDF_ROUTES){const clues=investigationClues(route,CLUES[route.campaign]);assert.equal(clues.length,4);assert.equal(new Set(clues.map(c=>c.id)).size,4);assert.equal(clues[0].steps[0],route.initial);assert.equal(clues[1].steps[0],route.other);assert.equal(clues[2].steps[0],route.limit);assert.equal(clues[3].steps[0],route.participation);}
for(const p of [[48,76],[58,80],[66,83],[90,82]])assert(walkable(p),'Clues occupy accessible pavement');
assert.equal(ROUTE_STEP.contact,2);assert.equal(ROUTE_STEP.inspect,2);assert.equal(ROUTE_STEP.return,9);
console.log('PASS: four distinct case-specific discoveries per route, accessible locations and nine-step progression.');

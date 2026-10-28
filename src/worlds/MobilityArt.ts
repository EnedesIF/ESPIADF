import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type {CityWorld} from './CityWorld';
import {textSign} from './textures';
/** Static art grouped by material to keep the school-computer draw-call budget low. */
export function buildMobilityArt(world:CityWorld){
 const root=new THREE.Group();root.name='mobility-card-art';world.scene.add(root);
 const batches=new Map<string,THREE.BufferGeometry[]>();
 const box=new THREE.BoxGeometry(1,1,1),sphere=new THREE.SphereGeometry(1,10,7),cylinder=new THREE.CylinderGeometry(1,1,1,10);
 const add=(geo:THREE.BufferGeometry,color:string,x:number,y:number,z:number,sx=1,sy=1,sz=1)=>{const g=geo.clone();g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion(),new THREE.Vector3(sx,sy,sz)));if(!batches.has(color))batches.set(color,[]);batches.get(color)!.push(g)};
 const b=(x:number,y:number,z:number,w:number,h:number,d:number,c:string)=>add(box,c,x,y,z,w,h,d);
 const tree=(x:number,z:number,n:number)=>{add(cylinder,'#835c36',x,1.3,z,.2,2.6,.2);const greens=['#369d50','#54b857','#83c75a'];for(let j=0;j<14;j++){const a=j*2.399+n;const r=.3+(j%4)*.3;add(sphere,greens[(j+n)%3],x+Math.cos(a)*r,3.4+(j%3)*.42,z+Math.sin(a)*r,.65+(j%3)*.1,.7,.65)}world.colliders.push({minX:x-.38,maxX:x+.38,minZ:z-.38,maxZ:z+.38})};
 const sign=(x:number,y:number,z:number,w:number,label:string,sub:string)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,w*.27),new THREE.MeshBasicMaterial({map:textSign([label,sub],{w:1024,h:280,bg:'#07566b',fg:'#ffffff',accent:'#ffd15f'}),side:THREE.DoubleSide}));m.position.set(x,y,z);root.add(m)};
 // School landmark and finished facades, away from the mission's pedestrian corridor.
 b(-88,.2,34,24,.4,16,'#f2e6cc');b(-88,3.1,36,20,6,11,'#f2e6cc');b(-88,6.25,36,21,.5,12,'#ffc74b');b(-88,3.9,30.4,20,1.2,.2,'#25826c');
 for(let i=0;i<6;i++){b(-96+i*3.1,2,30.3,2,2.1,.15,'#67b2c8');b(-96+i*3.1,2,30.18,.08,2.1,.1,'#f3edda')}
 b(-88,1.5,30.1,2.2,3,.25,'#27647e');sign(-88,4,30.05,12,'ESCOLA HORIZONTE','CONHECIMENTO / CIDADANIA');world.colliders.push({minX:-98,maxX:-78,minZ:30.4,maxZ:41.5});
 for(const [x,z,h,c] of [[-120,32,12,'#7faec5'],[-110,57,18,'#f2e6cc'],[-78,58,15,'#25826c'],[-52,54,21,'#7faec5']] as [number,number,number,string][]){b(x,h/2,z,10,h,9,c);b(x,h+.3,z,10.8,.6,9.8,'#f3edda');for(let f=2;f<h;f+=2.5)for(let k=-1;k<=1;k++)b(x+k*2.7,f,z-4.6,1.7,1.4,.15,'#27647e');world.colliders.push({minX:x-5,maxX:x+5,minZ:z-4.5,maxZ:z+4.5})}
 // Landscaped pocket gardens and golden curb accents.
 for(const [i,p] of [[-105,18],[-100,24],[-76,25],[-58,25],[-43,24],[-31,26],[-9,-31],[-32,-29]].entries()){const [x,z]=p;b(x,.25,z,4.4,.5,3.2,'#f2e6cc');b(x,.55,z,4,.15,2.8,'#65a94f');tree(x,z,i);for(let j=0;j<4;j++)add(sphere,j%2?'#ffd05a':'#e384b0',x-1.5+j*.9,.85,z+1,.22,.25,.22)}
 b(-67,3.4,17,6,.25,3.7,'#ffc74b');b(-67,1.9,15.6,4.8,1.6,.12,'#7bbbc3');b(-67,3.65,17,4,.06,2.5,'#264f73');for(let i=-1;i<=1;i++)b(-67+i*1.3,3.7,17,.025,.03,2.5,'#86bbcf');
 for(let i=0;i<18;i++)b(-75+i*2,.23,9.5,.8,.06,.18,i%2?'#ffd166':'#3ddaad');
 // Close-range surfaces and props are staged around the nine field objectives.
 for(let x=-78;x<-42;x+=1.3)for(let z=9.2;z<14.8;z+=1.3){b(x,.175,z,1.27,.025,1.27,((Math.round(x*10)+Math.round(z*10))%3)?'#d3d0bf':'#c6c5b5')}
 // Wayfinding totem, recycling bins and timber street furniture.
 b(-73,1.4,14.8,.18,2.8,.18,'#164c44');sign(-73,2.35,14.95,3.7,'SUPERQUADRA 214','PARADA / ESCOLA / ADMINISTRAÇÃO');
 for(let i=0;i<3;i++){b(-74+i*.65,.65,16,.5,1.1,.5,['#25826c','#264f73','#ffc74b'][i]);b(-74+i*.65,1.23,16,.54,.1,.54,'#26494b')}
 // The technician's field office, set behind the interaction position.
 b(-16,.78,-18,3,.13,1.1,'#ad8051');for(const x of [-17.2,-14.8])b(x,.38,-18,.12,.76,.75,'#26494b');
 b(-16,1.14,-18,.8,.6,.06,'#264f73');b(-16,.89,-17.75,.8,.06,.55,'#264f73');
 b(-15.1,.87,-18,.5,.04,.4,'#f3edda');b(-16.9,1,-18,.22,.33,.22,'#25826c');
 // Civic solution bench: physical objects remain visible behind the form.
 b(-61,.82,14.9,3.5,.14,1.1,'#ad8051');for(const x of [-62.4,-59.6])b(x,.4,14.9,.12,.8,.8,'#26494b');
 for(let i=0;i<3;i++)b(-62+i,.91,14.9,.72,.025,.55,['#f3edda','#ffc74b','#7bbbc3'][i]);
 // Construction texture and barrier detail near the second observation.
 for(let i=0;i<7;i++){b(-20+i*1.6,.9,-25.5,1.5,.6,.12,i%2?'#f3edda':'#ffc74b');b(-20+i*1.6,.4,-25.5,.1,.8,.7,'#26494b')}
 // Compact Brasília-inspired skyline: paired towers and reflecting pool.
 b(-123,.18,75,24,.25,13,'#65bacc');for(const x of [-126,-121]){b(x,11,72,2.2,22,3,'#f3e9d4');for(let y=2;y<21;y+=1.4)b(x,y,73.55,1.6,.35,.1,'#7bbbc3')}
 for(const x of [-134,-112]){const dome=new THREE.SphereGeometry(3.6,18,10,0,Math.PI*2,0,Math.PI/2);add(dome,'#f3e9d4',x,.4,75,1, .65,1)}
 for(const [color,geos] of batches){const geometry=mergeGeometries(geos,false);geos.forEach(g=>g.dispose());if(!geometry)continue;const m=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color,roughness:.6,metalness:color==='#67b2c8'?.15:0}));m.castShadow=true;m.receiveShadow=true;root.add(m)}
 box.dispose();sphere.dispose();cylinder.dispose();root.userData.materialBatches=batches.size;root.userData.style='card-inspired';return root;
}

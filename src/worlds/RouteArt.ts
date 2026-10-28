import * as THREE from 'three';
import type {GdfRoute} from '@/data/gdf/routes';
import {textSign} from './textures';
/** Route-specific points of observation, all fictional and interactive in the live world. */
export function routeArt(scene:THREE.Scene,route:GdfRoute,pos:[number,number]){
 const root=new THREE.Group();root.position.set(pos[0],0,pos[1]);root.userData.cityStation='inspect';root.userData.cityFieldObject=true;root.userData.gdfRoute=route.id;
 const mesh=(g:THREE.BufferGeometry,c:string,x=0,y=0,z=0)=>{const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:c,roughness:.7}));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;root.add(m);return m};
 const box=(w:number,h:number,d:number,c:string,x=0,y=0,z=0)=>mesh(new THREE.BoxGeometry(w,h,d),c,x,y,z);
 if(route.art==='ramp'){box(3.8,.2,2,'#d5d0bd',0,.1,0);for(let i=0;i<5;i++)box(.65,.25,.9,'#b1b4a8',-1.3+i*.7,.18+(i%2)*.16,0);box(.7,.15,2.2,'#e3bf62',-2.3,.09,0)}
 else if(route.art==='lamp'){mesh(new THREE.CylinderGeometry(.065,.11,5,16),'#345157',0,2.5);box(1,.1,.12,'#345157',.45,4.9);box(.7,.12,.4,'#949d8e',.9,4.8);mesh(new THREE.CircleGeometry(1.6,32).rotateX(-Math.PI/2),'#4e5d53',0,.02,0)}
 else if(route.art==='park'){for(const x of [-1.5,1.5])box(.3,3,.3,'#b09d79',x,1.5);box(3.6,.65,.4,'#1f6d51',0,2.9);for(let i=0;i<8;i++)box(.06,2,.08,'#245a43',-1.4+i*.4,1);}
 else if(route.art==='court'){box(5,.08,3,'#3b8b7c',0,.04);for(const x of [-2.3,2.3])box(.06,.02,2.7,'#f3ead5',x,.09);for(const z of [-1.3,1.3])box(4.6,.02,.06,'#f3ead5',0,.09,z);box(.1,3.5,.1,'#ddd7bd',2,1.75,2);box(1.5,.9,.08,'#e6e4d1',2,3,1.9)}
 else if(route.art==='waste'){for(let i=0;i<3;i++){box(.8,1,.8,['#2c895b','#3b6895','#dcb44f'][i],-1+i, .5);box(.86,.1,.86,'#223c38',-1+i,1.05)}for(let i=0;i<4;i++)mesh(new THREE.SphereGeometry(.21,10,8),'#57574c',-1.5+i*.35,.2,1).userData.litter=true}
 else if(route.art==='water'){mesh(new THREE.CylinderGeometry(.65,.55,.8,24,1,true),'#4d7b92',0,.4);mesh(new THREE.CircleGeometry(.61,24).rotateX(-Math.PI/2),'#4792a5',0,.65);for(const x of [-1,1]){const tire=mesh(new THREE.TorusGeometry(.3,.1,10,20),'#303837',x,.4,.2);tire.rotation.x=.6}}
 else if(route.art==='food'){box(3,.9,1,'#b98851',0,.45);box(3.2,.18,1.2,'#e6bd5b',0,1);for(let i=0;i<5;i++)mesh(new THREE.SphereGeometry(.12,12,8),'#b96e3f',-.9+i*.4,1.2);box(3.4,.2,2,'#1d7059',0,2.7);for(const x of [-1.5,1.5])box(.1,2.7,.1,'#3b564e',x,1.35)}
 else{box(2.6,1.9,.2,route.campaign==='health'?'#e8e8d7':'#17454f',0,1.9);box(.15,1.1,.15,'#2b4a49',-.95,.55);box(.15,1.1,.15,'#2b4a49',.95,.55)}
 const sign=new THREE.Mesh(new THREE.PlaneGeometry(2.5,.85),new THREE.MeshBasicMaterial({map:textSign(['ROTA '+route.code+' • '+route.title,'CENÁRIO FICTÍCIO • OBSERVE E INVESTIGUE'],{w:1024,h:350,bg:'#0c4b48',fg:'#fff',accent:'#ffc965'}),side:THREE.DoubleSide}));sign.position.set(0,route.art==='lamp'?3.1:2.15,1.2);root.add(sign);scene.add(root);return root;
}

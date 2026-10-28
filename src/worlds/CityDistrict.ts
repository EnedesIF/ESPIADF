import * as THREE from 'three';
import type {CampaignId} from '@/types';
import type {CityWorld} from './CityWorld';
import {textSign} from './textures';

export const DISTRICTS:Record<CampaignId,{name:string;subtitle:string;color:string;icon:string}>={
 mobility:{name:'TERMINAL 214',subtitle:'Linhas, paradas e caminhos pela cidade',color:'#2fe3a1',icon:'bus'},
 work:{name:'CAMPUS DE OPORTUNIDADES',subtitle:'Escola, formação e entrada no trabalho',color:'#ffc15b',icon:'building'},
 territory:{name:'PRAÇA DAS CONEXÕES',subtitle:'Convivência, lazer e cuidado ambiental',color:'#91e17b',icon:'leaf'},
 health:{name:'BAIRRO JARDIM HORIZONTE',subtitle:'UBS, prevenção e cuidado coletivo',color:'#6bcce6',icon:'pulse'}
};
/** Distritos temáticos em 3D; cada missão ocupa um setor com objetos próprios. */
export function buildCityDistrict(world:CityWorld,id:CampaignId){
 const g=new THREE.Group();g.name='district:'+id;world.scene.add(g);
 const mat=(c:string,emissive=false)=>new THREE.MeshStandardMaterial({color:c,roughness:.75,emissive:emissive?c:'#000',emissiveIntensity:emissive?.18:0});
 const mesh=(geo:THREE.BufferGeometry,c:string,x:number,y:number,z:number)=>{const o=new THREE.Mesh(geo,mat(c));o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o};
 const box=(x:number,y:number,z:number,w:number,h:number,d:number,c:string)=>mesh(new THREE.BoxGeometry(w,h,d),c,x,y,z);
 const ground=(x:number,z:number,w:number,d:number,c:string)=>{const o=mesh(new THREE.PlaneGeometry(w,d),c,x,.14,z);o.rotation.x=-Math.PI/2;return o};
 const collider=(x:number,z:number,w:number,d:number)=>world.colliders.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2});
 const sign=(x:number,z:number,title:string,sub:string,width=6)=>{box(x,1.6,z,.14,3.2,.14,'#29434b');const face=new THREE.Mesh(new THREE.PlaneGeometry(width,1.5),new THREE.MeshBasicMaterial({map:textSign([title,sub],{w:768,h:192,bg:'#092830',fg:'#edf6f4',accent:DISTRICTS[id].color}),side:THREE.DoubleSide}));face.position.set(x,3,z+.1);g.add(face)};
 const bench=(x:number,z:number)=>{box(x,.65,z,2.6,.2,.8,'#b0804c');box(x,.35,z,.22,.7,.65,'#304953');box(x+1,.35,z,.22,.7,.65,'#304953');box(x,1.15,z-.35,2.6,.75,.12,'#a67949');collider(x,z,2.6,1)};
 const shelter=(x:number,z:number,c:string)=>{for(const dx of [-2.4,2.4])for(const dz of [-1.4,1.4])box(x+dx,1.5,z+dz,.12,3,.12,'#29434b');box(x,3,z,5.5,.25,3.4,c);box(x,1.8,z-1.4,4.8,1.8,.1,'#61818a')};
 const tree=(x:number,z:number)=>{mesh(new THREE.CylinderGeometry(.16,.25,2,7),'#71583b',x,1,z);mesh(new THREE.IcosahedronGeometry(1.35,0),'#4c9151',x,2.8,z);collider(x,z,.6,.6)};
 const flowers=(x:number,z:number)=>{box(x,.25,z,2.4,.5,1,'#b1aa8a');for(let i=0;i<7;i++)mesh(new THREE.IcosahedronGeometry(.3,0),i%2?'#d9b34e':'#815cb3',x-1+i*.32,.65,z);collider(x,z,2.4,1)};
 if(id==='mobility'){
  sign(-70,18,'TERMINAL 214','MOBILIDADE / ITINERÁRIOS',7);shelter(-67,17,'#15796b');bench(-68,17);
  ground(-46,10,43,1,'#c4b885');for(let i=0;i<8;i++)box(-73+i*2,.16,8.7,.75,.04,.12,'#f2c65b');
  for(let i=0;i<6;i++){const x=-27+i*2;mesh(new THREE.ConeGeometry(.22,.65,8),'#e57e2f',x,.4,-11);box(x,.08,-11,.5,.12,.5,'#303737')}
  for(const x of [-10,-6]){box(x,.8,-24,2.5,.9,.25,'#e99a3c');box(x-.9,.35,-24,.12,.7,.5,'#26373d');box(x+.9,.35,-24,.12,.7,.5,'#26373d')}
  sign(-18,-20,'DESVIO TEMPORÁRIO','CONSULTE O NOVO TRAJETO',5);
 }else if(id==='work'){
  sign(77,-15,'CAMPUS DE OPORTUNIDADES','FORMAÇÃO / PROJETOS / TRABALHO',9);
  for(const [x,label] of [[65,'FORMAÇÃO'],[95,'OPORTUNIDADES']] as [number,string][]){shelter(x,-15,'#c59338');box(x,.9,-15,3,.15,1.2,'#d8d9cb');sign(x,-17,label,'CONFIRA O EDITAL',3.5);collider(x,-15,3,1.2)}
  ground(80,-20,25,1.2,'#c6b783');flowers(72,-18);flowers(102,-18);
  shelter(105,19,'#c59338');box(105,.9,19,3.5,.2,1.3,'#dedbc6');sign(108,19,'ATENDIMENTO','DOCUMENTOS / EDITAL',3);
  sign(68,20,'PONTO DE ORIENTAÇÃO','DOCUMENTOS / ACESSO / INFORMAÇÃO',5);
  for(let i=0;i<5;i++)box(78+i*1.6,.16,-10,.8,.03,1.2,i%2?'#d8a347':'#247d83');
 }else if(id==='territory'){
  ground(42,27,24,24,'#648f57');ground(50,23,3,28,'#ccbc91');ground(42,23,24,2.4,'#ccbc91');
  sign(35,16,'PRAÇA DAS CONEXÕES','ESPAÇO PÚBLICO / ACESSO LIVRE',7);
  bench(35,24);bench(53,28);tree(34,18);tree(54,16);tree(35,35);flowers(40,34);flowers(54,34);
  const court=ground(38,42,11,7,'#3d8b85');court.position.y=.16;for(const z of [39,45])box(38,.19,z,10,.02,.08,'#dce8d4');
  box(38,2.1,46,.15,4.2,.15,'#d6e1db');box(38,3.8,45.8,2.4,1.3,.15,'#e5eee7');const hoop=mesh(new THREE.TorusGeometry(.45,.045,8,20),'#d77b35',38,3.4,45.2);hoop.rotation.x=Math.PI/2;
  sign(77,28,'CONVIVÊNCIA EM REDE','CUIDADO / LAZER / PARTICIPAÇÃO',5);
 }else{
  sign(106,17,'BAIRRO JARDIM HORIZONTE','SAÚDE E PREVENÇÃO',8);shelter(96,22,'#4f9ba4');box(96,.9,22,3,.15,1.2,'#d3e3dc');collider(96,22,3,1.2);
  ground(110,26,23,2,'#c8d8c5');sign(110,32,'UBS / ORIENTAÇÃO','DADOS / AÇÕES / CUIDADO',6);
  for(const z of [25,42]){box(133,2,z,7,4,7,'#ded3bd');box(133,4.2,z,7.6,.35,7.6,'#9e6547');box(132,1.3,z-3.55,1,2.6,.1,'#2e7a83');box(135,2,z-3.55,1.2,1.2,.12,'#7eb0bc');collider(133,z,7,7)}
  shelter(118,16,'#4f9ba4');box(118,.9,16,3,.2,1,'#d3e3dc');sign(121,16,'CUIDADO COLETIVO','ORIENTAÇÃO / PREVENÇÃO',4);
  flowers(126,20);tree(125,15);tree(95,17);
  sign(124,30,'INSPEÇÃO DO AMBIENTE','OBSERVE / REGISTRE / INVESTIGUE',4.5);
 }
 return g;
}

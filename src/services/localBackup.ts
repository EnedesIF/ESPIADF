/** Emergency export only: no remote requests, removals or imports. */
export async function buildLocalBackup(){
 const local:Record<string,string>={};
 for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key&&/^(missaodf:|espia:|espiadf:)/.test(key)){const value=localStorage.getItem(key);if(value!==null)local[key]=value}}
 const database=await new Promise<IDBDatabase|null>((resolve,reject)=>{
  const req=indexedDB.open('missaodf-learning');let absent=false;
  req.onupgradeneeded=()=>{absent=true;req.transaction?.abort()};
  req.onsuccess=()=>resolve(req.result);
  req.onerror=()=>absent?resolve(null):reject(req.error);
  req.onblocked=()=>reject(Error('Feche outras abas do jogo e tente novamente, sem limpar os dados.'));
 });
 const rows:{key:IDBValidKey;blob:Blob}[]=[];
 if(database){try{if(database.objectStoreNames.contains('images'))await new Promise<void>((resolve,reject)=>{
  const tx=database.transaction('images','readonly'),req=tx.objectStore('images').openCursor();
  req.onsuccess=()=>{const c=req.result;if(c){if(!(c.value instanceof Blob)){tx.abort();return}rows.push({key:c.key,blob:c.value});c.continue()}};
  tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(Error('Não foi possível exportar todas as evidências. Nenhum registro foi apagado.'));
 })}finally{database.close()}}
 const images=[];for(const row of rows){const data=await new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=()=>reject(r.error);r.readAsDataURL(row.blob)});images.push({key:row.key,type:row.blob.type,data})}
 return {format:'espia-df-local-rescue',version:1,exportedAt:new Date().toISOString(),origin:location.origin,localStorage:local,indexedDB:{database:'missaodf-learning',store:'images',images}};
}
export async function downloadLocalBackup(){
 const backup=await buildLocalBackup();
 if(!Object.keys(backup.localStorage).length&&!backup.indexedDB.images.length)throw Error('Nenhum registro local do Espia DF encontrado neste navegador. Use o aparelho e o perfil em que a equipe jogou.');
 const blob=new Blob([JSON.stringify(backup)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='espia-df-resgate-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);
 return backup;
}

const KEY='espia:registration-draft:v1';
/** Local recovery only. Credentials are never persisted in the draft. */
export function saveSetupDraft(state:any,pending?:{id:string;login:string}){
 const draft={version:1,step:state.step,team:state.team,mentor:state.mentor,members:state.members,pending:pending?{id:pending.id,login:pending.login}:undefined};
 localStorage.setItem(KEY,JSON.stringify(draft));
 return new Date();
}
export function readSetupDraft(){
 try{const d=JSON.parse(localStorage.getItem(KEY)||'null');if(d?.version===1&&d.team&&d.mentor&&Array.isArray(d.members)&&d.members.length>=5&&d.members.length<=10&&Number.isInteger(d.step)&&d.step>=0&&d.step<=3)return d;}catch{}
 return null;
}
export function clearSetupDraft(){localStorage.removeItem(KEY);}

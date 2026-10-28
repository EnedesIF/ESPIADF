/** Complete illustrated looks. Hair and clothes form an authored silhouette, not floating patches. */
export const AVATAR_LOOKS=[
 {name:'Cachos • verde',hair:'crespo',outfit:'camiseta',detail:'Camiseta verde e calça cargo'},
 {name:'Cachos • violeta',hair:'cacheado',outfit:'moletom',detail:'Moletom violeta e jeans'},
 {name:'Jaqueta • petróleo',hair:'curto',outfit:'jaqueta',detail:'Jaqueta petróleo e camiseta clara'},
 {name:'Tranças • âmbar',hair:'trancas',outfit:'jaqueta',detail:'Jaqueta âmbar e calça escura'},
 {name:'Óculos • petróleo',hair:'curto',outfit:'moletom',detail:'Moletom petróleo; óculos na arte original'},
 {name:'Camisa • verde',hair:'cacheado',outfit:'camisa',detail:'Camisa aberta verde e calça cargo'},
 {name:'Afro • vinho',hair:'crespo',outfit:'moletom',detail:'Afro curto, moletom vinho e jeans'},
 {name:'Raspado • universitária',hair:'raspado',outfit:'jaqueta',detail:'Jaqueta universitária e calça bege'},
 {name:'Longo • turquesa',hair:'longo',outfit:'camisa',detail:'Cabelo longo e camisa turquesa'},
 {name:'Ondas • camiseta',hair:'cacheado',outfit:'camiseta',detail:'Camiseta com estampa e jeans'},
 {name:'Tranças • mostarda',hair:'trancas',outfit:'camisa',detail:'Tranças presas e sobrecamisa mostarda'},
 {name:'Crespo • esportivo',hair:'crespo',outfit:'esportivo',detail:'Jaqueta esportiva verde e jogger'},
 {name:'Coque • jeans preto',hair:'coque',outfit:'jaqueta',detail:'Coque, jaqueta preta e calça clara'},
 {name:'Ruivo • cardigan',hair:'cacheado',outfit:'casaco',detail:'Cachos ruivos e cardigan ocre'},
 {name:'Tranças • saia',hair:'trancas',outfit:'saia',detail:'Jaqueta jeans e saia com legging'},
 {name:'Cachos presos • azul',hair:'cacheado',outfit:'camisa',detail:'Cachos presos, camisa azul e cargo'},
 {name:'Pixie • listras',hair:'curto',outfit:'camiseta',detail:'Cabelo curto violeta, listras e bermuda'},
 {name:'Raspado • moletom',hair:'raspado',outfit:'moletom',detail:'Moletom creme e jogger verde'}
] as const;
export const HAIR_FILTERS=[['todos','Todos os cabelos'],['curto','Curto / pixie'],['crespo','Crespo / afro'],['cacheado','Cacheado / ondulado'],['trancas','Tranças'],['longo','Longo liso'],['coque','Coque'],['raspado','Raspado']] as const;
export const OUTFIT_FILTERS=[['todos','Todas as roupas'],['camiseta','Camisetas'],['moletom','Moletons'],['jaqueta','Jaquetas'],['camisa','Camisas / sobrecamisas'],['esportivo','Esportivo'],['casaco','Cardigan'],['saia','Saia com legging']] as const;
export const avatarArt=(look:number,rear=false)=>look<6?(rear?'/art/cartoon-team-back.webp':'/art/cartoon-team.webp'):'/art/avatar-collection-'+(look<12?'a':'b')+(rear?'-back':'')+'.webp';
export const avatarCell=(look:number)=>look<6?look:(look-6)%6;
export const GEAR_SLOTS={head:{label:'Na cabeça',options:[['nenhum','Sem extra'],['bone','Boné'],['gorro','Gorro'],['bandana','Faixa']]},face:{label:'No rosto',options:[['nenhum','Sem extra'],['oculos','Óculos'],['solar','Óculos escuros']]},ears:{label:'Nas orelhas',options:[['nenhum','Sem extra'],['fone','Fone'],['brincos','Brincos']]},wrist:{label:'No pulso',options:[['nenhum','Sem extra'],['pulseira','Pulseira']]}} as const;
export type GearSlot=keyof typeof GEAR_SLOTS;
export type AvatarGear='nenhum'|'oculos'|'solar'|'bone'|'gorro'|'fone'|'bandana'|'brincos'|'pulseira';
export type GearSelection=Partial<Record<GearSlot,AvatarGear>>;
export function gearSelection(style:{accessory?:string;accessories?:GearSelection}|undefined):GearSelection{
 if(style?.accessories)return {...style.accessories};const selected:GearSelection={};for(const [slot,group] of Object.entries(GEAR_SLOTS))if(group.options.some(([id])=>id===style?.accessory))selected[slot as GearSlot]=style!.accessory as AvatarGear;return selected;
}
export function setGear(style:{accessory:string;accessories?:GearSelection},slot:GearSlot,value:AvatarGear){if(!GEAR_SLOTS[slot].options.some(([id])=>id===value))throw Error('Acessório incompatível com esta posição.');style.accessories={...gearSelection(style),[slot]:value};style.accessory='nenhum'}

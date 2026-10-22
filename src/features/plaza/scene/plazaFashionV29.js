import {createWardrobeFitting} from './plazaWardrobeFittingV34.js';
const designedItems=[];
for(const character of ['boy','girl'])for(const [style,label]of [['campus','Campus Club'],['royal','Royal Evening'],['street','Street Violet']])for(const slot of ['outfit','top','bottom','shoes']){
 designedItems.push({id:`${character}_${style}_${slot}`,character,style,slot,label:label+' · '+({outfit:'Cả bộ',top:'Áo',bottom:character==='girl'&&style!=='street'?'Váy':'Quần',shoes:'Giày'})[slot],priceCoin:50,asset:`v34/${character}-${style}-v34.glb`});
}
const defaults=['boy','girl'].flatMap(character=>['outfit','top','bottom','shoes'].map(slot=>({id:`${character}_default_${slot}`,character,style:'default',slot,label:({outfit:'Bộ đồ',top:'Áo',bottom:'Quần / váy',shoes:'Giày'})[slot]+' gốc',priceCoin:0,asset:null})));
export const PLAZA_FASHION_ITEMS=Object.freeze([...defaults,...designedItems]);
export function resolveFashionV29(recipe={},character){
 const find=(id,slot)=>PLAZA_FASHION_ITEMS.find(i=>i.id===id&&i.slot===slot&&i.character===character);
 const outfit=find(recipe.outfit,'outfit');
 return ['top','bottom','shoes'].map(slot=>({slot,item:recipe[slot]===`${character}_default_${slot}`?null:find(recipe[slot],slot)||outfit}));
}
// One parsed asset per style per room, including concurrent actor requests.
export function createFashionCacheV29(load){const cache=new Map();return file=>{if(!cache.has(file))cache.set(file,Promise.resolve().then(()=>load(file)).catch(error=>{cache.delete(file);throw error;}));return cache.get(file);};}
export function createFashionControllerV29(root,{character,load,onError=()=>{}}={}){
 const fitting=createWardrobeFitting(root,load,{character});let disposed=false;
 return {apply(recipe={}){if(disposed||!load)return;const parts=Object.fromEntries(resolveFashionV29(recipe,character).map(({slot,item})=>[slot,item?.style==='default'?null:item?.style]));return fitting.apply(parts).catch(error=>{if(!disposed)onError(error);});},dispose(){disposed=true;fitting.dispose();}};
}

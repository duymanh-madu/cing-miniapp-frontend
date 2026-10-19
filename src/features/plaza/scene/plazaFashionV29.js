import {BufferAttribute} from 'three';
import {attachPlazaGarmentV27} from './plazaGarmentV27.js';
const designedItems=[];
for(const character of ['boy','girl'])for(const [style,label]of [['campus','Campus Club'],['royal','Royal Evening'],['street','Peach Street']])for(const slot of ['outfit','top','bottom','shoes']){
 designedItems.push({id:`${character}_${style}_${slot}`,character,style,slot,label:label+' · '+({outfit:'Cả bộ',top:'Áo',bottom:character==='girl'&&style!=='street'?'Váy':'Quần',shoes:'Giày'})[slot],priceCoin:50,asset:`v29/${character}-${style}-v29.glb`});
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
 let generation=0,disposed=false,key='',current=[];
 const bodies=[];
 root.traverse(mesh=>{const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];if(mesh.isSkinnedMesh&&materials.some(m=>/Body.*SKIN/i.test(m?.name||''))&&mesh.geometry.index)bodies.push({mesh,original:mesh.geometry,private:null});});
 function cover(parts){const top=parts.find(x=>x.slot==='top')?.item,bottom=parts.find(x=>x.slot==='bottom')?.item,scale=character==='girl'?.91:1;
  const topHem=(top?.style==='royal'?.99:top?.style==='campus'?.94:.88)*scale;
  const skirt=character==='girl'&&['campus','royal'].includes(bottom?.style);
  const bottomHem=(skirt?(bottom.style==='campus'?.76:.66):bottom?.style==='street'?.65:.16)*scale;
  const hasTop=Boolean(top?.asset),hasBottom=Boolean(bottom?.asset);
  for(const b of bodies){
   if(!hasTop&&!hasBottom){b.mesh.geometry=b.original;continue;}
   const positions=b.original.attributes.position,index=b.original.index,kept=[];
   for(let i=0;i<index.count;i+=3){let x=0,y=0;for(let j=0;j<3;j++){const v=index.getX(i+j);x+=positions.getX(v)/3;y+=positions.getY(v)/3;}
    const underTop=hasTop&&y>topHem-.012*scale&&y<1.49*scale&&(Math.abs(x)<.18*scale||(Math.abs(x)<.605*scale&&Math.abs(y-1.42356*scale)<.105*scale));
    const underBottom=hasBottom&&y>bottomHem+.005*scale&&y<1.035*scale&&Math.abs(x)<.205*scale;
    if(!underTop&&!underBottom)for(let j=0;j<3;j++)kept.push(index.getX(i+j));
   }
   if(!b.private){b.private=b.original.clone();b.private.setIndex(new BufferAttribute(new Uint32Array(index.count),1));}
   b.private.index.array.set(kept);b.private.index.needsUpdate=true;b.private.setDrawRange(0,kept.length);b.mesh.geometry=b.private;
  }
 }

 return {apply(recipe){
  if(disposed||!load)return;
  const desired=resolveFashionV29(recipe,character),nextKey=JSON.stringify(desired.map(x=>x.item?.id||null));if(nextKey===key)return;
  key=nextKey;const mine=++generation;
  Promise.all(desired.map(async x=>({...x,asset:x.item?.asset?await load(x.item.asset):null}))).then(parts=>{
   if(disposed||mine!==generation)return;
   current.forEach(x=>x.dispose());current=[];
   try{for(const {slot,asset}of parts)if(asset)current.push(attachPlazaGarmentV27(root,asset.scene,slot==='top'?['top','accessory']:slot,{part:slot}));cover(parts);}
   catch(error){cover([]);current.forEach(x=>x.dispose());current=[];key='';onError(error);}
  }).catch(error=>{if(!disposed&&mine===generation){key='';onError(error);}});
 },dispose(){disposed=true;generation++;current.forEach(x=>x.dispose());current=[];for(const b of bodies){b.mesh.geometry=b.original;b.private?.dispose();}}};
}

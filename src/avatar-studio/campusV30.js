import {BufferAttribute} from 'three';
import {attachPlazaGarmentV27} from '../features/plaza/scene/plazaGarmentV27.js';

export const CAMPUS_ASSET='v31/boy-campus-v31.glb';
export const CAMPUS_BASE='v30/cing-boy-modular-v30.vrm';
const SLOTS=['top','bottom','shoes'];
// Studio-only fitting controller. No catalogue, wallet, network presence or room changes.
export function createCampusFitting(root,load){
 let generation=0,disposed=false,current=[],key='';
 const bodies=[];
 root.traverse(mesh=>{const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];if(mesh.isSkinnedMesh&&mesh.geometry.index&&materials.some(m=>/Body.*SKIN/i.test(m?.name||'')))bodies.push({mesh,original:mesh.geometry,private:null});});
 function cover(parts){
  for(const body of bodies){
   if(!parts.top&&!parts.bottom){body.mesh.geometry=body.original;continue;}
   const p=body.original.attributes.position,index=body.original.index,kept=[];
   for(let i=0;i<index.count;i+=3){
    const covered=[0,1,2].every(j=>{const v=index.getX(i+j),x=Math.abs(p.getX(v)),y=p.getY(v);
     return (parts.top&&((x<.18&&y>1.005&&y<1.435)||(x>.15&&x<.605&&Math.abs(y-1.42356)<.095)))||(parts.bottom&&x<.20&&y>.16&&y<1.015);
    });
    if(!covered)for(let j=0;j<3;j++)kept.push(index.getX(i+j));
   }
   if(!body.private){body.private=body.original.clone();body.private.setIndex(new BufferAttribute(new Uint32Array(index.count),1));}
   body.private.index.array.set(kept);body.private.index.needsUpdate=true;body.private.setDrawRange(0,kept.length);body.mesh.geometry=body.private;
  }
 }
 return {
  async apply(recipe={}){
   const parts=Object.fromEntries(SLOTS.map(slot=>[slot,recipe[slot]==='campus']));
   const mine=++generation;const nextKey=JSON.stringify(parts);if(disposed||nextKey===key)return false;
   const asset=Object.values(parts).some(Boolean)?await load(CAMPUS_ASSET):null;
   if(disposed||mine!==generation)return false;
   // Validate compatibility before removing the currently worn garments.
   if(asset){const names=new Set();root.traverse(o=>{if(o.isBone)names.add(o.name);});asset.scene.traverse(o=>{if(o.isSkinnedMesh&&o.skeleton.bones.some(b=>!names.has(b.name)))throw Error('GARMENT_RIG_MISMATCH');});}
   current.forEach(x=>x.dispose());current=[];
   try{for(const slot of SLOTS)if(parts[slot])current.push(attachPlazaGarmentV27(root,asset.scene,slot,{part:slot}));cover(parts);key=nextKey;return true;}
   catch(error){current.forEach(x=>x.dispose());current=[];cover({});key='';throw error;}
  },
  dispose(){if(disposed)return;disposed=true;generation++;current.forEach(x=>x.dispose());current=[];for(const b of bodies){b.mesh.geometry=b.original;b.private?.dispose();}}
 };
}

import {Skeleton} from 'three';
import {materialSlot} from './plazaAppearanceV27.js';

// Garment GLBs carry the same authored rig; bind them to the actor's raw bones.
// Refuse incompatible components rather than falling back to a broken pose.
export function attachPlazaGarmentV27(actorRoot,assetRoot,slot,{part}={}){
 const bones=new Map(),sources=[],hidden=[],attached=[];
 const slots=new Set(Array.isArray(slot)?slot:[slot]);
 actorRoot.traverse(o=>{if(o.isBone)bones.set(o.name,o);});
 assetRoot.updateMatrixWorld(true);
 assetRoot.traverse(o=>{if(o.isSkinnedMesh&&(!part||o.name.toLowerCase().startsWith(part)))sources.push(o);});
 if(!sources.length)throw Error('GARMENT_MESH_REQUIRED');
 for(const source of sources)for(const bone of source.skeleton.bones)if(!bones.has(bone.name))throw Error('GARMENT_RIG_MISMATCH');
 try{
  for(const source of sources){
   const mesh=source.clone(false);mesh.geometry=source.geometry.clone();
   mesh.material=Array.isArray(source.material)?source.material.map(m=>m.clone()):source.material.clone();
   mesh.skeleton=new Skeleton(source.skeleton.bones.map(b=>bones.get(b.name)),source.skeleton.boneInverses.map(m=>m.clone()));
   mesh.bind(mesh.skeleton,source.bindMatrix.clone());
   source.matrixWorld.decompose(mesh.position,mesh.quaternion,mesh.scale);
   mesh.layers.set(1);mesh.frustumCulled=false;attached.push(mesh);
  }
  actorRoot.traverse(o=>{let tagged=o;while(tagged&&tagged!==actorRoot&&!tagged.userData?.cingAppearanceSlot)tagged=tagged.parent;const taggedSlot=tagged?.userData?.cingAppearanceSlot;const materials=Array.isArray(o.material)?o.material:[o.material];if(o.isMesh&&(taggedSlot?slots.has(taggedSlot):materials.length&&materials.every(m=>m&&slots.has(materialSlot(m.name))))){hidden.push([o,o.visible]);o.visible=false;}});
  for(const mesh of attached){mesh.layers.mask=hidden[0]?.[0].layers.mask??1;actorRoot.add(mesh);}
 }catch(error){for(const mesh of attached){mesh.geometry.dispose();for(const m of Array.isArray(mesh.material)?mesh.material:[mesh.material])m.dispose();mesh.skeleton.dispose();}throw error;}
 let disposed=false;
 return {dispose(){if(disposed)return;disposed=true;for(const [o,visible]of hidden)o.visible=visible;for(const mesh of attached){mesh.removeFromParent();mesh.geometry.dispose();for(const m of Array.isArray(mesh.material)?mesh.material:[mesh.material])m.dispose();mesh.skeleton.dispose();}}};
}

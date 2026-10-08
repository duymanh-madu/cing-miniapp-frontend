import * as THREE from 'three';

const GARDEN_MESH=/^(?:V15_Garden_Individual_Folded_Foliage_|V15_Hundreds_Of_Ivory_Flowers_|V15_Flower_Stems$|V17_Garden_New_(?:Foliage|Flowers)_)/;
export function gardenBedsV8(map){
  const beds=[];map.updateMatrixWorld(true);
  map.traverse(o=>{if(o.isMesh&&/^(?:V15_Garden_Planter_Dark_Soil|V17_Garden_Planter_Soil)/.test(o.name))beds.push(new THREE.Box3().setFromObject(o));});
  return beds;
}
export function inGardenBedV8(x,z,beds){return beds.some(b=>x>=b.min.x-.24&&x<=b.max.x+.24&&z>=b.min.z-.24&&z<=b.max.z+.24);}
export function cleanCourtyardV8(map){
  const beds=gardenBedsV8(map),strips=[],plants=[],retired=[];let removedTriangles=0,keptTriangles=0;
  map.traverse(o=>{if(!o.isMesh)return;if(/^V15_Cream_Inlay_(?:Cross|Long)/.test(o.name))strips.push(o);else if(GARDEN_MESH.test(o.name))plants.push(o);});
  // Remove only obsolete straight bands, preserving the approved central lotus.
  strips.forEach(o=>o.removeFromParent());
  const point=new THREE.Vector3();
  for(const o of plants){
    const src=o.geometry,index=src.index,pos=src.attributes.position,kept=[];
    for(let i=0;i<(index?.count??pos.count);i+=3){const ids=[0,1,2].map(j=>index?index.getX(i+j):i+j);let x=0,z=0;
      for(const id of ids){point.fromBufferAttribute(pos,id).applyMatrix4(o.matrixWorld);x+=point.x/3;z+=point.z/3;}
      if(inGardenBedV8(x,z,beds)){kept.push(...ids);keptTriangles++;}else removedTriangles++;
    }
    retired.push(src);
    if(!kept.length){o.removeFromParent();continue;}
    // Preserve indexed attributes/materials; no expensive per-frame plant checks.
    const geometry=new THREE.BufferGeometry();
    for(const[name,attr]of Object.entries(src.attributes)){
      const array=new attr.array.constructor(kept.length*attr.itemSize);
      kept.forEach((id,i)=>{for(let k=0;k<attr.itemSize;k++)array[i*attr.itemSize+k]=attr.array[id*attr.itemSize+k];});
      geometry.setAttribute(name,new THREE.BufferAttribute(array,attr.itemSize,attr.normalized));
    }
    geometry.computeBoundingBox();geometry.computeBoundingSphere();o.geometry=geometry;o.userData.plazaCollision=false;
  }
  // These meshes may share geometry; dispose only resources no longer referenced.
  const used=new Set();map.traverse(o=>{if(o.geometry)used.add(o.geometry);});
  for(const g of new Set([...strips.map(o=>o.geometry),...retired]))if(!used.has(g))g.dispose();
  return{strips: strips.length,removedTriangles,keptTriangles,beds: beds.length};
}

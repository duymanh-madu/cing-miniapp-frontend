import * as T from 'three';
function geometryKey(g){
 let hash=2166136261;const add=a=>{const b=new Uint8Array(a.buffer,a.byteOffset,a.byteLength);for(const v of b)hash=Math.imul(hash^v,16777619);};
 const signature=[];
 for(const [name,a] of Object.entries(g.attributes).sort(([a],[b])=>a.localeCompare(b))){if(a.isInterleavedBufferAttribute)return null;signature.push(`${name}:${a.itemSize}:${a.normalized}:${a.array.constructor.name}:${a.count}`);add(a.array);}
 if(g.index)add(g.index.array);return `${signature.join('|')}:${g.index?.count||0}:${hash>>>0}`;
}
function equalGeometry(a,b){
 const attrs=Object.keys(a.attributes);if(attrs.length!==Object.keys(b.attributes).length)return false;
 for(const key of [...attrs,'index']){const x=key==='index'?a.index:a.attributes[key],y=key==='index'?b.index:b.attributes[key];if(!x||!y){if(x!==y)return false;continue;}if(x.array.length!==y.array.length)return false;for(let i=0;i<x.array.length;i++)if(x.array[i]!==y.array[i])return false;}
 return true;
}
export function instancePlazaStaticMeshes(root,{preserved=new Set(),tileSize=6}={}){
 root.updateMatrixWorld(true);const inverse=root.matrixWorld.clone().invert(),groups=new Map(),matrix=new T.Matrix4(),position=new T.Vector3();let saved=0,instances=0;
 root.traverse(m=>{
  if(!m.isMesh||m.isInstancedMesh||m.isSkinnedMesh||!m.visible||m.children.length||preserved.has(m)||Array.isArray(m.material)||m.material.transparent||m.material.transmission>0||Object.keys(m.geometry.morphAttributes).length||m.geometry.isInstancedBufferGeometry)return;
  matrix.multiplyMatrices(inverse,m.matrixWorld);if(matrix.determinant()<=0)return;
  const shape=geometryKey(m.geometry);if(!shape)return;position.setFromMatrixPosition(matrix);
  const layout=Object.entries(m.geometry.attributes).sort(([a],[b])=>a.localeCompare(b)).map(([n,a])=>`${n}:${a.itemSize}:${a.normalized}:${a.array.constructor.name}`).join('|');
  const key=`${Boolean(m.geometry.index)}:${layout}:${m.material.uuid}:${m.layers.mask}:${m.renderOrder}:${m.castShadow}:${m.receiveShadow}:${Math.floor(position.x/tileSize)}:${Math.floor(position.z/tileSize)}`;
  const buckets=groups.get(key)||[[]];buckets[0].push(m);groups.set(key,buckets);
 });
 for(const buckets of groups.values())for(const meshes of buckets){
  if(meshes.length<3||!meshes.every(m=>equalGeometry(meshes[0].geometry,m.geometry)))continue;const first=meshes[0],batch=new T.InstancedMesh(first.geometry,first.material,meshes.length);
  batch.name='PlazaStaticInstancesV19';batch.layers.mask=first.layers.mask;batch.renderOrder=first.renderOrder;batch.castShadow=first.castShadow;batch.receiveShadow=first.receiveShadow;
  meshes.forEach((m,i)=>batch.setMatrixAt(i,matrix.multiplyMatrices(inverse,m.matrixWorld)));batch.instanceMatrix.needsUpdate=true;batch.computeBoundingBox();batch.computeBoundingSphere();
  meshes.forEach(m=>m.removeFromParent());root.add(batch);saved+=meshes.length-1;instances+=meshes.length;
 }
 // Dispose only redundant geometry, never a shared retained geometry/material.
 const retained=new Set();root.traverse(m=>{if(m.geometry)retained.add(m.geometry);});
 for(const buckets of groups.values())for(const meshes of buckets)if(meshes.length>=3)for(const m of meshes)if(!m.parent&&!retained.has(m.geometry))m.geometry.dispose();
 return {drawCallsSaved:saved,instancedObjects:instances};
}

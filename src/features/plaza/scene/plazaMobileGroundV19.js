import * as T from 'three';
import {outsidePondV7} from './plazaGroundV7.js';

export function mobileGroundGeometry(rect,bounds){
 const g=new T.BufferGeometry();
 g.setAttribute('position',new T.Float32BufferAttribute([rect.minX,.036,rect.minZ,rect.minX,.036,rect.maxZ,rect.maxX,.036,rect.maxZ,rect.maxX,.036,rect.minZ],3));
 g.setAttribute('normal',new T.Float32BufferAttribute([0,1,0,0,1,0,0,1,0,0,1,0],3));
 g.setAttribute('uv',new T.Float32BufferAttribute([
  (rect.minX-bounds.minX)/2.64,(rect.minZ-bounds.minZ)/1.56,
  (rect.minX-bounds.minX)/2.64,(rect.maxZ-bounds.minZ)/1.56,
  (rect.maxX-bounds.minX)/2.64,(rect.maxZ-bounds.minZ)/1.56,
  (rect.maxX-bounds.minX)/2.64,(rect.minZ-bounds.minZ)/1.56],2));
 g.setIndex([0,1,2,0,2,3]);g.computeBoundingBox();g.computeBoundingSphere();return g;
}
export function rebuildMobileGroundV19(map,bounds,{color,normal,ao},cellSize=8){
 const old=[];let original;
 map.traverse(o=>{if(!o.isMesh)return;if(/^V17_Courtyard_Bricks|^V6_Entrance_Bricks/.test(o.name)){old.push(o);original??=o.material;}});
 if(!original)throw new Error('MOBILE_GROUND_SOURCE_MISSING');
 const material=original.clone();material.name='Mobile_Baked_Brick_Surface';material.color.setRGB(1,1,1);material.map=color;material.normalMap=normal;if(ao){ao.channel=0;material.aoMap=ao;}material.normalScale.set(1,1);
 const meshes=[];
 for(let x=bounds.minX;x<bounds.maxX;x+=cellSize)for(let z=bounds.minZ;z<bounds.maxZ;z+=cellSize){
  const cell={minX:x,maxX:Math.min(x+cellSize,bounds.maxX),minZ:z,maxZ:Math.min(z+cellSize,bounds.maxZ)};
  for(const rect of outsidePondV7(cell)){const mesh=new T.Mesh(mobileGroundGeometry(rect,bounds),material);mesh.name='Mobile_Baked_Ground_Chunk';mesh.userData.plazaCollision=false;map.add(mesh);meshes.push(mesh);}
 }
 const walkParts=outsidePondV7(bounds),walkGeometry=new T.BufferGeometry();
 const positions=[],indices=[];for(const rect of walkParts){const g=mobileGroundGeometry(rect,bounds),offset=positions.length/3;positions.push(...g.attributes.position.array);indices.push(...Array.from(g.index.array,i=>i+offset));g.dispose();}
 walkGeometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));walkGeometry.setIndex(indices);walkGeometry.computeBoundingBox();walkGeometry.computeBoundingSphere();
 const walk=new T.Mesh(walkGeometry,material);walk.name='Mobile_Continuous_Walk_Surface';walk.visible=false;map.add(walk);
 old.forEach(o=>o.removeFromParent());const used=new Set();map.traverse(o=>{if(o.geometry)used.add(o.geometry);});const retired=new Set(old.map(o=>o.geometry));for(const geometry of retired)if(!used.has(geometry))geometry.dispose();
 return {meshes,base:meshes[0],walk,count:0,triangles:meshes.length*2,baked:true,chunks:meshes.length};
}

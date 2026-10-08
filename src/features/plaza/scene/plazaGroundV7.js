import * as THREE from 'three';
export const POND_V7=Object.freeze({minX:-13.09,maxX:-.91,minZ:6.91,maxZ:11.09});
const BOUNDS={minX:-19.8,maxX:28.3,minZ:-24.8,maxZ:12.8};
// Split a rectangle around the real lake; geometry never covers the water.
export function outsidePondV7(r){const p=POND_V7,x0=Math.max(r.minX,p.minX),x1=Math.min(r.maxX,p.maxX),z0=Math.max(r.minZ,p.minZ),z1=Math.min(r.maxZ,p.maxZ);if(x0>=x1||z0>=z1)return[r];return[{minX:r.minX,maxX:x0,minZ:r.minZ,maxZ:r.maxZ},{minX:x1,maxX:r.maxX,minZ:r.minZ,maxZ:r.maxZ},{minX:x0,maxX:x1,minZ:r.minZ,maxZ:z0},{minX:x0,maxX:x1,minZ:z1,maxZ:r.maxZ}].filter(a=>a.maxX-a.minX>.002&&a.maxZ-a.minZ>.002);}
function buffers(){return{p:[],n:[],uv:[],idx:[]};}
function face(b,points){const a=new THREE.Vector3(...points[0]),c=new THREE.Vector3(...points[1]),d=new THREE.Vector3(...points[2]),normal=c.sub(a).cross(d.sub(a)).normalize(),start=b.p.length/3;for(let i=0;i<4;i++){b.p.push(...points[i]);b.n.push(...normal.toArray());b.uv.push(i===1||i===2?1:0,i>1?1:0);}b.idx.push(start,start+1,start+2,start,start+2,start+3);}
function geometry(b){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(b.n,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(b.uv,2));g.setIndex(b.idx);g.computeBoundingBox();g.computeBoundingSphere();return g;}
function tile(b,r){const x0=r.minX,x1=r.maxX,z0=r.minZ,z1=r.maxZ,bevel=Math.min(.003,(x1-x0)/5,(z1-z0)/5);const top=[[x0+bevel,.036,z0+bevel],[x0+bevel,.036,z1-bevel],[x1-bevel,.036,z1-bevel],[x1-bevel,.036,z0+bevel]],edge=[[x0,.029,z0],[x0,.029,z1],[x1,.029,z1],[x1,.029,z0]];face(b,top);for(let i=0;i<4;i++){const j=(i+1)%4;face(b,[edge[i],edge[j],top[j],top[i]]);}}
export function rebuildGroundV7(map,bounds=BOUNDS){
 const old=[],materials=[];let groutMaterial;
 map.traverse(o=>{if(!o.isMesh)return;if(/^V17_Courtyard_Bricks|^V6_Entrance_Bricks/.test(o.name)){old.push(o);if(/^V17_Courtyard_Bricks/.test(o.name)&&!materials.includes(o.material))materials.push(o.material);}if(o.name==='Courtyard_Ground')groutMaterial=o.material;});
 if(materials.length!==6)throw new Error('Thiếu sáu vật liệu gạch của map.');
 const data=materials.map(buffers);let count=0;
 for(let row=0;row<=Math.ceil((bounds.maxZ-bounds.minZ)/.26);row++)for(let col=0;col<=Math.ceil((bounds.maxX-bounds.minX)/.44);col++){
  const x=bounds.minX+.02+col*.44+(row%2?.22:0),z=bounds.minZ-.03+row*.26;
  const r={minX:Math.max(bounds.minX,x-.215),maxX:Math.min(bounds.maxX,x+.215),minZ:Math.max(bounds.minZ,z-.125),maxZ:Math.min(bounds.maxZ,z+.125)};
  if(r.maxX-r.minX<.004||r.maxZ-r.minZ<.004)continue;
  for(const piece of outsidePondV7(r)){tile(data[(row*7+col*11)%6],piece);count++;}
 }
 const meshes=data.map((b,i)=>{const o=new THREE.Mesh(geometry(b),materials[i]);o.name=`V7_Courtyard_Bricks_${i+1}`;o.userData.plazaCollision=false;map.add(o);return o;});
 const grout=buffers();for(const r of outsidePondV7(bounds))face(grout,[[r.minX,.025,r.minZ],[r.minX,.025,r.maxZ],[r.maxX,.025,r.maxZ],[r.maxX,.025,r.minZ]]);
 const base=new THREE.Mesh(geometry(grout),groutMaterial);base.name='V7_Courtyard_Grout';base.userData.plazaCollision=false;map.add(base);
 const walk=base.clone();walk.geometry=base.geometry.clone().translate(0,.011,0);walk.name='V7_Courtyard_Continuous_Walk_Surface';walk.visible=false;map.add(walk);
 old.forEach(o=>o.removeFromParent());const used=new Set();map.traverse(o=>{if(o.geometry)used.add(o.geometry);});old.forEach(o=>{if(!used.has(o.geometry))o.geometry.dispose();});
 return{meshes,base,walk,count,triangles:data.reduce((n,b)=>n+b.idx.length/3,0)};
}
export function closePondV7(map,entrance){
 map.updateMatrixWorld(true);const copies=[],source=[];
 map.traverse(o=>{if(!o.isMesh||!/^V15_(?:Balustrade_|Stone_Balust|Stone_Pier_|Pier_|Lantern_)/.test(o.name))return;const box=new THREE.Box3().setFromObject(o),c=box.getCenter(new THREE.Vector3());if(Math.abs(c.z-6.95)<.4&&c.x>=-13.4&&c.x<=-.6){const rail=/^V15_Balustrade_Continuous_Rail/.test(o.name),baluster=/^V15_Stone_Baluster/.test(o.name);if(rail||baluster||c.x>-12.5&&c.x<-1.5)source.push(o);}});
 const copy=(o,dx,dz,side)=>{const geometry=o.geometry.clone().applyMatrix4(o.matrixWorld).translate(dx,0,dz),mesh=new THREE.Mesh(geometry,o.material);mesh.name=`V7_Pond_${side}_${o.name}`;mesh.userData.plazaCollision=true;map.add(mesh);copies.push(mesh);};
 source.forEach(o=>copy(o,0,4.05,'Back'));
 entrance.moved.forEach(o=>copy(o,-12,0,'Left'));
 map.updateMatrixWorld(true);return{copies,sides:4};
}

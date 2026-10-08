import test from 'node:test';import assert from 'node:assert/strict';import{readFile}from'node:fs/promises';import*as T from'three';import{GLTFLoader}from'three/addons/loaders/GLTFLoader.js';
import{buildWorldV3,PLAZA_FLOOR_NAME}from'../scene/plazaWorldV3.js';import{refinePlazaMap,findTapPath}from'../scene/plazaRefinementsV2.js';import{createObstacleIndex,isSolidObstacle}from'../scene/plazaMotionV1.js';
async function scene(){const b=await readFile(new URL('../../../../public/cing-plaza/assets/cing-plaza-map-v17.glb',import.meta.url)),l=new GLTFLoader();l.register(()=>({name:'GEOMETRY_ONLY',loadTexture:()=>Promise.resolve(new T.Texture())}));const map=(await l.parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'')).scene;refinePlazaMap(map);map.updateMatrixWorld(true);return map;}
const labels=()=>new T.MeshStandardMaterial();
test('left wall matches approved right wall without ivory overlay; both logos are aligned',async()=>{
 const map=await scene(),world=buildWorldV3(map,{labelFactory:labels,logo:new T.Texture()});
 for(const name of ['ART_Back_Ivory_0','ART_Back_Ivory_38','ART_Interior_Crown_0','ART_Interior_Dado_0','V3_Relocated_ART_Back_Ivory_0','V3_Relocated_Sphere','V3_Relocated_Sphere001'])assert.equal(map.getObjectByName(name),undefined);
 for(const[a,b]of [['Cafe_Side_Wall_1','Cafe_Side_Wall_-1'],['Cafe_Orange_Side001','Cafe_Orange_Side']]){const right=map.getObjectByName(a),left=map.getObjectByName(b),r=new T.Box3().setFromObject(right),l=new T.Box3().setFromObject(left);assert.equal(right.material,left.material);assert.ok(r.getSize(new T.Vector3()).distanceTo(l.getSize(new T.Vector3()))<1e-5);assert.ok(Math.abs(r.getCenter(new T.Vector3()).x+l.getCenter(new T.Vector3()).x+18)<1e-5);}
 assert.equal(world.logoRoots[0].position.z,world.logoRoots[1].position.z);assert.equal(world.logoRoots[0].position.y,world.logoRoots[1].position.y);
});
test('entire table set moves indoors with all three repaired chairs and cups supported by cafe floor',async()=>{
 const map=await scene(),world=buildWorldV3(map,{labelFactory:labels});assert.ok(world.movedFurniture.length>0);const top=map.getObjectByName('V15_Table_Polished_Wood_Top'),center=new T.Box3().setFromObject(top).getCenter(new T.Vector3());assert.ok(Math.abs(center.x+7.35)<1e-5);assert.ok(Math.abs(center.z+9.5)<1e-5);const seats=world.movedFurniture.filter(o=>/^V15_Chair_Leather_Seat/.test(o.name));assert.equal(seats.length,3);
 for(const o of world.movedFurniture){const b=new T.Box3().setFromObject(o);assert.ok(b.min.x>-12.12&&b.max.x<-5.9,o.name);assert.ok(b.min.z>-13&&b.max.z<-1,o.name);assert.ok(b.min.y>.27,o.name);}
 assert.equal(world.movedFurniture.filter(o=>/^V15_Table_Tea_Cup/.test(o.name)).length,2);
});
test('cafe foliage turns outward as a complete tree; other trees retain their approved locations',async()=>{
 const map=await scene(),before=new Map();map.traverse(o=>{if(/^V15_Thousands_Of_Folded_Leaves_/.test(o.name)){const a=o.geometry.clone().applyMatrix4(o.matrixWorld).attributes.position;before.set(o.name,a);}});const world=buildWorldV3(map,{labelFactory:labels});let cafe=0;
 for(const mesh of world.cafeLeafSources){const a=mesh.geometry.attributes.position,b=before.get(mesh.name);for(let i=0;i<a.count;i++){const isCafe=b.getX(i)<-8&&b.getZ(i)>-8;if(isCafe){const expected=new T.Vector3(b.getX(i),b.getY(i),b.getZ(i)).applyMatrix4(world.cafeTreeV15.transform);assert.ok(expected.distanceTo(new T.Vector3(a.getX(i),a.getY(i),a.getZ(i)))<1e-5);assert.ok(a.getX(i)<-12.45);cafe++;}else{assert.ok(Math.abs(a.getX(i)-b.getX(i)-6.5)<1e-5);assert.equal(a.getY(i),b.getY(i));const dz=a.getZ(i)-b.getZ(i);assert.ok(Math.abs(dz)<1e-5||Math.abs(dz+11.5)<1e-5);}}}
 assert.ok(cafe>1000);assert.ok(world.addedLeafTriangles>10000&&world.addedLeafTriangles<100000);let branches=0,layers=0;map.traverse(o=>{if(o.name==='V5_Banyan_Lower_Bough')branches++;if(o.name==='V5_Banyan_Layered_Leaves')layers++;});assert.equal(branches,8);assert.equal(layers,12);
});
test('actual stage staircase and wood floor support a continuous ascent and descent with body collision checks',async()=>{
 const map=await scene(),world=buildWorldV3(map,{labelFactory:labels}),floors=[...world.floors],boxes=[...world.obstacles];map.updateMatrixWorld(true);
 map.traverse(o=>{if(!o.isMesh)return;if(PLAZA_FLOOR_NAME.test(o.name)){floors.push(o);return;}if(world.floors.includes(o)||o.userData.plazaCollision===false||o.userData.plazaDynamic)return;const materials=Array.isArray(o.material)?o.material:[o.material];if(!isSolidObstacle(materials.map(m=>m.name)))return;const b=new T.Box3().setFromObject(o),size=b.getSize(new T.Vector3());if(size.x<.06||size.z<.06||size.y<.12||b.min.y>3||b.max.y<.1)return;boxes.push({minX:b.min.x,maxX:b.max.x,minZ:b.min.z,maxZ:b.max.z,minY:b.min.y,maxY:b.max.y});});
 const collision=createObstacleIndex(boxes),ray=new T.Raycaster(),normal=new T.Vector3(),nm=new T.Matrix3();let height=.036,peak=0;
 const route=[];for(let z=-3.6;z>=-7.4;z-=.035)route.push(z);route.push(...[...route].reverse());
 for(const z of route){ray.set(new T.Vector3(21.7,height+.3,z),new T.Vector3(0,-1,0));ray.far=2;const hit=ray.intersectObjects(floors,false).find(h=>{nm.getNormalMatrix(h.object.matrixWorld);return normal.copy(h.face.normal).applyNormalMatrix(nm).y>.65;});assert.ok(hit,`missing floor at ${z}`);const y=/^(Courtyard_Ground|V17_Ground_Extension)/.test(hit.object.name)?Math.max(.036,hit.point.y):hit.point.y;assert.ok(y-height<=.24+1e-6,`rise ${y-height}`);assert.ok(height-y<=.38+1e-6,`drop ${height-y}`);assert.equal(collision(21.7,z,y),false,`body blocked at ${z},${y}`);height=y;peak=Math.max(peak,y);}
 assert.ok(Math.abs(peak-1.12)<1e-5);assert.ok(Math.abs(height-.036)<1e-5);assert.ok(floors.includes(map.getObjectByName('V15_Stage_Individual_Wood_Planks')));
});

test('relocated garden plants follow their planters instead of floating through the deck',async()=>{
 const map=await scene();buildWorldV3(map,{labelFactory:labels});let checked=0;map.traverse(o=>{if(!/^V17_Garden_New_(?:Foliage|Flowers)_/.test(o.name))return;const a=o.geometry.attributes.position;for(let i=0;i<a.count;i++){const x=a.getX(i),y=a.getY(i),z=a.getZ(i);assert.ok(!(x>18.6&&x<24.8&&z>-10&&z<-5.7&&y>1.12),'plant intersects deck');checked++;}});assert.ok(checked>1000);const lamp=map.getObjectByName('V15_Lantern_Glass023');assert.ok(new T.Box3().setFromObject(lamp).max.x<18.4);
});

test('tap routing follows stairs and smoothing cannot shortcut a high platform edge',()=>{
 const height=(x,z)=>z>0?0:Math.abs(x)<.65?Math.min(1.12,Math.ceil(-z/.30)*.195):1.12;
 const walkable=(x,z)=>Math.abs(x)<3&&z>-3&&z<1.6;const canTraverse=(a,b)=>{const d=height(b.x,b.z)-height(a.x,a.z);return d<=.24+1e-6&&d>=-.38-1e-6;};
 const path=findTapPath({x:1.6,z:1},{x:1.6,z:-2.5},walkable,{canTraverse});assert.ok(path);assert.ok(path.some(p=>Math.abs(p.x)<.7));let cursor={x:1.6,z:1};for(const target of path){const n=Math.ceil(Math.hypot(target.x-cursor.x,target.z-cursor.z)/.08);let previous=cursor;for(let i=1;i<=n;i++){const point={x:cursor.x+(target.x-cursor.x)*i/n,z:cursor.z+(target.z-cursor.z)*i/n};assert.ok(canTraverse(previous,point),'smoothed route jumps the side');previous=point;}cursor=target;}
 const down=findTapPath({x:1.6,z:-2.5},{x:1.6,z:1},walkable,{canTraverse});assert.ok(down);assert.ok(down.some(p=>Math.abs(p.x)<.7));
});

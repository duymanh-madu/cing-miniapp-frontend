import * as T from 'three';
// Preserve every brick top and authored material. Omit only subpixel bevel faces.
export function plazaGroundTopGeometry(full){
 if(!full.index||full.index.count%30!==0)throw new Error('UNEXPECTED_BRICK_GEOMETRY');
 const top=new T.BufferGeometry();for(const [name,attribute] of Object.entries(full.attributes))top.setAttribute(name,attribute);
 const indices=[];for(let i=0;i<full.index.count;i+=30)for(let j=0;j<6;j++)indices.push(full.index.getX(i+j));top.setIndex(indices);top.boundingBox=full.boundingBox?.clone()||null;top.boundingSphere=full.boundingSphere?.clone()||null;return top;
}
export function plazaGroundTiles(full,cellSize=8){
 if(!full.index||full.index.count%30!==0)throw new Error('UNEXPECTED_BRICK_GEOMETRY');
 const groups=new Map(),position=full.attributes.position,point=new T.Vector3();
 for(let i=0;i<full.index.count;i+=30){let x=0,z=0;for(const j of [0,1,2,5]){const k=full.index.getX(i+j);x+=position.getX(k)/4;z+=position.getZ(k)/4;}const key=`${Math.floor(x/cellSize)}:${Math.floor(z/cellSize)}`;if(!groups.has(key))groups.set(key,{indices:[],box:new T.Box3()});const group=groups.get(key);
  for(let j=0;j<30;j++){const index=full.index.getX(i+j);group.indices.push(index);group.box.expandByPoint(point.fromBufferAttribute(position,index));}
 }
 return [...groups.values()].map(group=>{const geometry=new T.BufferGeometry();for(const [name,attribute] of Object.entries(full.attributes))geometry.setAttribute(name,attribute);geometry.setIndex(group.indices);geometry.boundingBox=group.box;geometry.boundingSphere=group.box.getBoundingSphere(new T.Sphere());return geometry;});
}
export function createPlazaGroundDetailV19(meshes){
 const entries=meshes.map(mesh=>{
  const group=new T.Group();group.name='PlazaGroundVisibleTiles';group.visible=false;mesh.parent?.add(group);mesh.updateMatrixWorld(true);
  const tiles=plazaGroundTiles(mesh.geometry).map(geometry=>{const tile=new T.Mesh(geometry,mesh.material);tile.position.copy(mesh.position);tile.quaternion.copy(mesh.quaternion);tile.scale.copy(mesh.scale);tile.layers.mask=mesh.layers.mask;tile.castShadow=mesh.castShadow;tile.receiveShadow=mesh.receiveShadow;tile.userData.plazaCollision=false;group.add(tile);return {tile,box:geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld)};});
  return {mesh,visible:mesh.visible,full:mesh.geometry,top:plazaGroundTopGeometry(mesh.geometry),group,tiles};
 });let coarse=false,tiled=false;const frustum=new T.Frustum(),vp=new T.Matrix4(),allTiles=entries.flatMap(e=>e.tiles);
 return {update(camera,height,dpr){
  const nearestDistance=Math.max(.01,Math.abs(camera.position.y-.036));
  const bevelPixels=.003*height*dpr/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2))*nearestDistance);
  coarse=coarse?bevelPixels<.35:bevelPixels<.25;
  vp.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);frustum.setFromProjectionMatrix(vp);const visibleTiles=allTiles.reduce((n,e)=>n+Number(frustum.intersectsBox(e.box)),0),fraction=visibleTiles/Math.max(1,allTiles.length);
  tiled=!coarse&&(tiled?fraction<.3:fraction<.2);
  for(const e of entries){e.mesh.geometry=coarse?e.top:e.full;e.mesh.visible=e.visible&&!tiled;e.group.visible=e.visible&&tiled;}
  return {groundSubpixelBevels:coarse,groundBevelPixels:bevelPixels,groundDrawMode:tiled?'visible-tiles':coarse?'whole-top':'whole-full',groundTileCount:allTiles.length,groundVisibleTiles:visibleTiles};
 },prewarm(render,camera,height,dpr){
  try{
   for(const e of entries){e.mesh.geometry=e.full;e.mesh.visible=e.visible;e.group.visible=false;}render();
   for(const e of entries)e.mesh.geometry=e.top;render();
   for(const e of entries){e.mesh.visible=false;e.group.visible=e.visible;}render();
  }finally{this.update(camera,height,dpr);}
 },dispose(){for(const e of entries){e.mesh.geometry=e.full;e.mesh.visible=e.visible;e.group.removeFromParent();for(const {tile} of e.tiles)tile.geometry.dispose();e.top.dispose();}},};
}

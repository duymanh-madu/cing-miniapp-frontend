import * as THREE from 'three';
export const PLAZA_CAMERA_V8=Object.freeze({min:2.2,portraitMax:42,landscapeMax:38});
export function plazaCameraLimitV8(aspect){return aspect<1?PLAZA_CAMERA_V8.portraitMax:PLAZA_CAMERA_V8.landscapeMax;}
export function groundFootprintV8(camera){
 camera.updateMatrixWorld(true);const points=[];
 for(const x of [-1,1])for(const y of [-1,1]){
  const direction=new THREE.Vector3(x,y,.5).unproject(camera).sub(camera.position).normalize();
  if(direction.y>=-1e-5)return null;
  const t=-camera.position.y/direction.y;if(t<=0)return null;
  points.push(camera.position.clone().addScaledVector(direction,t));
 }
 return new THREE.Box3().setFromPoints(points);
}
export function enforcePlazaCameraV8(camera,controls,bounds){
 const offset=camera.position.clone().sub(controls.target),spherical=new THREE.Spherical().setFromVector3(offset);
 spherical.radius=Math.max(controls.minDistance,Math.min(spherical.radius,controls.maxDistance));
 // At wide zoom the upper image ray must still meet the courtyard, never the horizon.
 const wide=THREE.MathUtils.smoothstep(spherical.radius,9,20);
 spherical.phi=Math.min(spherical.phi,THREE.MathUtils.lerp(Math.PI*.32,Math.PI*.30,wide));
 const margin=.5,width=bounds.maxX-bounds.minX-margin*2,depth=bounds.maxZ-bounds.minZ-margin*2;
 let box;
 for(let i=0;i<14;i++){
  camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));camera.lookAt(controls.target);
  box=groundFootprintV8(camera);
  if(box&&box.max.x-box.min.x<=width&&box.max.z-box.min.z<=depth)break;
  if(!box)spherical.phi=Math.max(Math.PI*.18,spherical.phi-.04);
  else spherical.radius=Math.max(controls.minDistance,spherical.radius*.9);
 }
 if(!box)return;
 const dx=box.min.x<bounds.minX+margin?bounds.minX+margin-box.min.x:box.max.x>bounds.maxX-margin?bounds.maxX-margin-box.max.x:0;
 const dz=box.min.z<bounds.minZ+margin?bounds.minZ+margin-box.min.z:box.max.z>bounds.maxZ-margin?bounds.maxZ-margin-box.max.z:0;
 controls.target.x+=dx;controls.target.z+=dz;camera.position.x+=dx;camera.position.z+=dz;
 camera.updateMatrixWorld(true);
}

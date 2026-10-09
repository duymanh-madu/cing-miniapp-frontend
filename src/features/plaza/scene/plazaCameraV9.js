import * as T from 'three';
import {groundFootprintV8} from './plazaCameraV8.js';
export const PLAZA_CAMERA_V9=Object.freeze({min:.45,portraitMax:42,landscapeMax:38});
export function plazaCameraLimitV9(aspect){return aspect<1?42:38;}
function within(camera,bounds,margin){const box=groundFootprintV8(camera);return box&&box.min.x>=bounds.minX+margin&&box.max.x<=bounds.maxX-margin&&box.min.z>=bounds.minZ+margin&&box.max.z<=bounds.maxZ-margin&&camera.position.x>=bounds.minX+margin&&camera.position.x<=bounds.maxX-margin&&camera.position.z>=bounds.minZ+margin&&camera.position.z<=bounds.maxZ-margin;}
export function enforcePlazaCameraV9(camera,controls,bounds,center,dt=.016,state={}){
 camera.fov=T.MathUtils.lerp(camera.fov,45,1-Math.exp(-7*Math.min(.05,dt)));camera.updateProjectionMatrix();
 const offset=camera.position.clone().sub(controls.target),s=new T.Spherical().setFromVector3(offset);
 if(state.applied===undefined||Math.abs(s.radius-state.applied)>.002)state.requested=s.radius;
 state.requested=T.MathUtils.clamp(state.requested,controls.minDistance,controls.maxDistance);
 // The avatar is the sole focus. Never shift it to fit the map.
 controls.target.copy(center);
 s.phi=T.MathUtils.clamp(s.phi,.015,Math.PI*.32);
 const place=r=>{s.radius=r;camera.position.copy(center).add(new T.Vector3().setFromSpherical(s));camera.lookAt(center);};
 function limit(margin){
  let best=null;
  for(let i=0;i<=32;i++){const r=controls.minDistance+(controls.maxDistance-controls.minDistance)*i/32;place(r);if(within(camera,bounds,margin))best=r;}
  if(best===null)return null;let lo=best,hi=Math.min(controls.maxDistance,best+(controls.maxDistance-controls.minDistance)/32);
  for(let i=0;i<12;i++){const r=(lo+hi)/2;place(r);if(within(camera,bounds,margin))lo=r;else hi=r;}
  return lo;
 }
 let hard=limit(.12);
 for(let i=0;hard===null&&i<18;i++){s.phi=Math.max(.015,s.phi-.055);hard=limit(.12);}
 // At a wall the avatar's elevated focus makes even closest distance
 // too wide. Narrow the lens rather than shifting focus or rotating the view.
 for(let i=0;hard===null&&i<18;i++){camera.fov=Math.max(1,camera.fov*.8);camera.updateProjectionMatrix();hard=limit(.12);}
 if(hard===null){place(controls.minDistance);state.applied=s.radius;return;}
 const buffered=limit(.9)??hard,target=Math.min(state.requested,buffered);
 const previous=state.applied??target,blended=T.MathUtils.lerp(previous,target,1-Math.exp(-7*Math.min(.05,dt)));
 let distance=Math.min(blended,hard);place(distance);
 // Low camera distances are not always in the feasible interval; use a safe
 // distance found above instead of allowing a single unsafe frame.
 if(!within(camera,bounds,.12)){distance=Math.min(target,hard);place(distance);if(!within(camera,bounds,.12)){distance=hard;place(distance);}}
 state.applied=distance;
 camera.updateMatrixWorld(true);
}

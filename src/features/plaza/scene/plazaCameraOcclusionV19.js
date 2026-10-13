import * as T from 'three';
// Pull only the camera toward its target; movement and requested zoom are unchanged.
export function resolvePlazaCameraOcclusion(target,desired,boxes,margin=.22){
 const direction=desired.clone().sub(target),distance=direction.length();
 if(distance<.001)return desired.clone();
 const ray=new T.Ray(target,direction.divideScalar(distance)),hit=new T.Vector3();let safe=distance;
 for(const box of boxes){
  // Targets legitimately inside a room must not be trapped by its broad bounds.
  if(box.containsPoint(target))continue;
  if(ray.intersectBox(box,hit))safe=Math.min(safe,Math.max(.3,target.distanceTo(hit)-margin));
 }
 return target.clone().addScaledVector(direction,safe);
}
export function plazaCameraOccluderBoxes(obstacles){
 return obstacles.filter(o=>Number.isFinite(o.minY)&&o.maxY-o.minY>1.6&&o.maxY>2)
 .map(o=>new T.Box3(new T.Vector3(o.minX,o.minY,o.minZ),new T.Vector3(o.maxX,o.maxY,o.maxZ)));
}

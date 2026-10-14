import * as T from 'three';
// Camera IDs are stable per scale: transmission targets are reused, not resized.
export function createPlazaRefractionBudgetV19(reference){
 const views=new Map([1,.5,.25].map(scale=>[scale,reference.clone()]));let scale=1,entries=[],metrics=null;
 const vp=new T.Matrix4(),frustum=new T.Frustum(),point=new T.Vector3(),viewPoint=new T.Vector3();
 function atScale(value,camera){const view=views.get(value);view.copy(camera,false);return {camera:view,scale:value};}
 function setBoxes(boxes){entries=boxes.map(box=>({box,corners:Array.from({length:8},(_,i)=>new T.Vector3(i&1?box.max.x:box.min.x,i&2?box.max.y:box.min.y,i&4?box.max.z:box.min.z))}));}
 return {atScale,setBoxes,setWorld(root){root.updateMatrixWorld(true);const boxes=[];root.traverse(o=>{if(o.isMesh&&(Array.isArray(o.material)?o.material:[o.material]).some(m=>m.transmission>0))boxes.push(new T.Box3().setFromObject(o));});setBoxes(boxes);},select(camera){
  vp.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);frustum.setFromProjectionMatrix(vp);let nearest=Infinity,maxArea=0,visible=0;
  for(const entry of entries){if(!frustum.intersectsBox(entry.box))continue;visible++;nearest=Math.min(nearest,entry.box.distanceToPoint(camera.position));let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity,nearClip=false;
   for(const corner of entry.corners){viewPoint.copy(corner).applyMatrix4(camera.matrixWorldInverse);if(viewPoint.z>=-camera.near){nearClip=true;break;}point.copy(corner).applyMatrix4(vp);minX=Math.min(minX,point.x);maxX=Math.max(maxX,point.x);minY=Math.min(minY,point.y);maxY=Math.max(maxY,point.y);}
   const area=nearClip?1:Math.max(0,Math.min(1,maxX)-Math.max(-1,minX))*Math.max(0,Math.min(1,maxY)-Math.max(-1,minY))/4;maxArea=Math.max(maxArea,area);
  }
  if(!visible)scale=.25;
  else if(nearest<5||maxArea>.18)scale=1;
  else if(scale===1){if(nearest>6&&maxArea<.14)scale=nearest>12&&maxArea<.03?.25:.5;}
  else if(scale===.5){if(nearest>12&&maxArea<.03)scale=.25;}
  else if(nearest<10||maxArea>.04)scale=.5;
  metrics={visibleRefractors:visible,nearestDistance:Number.isFinite(nearest)?nearest:null,maxScreenArea:maxArea};return atScale(scale,camera);
 },getMetrics:()=>metrics,scales:[1,.5,.25]};
}

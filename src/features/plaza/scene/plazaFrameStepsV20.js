export function plazaFrameSecondsV20(now,last,max=.2){return Number.isFinite(now)&&Number.isFinite(last)?Math.max(0,Math.min((now-last)/1000,max)):0;}
export function movePlazaInSubsteps(position,velocity,speed,seconds,tryStep){
 const dt=Math.max(0,Math.min(seconds,.2));if(!dt)return false;const count=Math.max(1,Math.ceil(dt/.05)),distance=speed*dt/count;let moved=false;
 for(let i=0;i<count;i++){
  let step=tryStep(position.x+velocity.x*distance,position.z+velocity.z*distance);
  if(!step){const x=tryStep(position.x+velocity.x*distance,position.z),z=tryStep(position.x,position.z+velocity.z*distance);step=x||z;}
  moved||=step;if(!step)break;
 }return moved;
}
export function updatePlazaVrmInSubsteps(vrm,seconds){const dt=Math.max(0,Math.min(seconds,.2)),count=Math.max(1,Math.ceil(dt/.05));for(let i=0;i<count;i++)vrm.update(dt/count);}

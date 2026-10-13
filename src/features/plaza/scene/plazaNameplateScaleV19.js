// Perspective projection: labels follow the same depth, FOV and viewport as the actor.
export function plazaNameplateScaleV19({depth,fov,viewportHeight}) {
 if(![depth,fov,viewportHeight].every(Number.isFinite)||depth<=0||fov<=0||fov>=180||viewportHeight<=0)return 0;
 return Math.min(2,1.7*viewportHeight/(2*Math.tan(fov*Math.PI/360)*depth*240));
}

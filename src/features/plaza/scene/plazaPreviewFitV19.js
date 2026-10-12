/** Camera distance fits both the body height and body width, including a small
 * depth allowance so a head/foot nearer the lens is not cut by perspective.
 * Zoom >100% is intentionally DETAIL mode; the reset button returns to full body. */
export function computePlazaPreviewDistanceV19({height,width,depth=0,aspect,fov,margin=1.045}){
 const values=[height,width,depth,aspect,fov,margin];
 if(values.some(x=>!Number.isFinite(x))||height<=0||aspect<=0||fov<=0||fov>=90||margin<1)return 4;
 const tangent=Math.tan(fov*Math.PI/360);
 const perspective=Math.max(height/(2*tangent),Math.max(0,width)/(2*tangent*aspect));
 // Depth padding protects the foreground shoe/hair from larger perspective scaling.
 return perspective*margin+Math.max(0,depth)*.55;
}

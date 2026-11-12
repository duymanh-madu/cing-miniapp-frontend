// Asset geometry is immutable. Topology analysis and equivalent fitted geometry
// are shared, while skeletons, materials, visibility and expressions remain per actor.
const torsoCache = new WeakMap(), fittedCache = new WeakMap();
export function wardrobeTorsoVerticesV27(geometry) {
  if (torsoCache.has(geometry)) return torsoCache.get(geometry);
  const index=geometry.index, pos=geometry.attributes.position, adj=new Map();
  for(let i=0;i<index.count;i+=3) {
    const face=[index.getX(i),index.getX(i+1),index.getX(i+2)];
    for(const a of face) { if(!adj.has(a))adj.set(a,new Set());for(const b of face)adj.get(a).add(b); }
  }
  const remaining=new Set(adj.keys()),torso=new Set();
  while(remaining.size) {
    const first=remaining.values().next().value;remaining.delete(first);
    const pending=[first],component=[];let minY=Infinity,maxY=-Infinity,maxX=0;
    while(pending.length) {
      const a=pending.pop();component.push(a);
      minY=Math.min(minY,pos.getY(a));maxY=Math.max(maxY,pos.getY(a));maxX=Math.max(maxX,Math.abs(pos.getX(a)));
      for(const b of adj.get(a))if(remaining.delete(b))pending.push(b);
    }
    if(minY<.9&&maxY>1.4&&maxX<.2)for(const v of component)torso.add(v);
  }
  torsoCache.set(geometry,torso);return torso;
}
export function acquireWardrobeGeometryV27(source,key,build) {
  let variants=fittedCache.get(source);
  if(!variants){variants=new Map();fittedCache.set(source,variants);}
  let entry=variants.get(key);
  if(!entry){entry={geometry:build(),references:0};variants.set(key,entry);}
  entry.references++;let released=false;
  return {geometry:entry.geometry,release(){
    if(released)return;released=true;
    if(--entry.references===0){variants.delete(key);entry.geometry.dispose();}
  }};
}

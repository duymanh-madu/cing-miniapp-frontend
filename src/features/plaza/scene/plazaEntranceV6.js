import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export function acceptsPavingEdge(materialNames, hitY, surfaceY) {
  return Number.isFinite(surfaceY) && Number.isFinite(hitY) && Math.abs(hitY-surfaceY)<.05 &&
    materialNames.some(name=>/^V15_Handmade_Brick_/.test(name));
}

// Relocate only the short stone balustrade across the entrance aisle. The lake,
// the long garden rails and the outer gate keep their original positions.
export function refineEntranceV6(map) {
  map.updateMatrixWorld(true);
  const targets=[], bricks=[], materials=[];
  map.traverse(o=>{
    if(!o.isMesh)return;
    const box=new THREE.Box3().setFromObject(o),c=box.getCenter(new THREE.Vector3());
    if(/^V15_(?:Balustrade_|Stone_Balust|Stone_Pier_|Pier_|Lantern_)/.test(o.name)&&Math.abs(c.z-9.4)<.4&&c.x>=-.65&&c.x<=2.85)targets.push({o,c});
    if(/^V17_Courtyard_Bricks/.test(o.name)){bricks.push(o);if(!materials.includes(o.material))materials.push(o.material);}
  });
  const moved=[], joinedCorner=[];
  for(const{o,c}of targets){
    const rail=/^V15_Balustrade_Continuous_Rail/.test(o.name);
    const endpoint=!rail&&!/^V15_Stone_Baluster/.test(o.name);
    const pivotX=endpoint?(Math.abs(c.x+.3)<Math.abs(c.x-2.5)?-.3:2.5):c.x;
    const pivotZ=endpoint?9.4:c.z;
    // The lake already has a pier and lantern at its front-right corner.
    // Reuse that complete corner instead of stacking two piers/lanterns.
    if(endpoint&&pivotX===2.5){o.removeFromParent();joinedCorner.push(o);continue;}
    const target=new THREE.Vector3(-1+(endpoint?0:c.z-9.4),c.y,8.975-(pivotX-1.1)*4.05/2.8);
    const transform=new THREE.Matrix4().makeTranslation(...target.toArray()).multiply(new THREE.Matrix4().makeRotationY(Math.PI/2));
    if(rail)transform.multiply(new THREE.Matrix4().makeScale(4.05/2.8,1,1));
    transform.multiply(new THREE.Matrix4().makeTranslation(-pivotX,-c.y,-pivotZ));
    const mesh=new THREE.Mesh(o.geometry.clone().applyMatrix4(o.matrixWorld).applyMatrix4(transform),o.material);
    mesh.name=o.name;mesh.userData={...o.userData};mesh.userData.entranceRelocated=true;map.add(mesh);o.removeFromParent();moved.push(mesh);
  }
  // Fill the exported paving hole left by widening the map. Use the existing
  // six brick materials and the same staggered row grid, keeping the lake open.
  const rect={minX:-.92,maxX:2.48,minZ:7.08,maxZ:11.08},parts=materials.map(()=>[]),ray=new THREE.Raycaster();let count=0;
  const scale=48.5/42;
  for(let row=122;row<=139;row++){
    const z=-24.83+row*.26;
    for(let col=0;col<100;col++){
      const originalX=-19.78+col*.44+(row%2? .22:0),x=-20+(originalX+20)*scale;
      const minX=Math.max(rect.minX,x-.215*scale),maxX=Math.min(rect.maxX,x+.215*scale),minZ=Math.max(rect.minZ,z-.125),maxZ=Math.min(rect.maxZ,z+.125);
      if(maxX<=minX||maxZ<=minZ)continue;
      ray.set(new THREE.Vector3((minX+maxX)/2,1,(minZ+maxZ)/2),new THREE.Vector3(0,-1,0));
      if(ray.intersectObjects(bricks,false).length)continue;
      const geometry=new THREE.BoxGeometry(maxX-minX,.036,maxZ-minZ);geometry.translate((minX+maxX)/2,.018,(minZ+maxZ)/2);parts[(row*7+col*11)%materials.length].push(geometry);count++;
    }
  }
  const paving=[];
  for(let i=0;i<materials.length;i++)if(parts[i].length){const geometry=mergeGeometries(parts[i],false);parts[i].forEach(g=>g.dispose());const mesh=new THREE.Mesh(geometry,materials[i]);mesh.name=`V6_Entrance_Bricks_${i+1}`;mesh.userData.plazaCollision=false;map.add(mesh);paving.push(mesh);}
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(rect.maxX-rect.minX,rect.maxZ-rect.minZ),materials[0]);floor.name='V6_Entrance_Continuous_Walk_Surface';floor.position.set((rect.minX+rect.maxX)/2,.036,(rect.minZ+rect.maxZ)/2);floor.rotation.x=-Math.PI/2;floor.visible=false;floor.userData.plazaCollision=false;map.add(floor);
  map.updateMatrixWorld(true);
  const used=new Set();map.traverse(o=>{if(o.geometry)used.add(o.geometry);});for(const{o}of targets)if(!used.has(o.geometry))o.geometry.dispose();
  return{moved,joinedCorner,sourceParts:targets.length,paving,floor,brickCount:count};
}

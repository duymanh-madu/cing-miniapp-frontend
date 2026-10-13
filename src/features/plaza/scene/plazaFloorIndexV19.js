import {Box3} from 'three';
// Conservative x/z broad phase; exact ray/normal/height rules still decide the floor.
export function createPlazaFloorIndexV19(floors,cellSize=6){
 const cells=new Map(),box=new Box3();
 for(const floor of floors){box.setFromObject(floor);if(box.isEmpty())continue;
  for(let x=Math.floor(box.min.x/cellSize);x<=Math.floor(box.max.x/cellSize);x++)for(let z=Math.floor(box.min.z/cellSize);z<=Math.floor(box.max.z/cellSize);z++){
   const key=`${x}:${z}`;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(floor);
  }
 }
 return {query(x,z){return cells.get(`${Math.floor(x/cellSize)}:${Math.floor(z/cellSize)}`)||[];},floorCount:floors.length,cellCount:cells.size};
}

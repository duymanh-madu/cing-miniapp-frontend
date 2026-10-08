import * as THREE from 'three';
const PART=/^V15_(?:Balustrade_|Stone_Balust|Stone_Pier_|Pier_|Lantern_)/;
export const GARDEN_FENCE_V9=Object.freeze({start:5.3,end:21.1,z:9.4,bays:8});
export function repairGardenFenceV9(map){
  map.updateMatrixWorld(true);const old=[],pier=[],rails=[];let baluster;
  map.traverse(o=>{if(!o.isMesh||!PART.test(o.name))return;const box=new THREE.Box3().setFromObject(o),c=box.getCenter(new THREE.Vector3());
    if(Math.abs(c.z-9.4)<.4&&c.x>=4.9&&c.x<=21.5)old.push(o);
    if(Math.abs(c.z-6.95)<.4&&Math.abs(c.x+13)<.3&&!/^V15_(?:Balustrade_|Stone_Baluster)/.test(o.name))pier.push(o);
    if(/^V15_Balustrade_Continuous_Rail/.test(o.name)&&Math.abs(c.z-6.95)<.15&&Math.abs(c.x+7)<.1)rails.push(o);
    if(!baluster&&/^V15_Stone_Baluster/.test(o.name)&&Math.abs(c.z-6.95)<.15)baluster=o;
  });
  if(!pier.length||rails.length!==2||!baluster)throw new Error('Thiếu mẫu lan can đá gốc để sửa hàng rào.');
  const {start,end,z,bays}=GARDEN_FENCE_V9,spacing=(end-start)/bays,copies=[];
  function add(o,transform,name){const g=o.geometry.clone().applyMatrix4(o.matrixWorld).applyMatrix4(transform),mesh=new THREE.Mesh(g,o.material);mesh.name=name;mesh.userData={...o.userData,plazaCollision:true};map.add(mesh);copies.push(mesh);return mesh;}
  for(let i=0;i<=bays;i++)for(const o of pier)add(o,new THREE.Matrix4().makeTranslation(start+i*spacing+13,0,z-6.95),`V9_Garden_Pier_${i}_${o.name}`);
  for(const o of rails)add(o,new THREE.Matrix4().makeTranslation((start+end)/2,0,z).multiply(new THREE.Matrix4().makeScale((end-start)/12,1,1)).multiply(new THREE.Matrix4().makeTranslation(7,0,-6.95)),`V9_Garden_${o.name}`);
  const center=new THREE.Box3().setFromObject(baluster).getCenter(new THREE.Vector3());let balusters=0;
  for(let i=0;i<bays;i++)for(let j=0;j<5;j++){const x=start+i*spacing+.35+j*(spacing-.70)/4;add(baluster,new THREE.Matrix4().makeTranslation(x-center.x,0,z-center.z),`V9_Garden_Baluster_${i}_${j}`);balusters++;}
  old.forEach(o=>o.removeFromParent());const used=new Set();map.traverse(o=>{if(o.geometry)used.add(o.geometry);});for(const g of new Set(old.map(o=>o.geometry)))if(!used.has(g))g.dispose();
  map.updateMatrixWorld(true);return{copies,bays,piers:bays+1,balusters,spacing};
}

import * as T from 'three';
import {gardenBedsV8} from './plazaCleanupV8.js';
// Keep the stair approach open; reuse the approved stonework and planted foliage.
export function repairGardenV10(map){
 map.updateMatrixWorld(true);const old=[],templates=[],plants=[];let baluster;
 map.traverse(o=>{if(!o.isMesh)return;const b=new T.Box3().setFromObject(o),c=b.getCenter(new T.Vector3());
 if(/^V15_(?:Balustrade_|Stone_Balust|Stone_Pier_|Pier_|Lantern_)/.test(o.name)&&Math.abs(c.x-21.1)<.4&&c.z>=-6.6&&c.z<=7.4)old.push(o);
 if(/^V15_(?:Stone_Balustrade_Pier|Stone_Pier_|Pier_|Lantern_)/.test(o.name)&&Math.abs(c.x+13)<.3&&Math.abs(c.z-6.95)<.4)templates.push(o);
 if(!baluster&&/^V15_Stone_Baluster/.test(o.name)&&Math.abs(c.z-6.95)<.15)baluster=o;
 if(/^V15_Garden_Individual_Folded_Foliage_/.test(o.name))plants.push(o);
 // Move the planter at the stair's left edge into the neighbouring garden pocket.
 if(/^V15_Garden_Planter_/.test(o.name)&&c.x>20&&c.x<21&&c.z<-3.7&&c.z>-6.3)o.position.x-=2.8;
 });
 const rails=old.filter(o=>/^V15_Balustrade_Continuous_Rail/.test(o.name));
 const copies=[],start=-3.35,end=7,bays=6;
 function add(o,m,name){const mesh=new T.Mesh(o.geometry.clone().applyMatrix4(o.matrixWorld).applyMatrix4(m),o.material);mesh.name=name;mesh.userData.plazaCollision=true;map.add(mesh);copies.push(mesh);return mesh;}
 for(let i=0;i<=bays;i++)for(const o of templates)add(o,new T.Matrix4().makeTranslation(34.1,0,start+(end-start)*i/bays-6.95),`V10_East_Pier_${i}_${o.name}`);
 for(const o of rails){const b=new T.Box3().setFromObject(o),c=b.getCenter(new T.Vector3());add(o,new T.Matrix4().makeTranslation(21.1,0,(start+end)/2).multiply(new T.Matrix4().makeScale(1,1,(end-start)/(b.max.z-b.min.z))).multiply(new T.Matrix4().makeTranslation(-c.x,0,-c.z)),`V10_East_${o.name}`);}
 const c=new T.Box3().setFromObject(baluster).getCenter(new T.Vector3());
 for(let i=0;i<bays;i++)for(let j=1;j<=5;j++)add(baluster,new T.Matrix4().makeTranslation(21.1-c.x,0,start+(end-start)*(i+j/6)/bays-c.z),`V10_East_Baluster_${i}_${j}`);
 old.forEach(o=>o.removeFromParent());map.updateMatrixWorld(true);
 const beds=gardenBedsV8(map),point=new T.Vector3(),patches=[];
 // Extract a complete existing healthy bed, preserving folded leaves and materials.
 let source=null,best=0;
 for(const bed of beds){let n=0;for(const o of plants){const a=o.geometry.attributes.position;for(let i=0;i<a.count;i+=3){point.fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld);if(bed.containsPoint(new T.Vector3(point.x,bed.min.y,point.z)))n++;}}if(n>best){best=n;source=bed;}}
 if(!source)throw Error('Thiếu cây mẫu trong chậu.');
 for(const o of plants){const a=o.geometry.attributes.position,ids=[];for(let i=0;i<a.count;i+=3){let x=0,z=0;for(let j=0;j<3;j++){point.fromBufferAttribute(a,i+j).applyMatrix4(o.matrixWorld);x+=point.x/3;z+=point.z/3;}if(x>=source.min.x&&x<=source.max.x&&z>=source.min.z&&z<=source.max.z)ids.push(i,i+1,i+2);}
 if(!ids.length)continue;const g=new T.BufferGeometry();for(const[name,attr]of Object.entries(o.geometry.attributes)){const arr=new attr.array.constructor(ids.length*attr.itemSize);ids.forEach((id,i)=>{for(let k=0;k<attr.itemSize;k++)arr[i*attr.itemSize+k]=attr.array[id*attr.itemSize+k];});g.setAttribute(name,new T.BufferAttribute(arr,attr.itemSize,attr.normalized));}g.applyMatrix4(o.matrixWorld);patches.push({g,material:o.material});}
 const restored=[];
 for(const bed of beds){const c=bed.getCenter(new T.Vector3());if(!((c.x>17&&c.x<21&&c.z>-6.2&&c.z<6.2)||(c.x>17&&c.x<21&&c.z>8.4)))continue;
 const s=source.getSize(new T.Vector3()),d=bed.getSize(new T.Vector3()),sc=source.getCenter(new T.Vector3());
 for(const[p,patch]of patches.entries()){const turn=(s.x>s.z)!==(d.x>d.z),sx=turn?s.z:s.x,sz=turn?s.x:s.z,scale=Math.min(d.x/sx,d.z/sz);const m=new T.Matrix4().makeTranslation(c.x,bed.max.y,c.z).multiply(new T.Matrix4().makeScale(scale,1,scale)).multiply(new T.Matrix4().makeRotationY(turn?Math.PI/2:0)).multiply(new T.Matrix4().makeTranslation(-sc.x,-source.max.y,-sc.z));const o=new T.Mesh(patch.g.clone().applyMatrix4(m),patch.material);o.name=`V10_Restored_Planter_${restored.length}_${p}`;o.userData.plazaCollision=false;map.add(o);}restored.push(bed.clone());
 }
 patches.forEach(p=>p.g.dispose());map.updateMatrixWorld(true);return{copies,restored,start,end,bays};
}

import * as T from 'three';
import {gardenBedsV8} from './plazaCleanupV8.js';
export const DINH_V12=Object.freeze({x:14.5,z:-23.6,width:24,depth:6.6,floor:1.02,base:.24,roofWidth:31,bays:9,clearOpening:3.66,middleBay:4,columnXs:Object.freeze([2.5,5,7.5,10,12.5,16.5,19,21.5,24,26.5])});
function timberMaterial(){const w=96,h=512,data=new Uint8Array(w*h*4);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const n=Math.sin(x*.69+Math.sin(y*.018)*1.4)+.42*Math.sin(x*2.4+y*.006)+.18*Math.sin(x*4.7+y*.027),v=1+n*.105,i=(y*w+x)*4;data[i]=70*v;data[i+1]=49*v;data[i+2]=34*v;data[i+3]=255;}const map=new T.DataTexture(data,w,h);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.magFilter=T.LinearFilter;map.minFilter=T.LinearMipmapLinearFilter;map.generateMipmaps=true;map.needsUpdate=true;const m=new T.MeshStandardMaterial({map,roughness:.88,bumpMap:map,bumpScale:.008});m.name='V12_Aged_Lim_Timber';return m;}
function moveRearGarden(map){
 map.updateMatrixWorld(true);const point=new T.Vector3(),beds=gardenBedsV8(map),rearBeds=beds.filter(b=>b.getCenter(new T.Vector3()).z<-19.9);map.traverse(o=>{if(!o.isMesh||/Dinh|Ground|Courtyard|Mortar/.test(o.name))return;
 const b=new T.Box3().setFromObject(o),c=b.getCenter(new T.Vector3());
 if(/Folded_Leaves_|Garden_Individual_Folded_Foliage_|Hundreds_Of_Ivory_Flowers_|Flower_Stems|Garden_New_(?:Foliage|Flowers)_/.test(o.name)){
  const src=o.geometry,g=src.clone(),a=g.attributes.position,inverse=o.matrixWorld.clone().invert();let treeMove;
  if(/Folded_Leaves_/.test(o.name)){const parent=Array.from({length:a.count},(_,i)=>i),find=i=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;},idx=g.index;for(let i=0;i<(idx?.count??a.count);i+=3){const ids=[0,1,2].map(j=>idx?idx.getX(i+j):i+j),r=find(ids[0]);parent[find(ids[1])]=r;parent[find(ids[2])]=r;}const groups=new Map();for(let i=0;i<a.count;i++){const r=find(i),v=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld),entry=groups.get(r)||{sum:new T.Vector3(),count:0};entry.sum.add(v);entry.count++;groups.set(r,entry);}const flags=new Map();for(const[r,e]of groups){const c=e.sum.divideScalar(e.count),back=Math.min(...[[3.45,-22.9],[9.55,-22.9],[14.15,-22.7]].map(([x,z])=>(c.x-x)**2+(c.z-z)**2)),banyan=(c.x-22.7)**2+(c.z+12)**2;flags.set(r,c.z<-17.8&&back<banyan);}treeMove=parent.map((_,i)=>flags.get(find(i)));}
  for(let i=0;i<a.count;i++){point.fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld);let rear=false;if(/Folded_Leaves_/.test(o.name))rear=treeMove[i];else {let nearest=null,distance=Infinity;for(const bed of beds){const dx=Math.max(bed.min.x-point.x,0,point.x-bed.max.x),dz=Math.max(bed.min.z-point.z,0,point.z-bed.max.z),d=dx*dx+dz*dz;if(d<distance){distance=d;nearest=bed;}}rear=rearBeds.includes(nearest);}if(rear)point.z-=11.5;point.applyMatrix4(inverse);a.setXYZ(i,point.x,point.y,point.z);}g.computeBoundingBox();g.computeBoundingSphere();o.geometry=g;
 }else if(c.z<-19.9&&/Garden|Lantern|Pier|Balustrade|Baluster|Wood_Railing/.test(o.name))o.position.z-=11.5;
 });map.updateMatrixWorld(true);
}
export function rebuildDinhV12(map,{labelFactory,heritageLines,entranceLines}){
 moveRearGarden(map);map.updateMatrixWorld(true);const original=[];map.traverse(o=>{if(o.isMesh&&/^(?:V15|V17)_Dinh_/.test(o.name))original.push(o);});
 const roof=[],wood=timberMaterial(),stone=original.find(o=>o.name==='V15_Dinh_Foundation')?.material??new T.MeshStandardMaterial({color:'#807e70',roughness:.95});
 const transform=new T.Matrix4().makeTranslation(14.5,3.55,-23.6).multiply(new T.Matrix4().makeScale(31/18.51,.8,1)).multiply(new T.Matrix4().makeTranslation(-9,-5.03,16.2));
 for(const o of original){if(/^V17_Dinh_/.test(o.name)&&!/Pediment|Dragon/.test(o.name)){o.geometry=o.geometry.clone().applyMatrix4(o.matrixWorld).applyMatrix4(transform);o.position.set(0,0,0);o.quaternion.identity();o.scale.set(1,1,1);o.userData.plazaCollision=false;roof.push(o);}else o.removeFromParent();}
 for(const name of ['V3_Dinh_Entrance_Name','V3_Dinh_Heritage'])map.getObjectByName(name)?.removeFromParent();
 const jointMaterial=new T.MeshStandardMaterial({color:'#211911',roughness:1});const root=new T.Group();root.name='V12_Dinh_Reference_Facade';map.add(root);const floors=[],closed=[],columns=[],supports=[];
 function box(name,dims,p,material=wood,collide=true){const o=new T.Mesh(new T.BoxGeometry(...dims),material);o.name=name;o.position.set(...p);o.userData.plazaCollision=collide;root.add(o);return o;}
 const {x,z,width,depth,bays,floor,base}=DINH_V12,bay=DINH_V12.middleBay,grid=DINH_V12.columnXs,front=z+depth/2,back=z-depth/2;
 const platform=box('V12_Dinh_Low_Stone_Platform',[width+.8,base,depth+.8],[x,base/2,z],stone,false);floors.push(platform);
 // The central lower brick/stone aisle remains open; raised boards are on either side.
 for(const side of [-1,1]){const fw=(width-bay)/2,cx=x+side*(bay/2+fw/2),deck=box(`V12_Dinh_Raised_Floor_${side}`,[fw,.11,depth],[cx,floor-.055,z],wood,false);floors.push(deck);
 for(let j=0;j<Math.ceil(fw/.24);j++){const xx=cx-fw/2+(j+.5)*fw/Math.ceil(fw/.24);box(`V12_Dinh_Floor_Joint_${side}_${j}`,[.006,.003,depth],[xx,floor+.001,z],jointMaterial,false);}
 for(const zz of [front-.12,z,back+.12])box('V12_Dinh_Underfloor_Beam',[fw,.12,.18],[cx,.85,zz],wood,false);
 }
 for(let i=0;i<=bays;i++)for(let j=0;j<6;j++){const xx=grid[i],zz=front-j*depth/5;
 box(`V12_Dinh_Stone_Foot_${i}_${j}`,[.49,.11,.49],[xx,base+.055,zz],stone,false);
 const o=new T.Mesh(new T.CylinderGeometry(.15,.185,3.17,12),wood);o.name=`V12_Dinh_Lim_Column_${i}_${j}`;o.position.set(xx,base+.11+3.17/2,zz);o.userData.plazaCollision=true;root.add(o);columns.push(o);supports.push(o);
 }
 for(const zz of [front,back]){box('V12_Dinh_Main_Lintel',[width+.2,.19,.25],[x,3.52,zz]);box('V12_Dinh_Sill_Left',[(width-bay)/2,.16,.19],[x-(width+bay)/4,1.11,zz]);box('V12_Dinh_Sill_Right',[(width-bay)/2,.16,.19],[x+(width+bay)/4,1.11,zz]);}
 for(let i=0;i<bays;i++)if(i!==4){const cell=grid[i+1]-grid[i],cx=(grid[i]+grid[i+1])/2;
 // Four solid door leaves with simple rails, rather than the old carved lattice.
 for(let k=0;k<4;k++){const xx=cx+(k-1.5)*(cell-.36)/4;const leaf=box(`V12_Dinh_Closed_Front_Door_${i}_${k}`,[(cell-.36)/4-.012,2.18,.075],[xx,2.15,front-.06]);closed.push(leaf);for(const yy of [1.26,2.15,3.09])box('V12_Dinh_Door_Rail',[(cell-.36)/4-.018,.045,.025],[xx,yy,front-.011]);}
 }
 for(const side of [-1,1])box('V12_Dinh_Closed_End_Wall',[.12,2.32,depth],[x+side*width/2,2.18,z]);
 for(let i=0;i<bays;i++)box('V12_Dinh_Rear_Wood_Panel',[grid[i+1]-grid[i]-.34,2.18,.08],[(grid[i]+grid[i+1])/2,2.15,back+.02]);
 // Two accessible low entry steps into the lower central aisle.
 for(let i=0;i<2;i++){const top=(i+1)*base/2,o=box(`V12_Dinh_Central_Entry_Step_${i}`,[bay-.4,top,.38],[x,top/2,front+.64-i*.38],stone,false);floors.push(o);}
 // Inside the entrance, short stairs connect the lower aisle to both wooden floors.
 for(const side of [-1,1])for(let i=0;i<4;i++){const top=base+(i+1)*(floor-base)/4,xx=x+side*(bay/2-1.1333333333+i*.28),o=box(`V12_Dinh_Inside_Floor_Step_${side}_${i}`,[i===3?.60:.29,top-base,1.5],[xx,(top+base)/2,back+3.0],wood,false);floors.push(o);}
 function label(name,lines,w,h,p){const o=new T.Mesh(new T.PlaneGeometry(w,h),labelFactory(lines,{heritage:true,background:'#271b13',color:'#dbc18b'}));o.name=name;o.position.set(...p);o.userData.plazaCollision=false;root.add(o);return o;}
 const entrance=label('V3_Dinh_Entrance_Name',entranceLines,3.65,.44,[x,3.48,front+.15]);
 const heritage=label('V3_Dinh_Heritage',heritageLines,3.2,.60,[x,3.07,back+.30]);
 map.updateMatrixWorld(true);const used=new Set();map.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])used.add(m.name);});const retiredMaterials=[...new Set(original.flatMap(o=>(Array.isArray(o.material)?o.material:[o.material]).map(m=>m.name)))].filter(n=>!used.has(n));return{retiredMaterials,roof,root,floors,closed,columns,supports,platform,entrance,heritage,dimensions:DINH_V12};
}

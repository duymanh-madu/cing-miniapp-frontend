import * as T from 'three';
const EMPTY_BEDS=['V15_Garden_Planter_Dark_Soil010','V15_Garden_Planter_Dark_Soil011','V15_Garden_Planter_Dark_Soil012','V17_Garden_Planter_Soil004','V17_Garden_Planter_Soil005'];
const PLANTS=/^(?:V15_Garden_Individual_Folded_Foliage_|V15_Hundreds_Of_Ivory_Flowers_|V15_Flower_Stems$|V17_Garden_New_(?:Foliage|Flowers)_)/;
function clearForecourt(map,cleanup){
 map.updateMatrixWorld(true);const beds=EMPTY_BEDS.map(n=>new T.Box3().setFromObject(map.getObjectByName(n))),parts=[],plants=[];
 map.traverse(o=>{if(!o.isMesh)return;
 if(/^V15_Garden_Planter_/.test(o.name)&&/(010|011|012)$/.test(o.name)||/^V17_Garden_(?:Planter_Soil|Stone_Planter)(004|005)$/.test(o.name))parts.push(o);
 else if(PLANTS.test(o.name))plants.push(o);
 });parts.forEach(o=>o.removeFromParent());let removedTriangles=0;const point=new T.Vector3();
 for(const o of plants){const src=o.geometry,a=src.attributes.position,idx=src.index,ids=[];for(let i=0;i<(idx?.count??a.count);i+=3){const tri=[0,1,2].map(j=>idx?idx.getX(i+j):i+j);let x=0,z=0;for(const id of tri){point.fromBufferAttribute(a,id).applyMatrix4(o.matrixWorld);x+=point.x/3;z+=point.z/3;}if(beds.some(b=>x>=b.min.x-.24&&x<=b.max.x+.24&&z>=b.min.z-.24&&z<=b.max.z+.24))removedTriangles++;else ids.push(...tri);}
 if(ids.length===(idx?.count??a.count))continue;if(!ids.length){o.removeFromParent();continue;}const g=new T.BufferGeometry();for(const[name,attr]of Object.entries(src.attributes)){const data=new attr.array.constructor(ids.length*attr.itemSize);ids.forEach((id,i)=>{for(let k=0;k<attr.itemSize;k++)data[i*attr.itemSize+k]=attr.array[id*attr.itemSize+k];});g.setAttribute(name,new T.BufferAttribute(data,attr.itemSize,attr.normalized));}g.computeBoundingBox();g.computeBoundingSphere();o.geometry=g;
 }
 cleanup.keptTriangles-=removedTriangles;cleanup.removedTriangles+=removedTriangles;cleanup.beds-=beds.length;return{beds,parts,removedTriangles};
}
function ribbon(points,width,height){const p=[],idx=[];for(let i=0;i<points.length;i++){const tangent=points[Math.min(i+1,points.length-1)].clone().sub(points[Math.max(i-1,0)]),normal=new T.Vector3(-tangent.z,0,tangent.x).normalize();for(const[side,up]of [[-1,-1],[1,-1],[1,1],[-1,1]]){const v=points[i].clone().addScaledVector(normal,side*width/2);v.y+=up*height/2;p.push(...v.toArray());}if(i){const a=(i-1)*4,b=i*4;for(let j=0;j<4;j++){const k=(j+1)%4;idx.push(a+j,b+j,b+k,a+j,b+k,a+k);}}}idx.push(0,2,1,0,3,2);const a=(points.length-1)*4;idx.push(a,a+1,a+2,a,a+2,a+3);const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(idx);g.computeVertexNormals();return g;}
export function finishHeritageV13(map,dinh,cleanup){
 const cleared=clearForecourt(map,cleanup),root=new T.Group();root.name='V13_Dinh_Joinery_And_Bronze';map.add(root);const wood=dinh.columns[0].material,stone=dinh.platform.material,rims=[],ties=[],rafters=[],braces=[];
 const trim=new T.MeshStandardMaterial({color:'#aaa18b',roughness:.92}),trimShade=new T.MeshStandardMaterial({color:'#7b7567',roughness:.98});trim.name='V13_Weathered_Roof_Stone';trimShade.name='V13_Roof_Recess_Shade';
 function mesh(name,g,material=wood){const o=new T.Mesh(g,material);o.name=name;o.userData.plazaCollision=false;root.add(o);return o;}
 function beam(name,a,b,w=.20,h=.22){const delta=b.clone().sub(a),o=mesh(name,new T.BoxGeometry(w,delta.length()+.06,h));o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return o;}
 map.updateMatrixWorld(true);
 // Follow the original swept ridge centreline rather than changing the approved roof silhouette.
 for(const o of dinh.roof.filter(o=>/Ceramic_Main_Ridge|Diagonal_Ceramic_Hip_Ridge/.test(o.name))){const g=o.geometry,a=g.attributes.position,b=new T.Box3().setFromObject(o),axis=b.getSize(new T.Vector3()).x>b.getSize(new T.Vector3()).z?'x':'z',min=b.min[axis],span=b.max[axis]-min,buckets=Array.from({length:50},()=>({sum:new T.Vector3(),n:0}));for(let i=0;i<a.count;i++){const v=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld),j=Math.min(49,Math.floor((v[axis]-min)/span*50));buckets[j].sum.add(v);buckets[j].n++;}const points=buckets.filter(b=>b.n).map(b=>b.sum.divideScalar(b.n)),curve=new T.CatmullRomCurve3(points),line=curve.getPoints(96);
 for(const[level,width,height,offset,mat]of [[0,.32,.14,.07,trimShade],[1,.29,.09,.18,trim],[2,.22,.075,.265,trim]]){const pts=line.map(p=>p.clone().add(new T.Vector3(0,offset,0)));rims.push(mesh(`V13_Roof_Layered_Ridge_${o.name}_${level}`,ribbon(pts,width,height),mat));}
 }
 const ray=new T.Raycaster(),{x,z,width,depth,bays}=dinh.dimensions,front=z+depth/2,back=z-depth/2,bay=width/bays;
 const roofHeight=(xx,zz)=>{ray.set(new T.Vector3(xx,15,zz),new T.Vector3(0,-1,0));const hit=ray.intersectObjects(dinh.roof,false)[0];return hit?hit.point.y-.22:3.65;};
 // Every column meets a longitudinal tie and a complete transverse roof frame.
 for(let j=0;j<6;j++){const zz=front-j*depth/5;ties.push(beam(`V13_Longitudinal_Tie_${j}`,new T.Vector3(x-width/2,3.52,zz),new T.Vector3(x+width/2,3.52,zz),.24,.24));}
 for(let i=0;i<=bays;i++){const xx=dinh.dimensions.columnXs[i];ties.push(beam(`V13_Transverse_Tie_${i}`,new T.Vector3(xx,3.52,front),new T.Vector3(xx,3.52,back),.24,.24));
 const tops=[];for(let j=0;j<6;j++){const zz=front-j*depth/5,top=Math.max(3.52,roofHeight(xx,zz)),column=dinh.columns.find(o=>o.name===`V12_Dinh_Lim_Column_${i}_${j}`),bottom=.35;column.geometry=new T.CylinderGeometry(.15,.185,top-bottom,12);column.position.y=(top+bottom)/2;tops.push(new T.Vector3(xx,top,zz));
 const cap=mesh(`V13_Column_Head_${i}_${j}`,new T.BoxGeometry(.29,.16,.35));cap.position.copy(tops.at(-1));
 if(j>0&&j<5){braces.push(beam(`V13_Knee_Brace_${i}_${j}_L`,new T.Vector3(xx,3.06,zz),new T.Vector3(xx-.55,3.52,zz),.12,.14));braces.push(beam(`V13_Knee_Brace_${i}_${j}_R`,new T.Vector3(xx,3.06,zz),new T.Vector3(xx+.55,3.52,zz),.12,.14));}
 }
 for(let j=0;j<5;j++)rafters.push(beam(`V13_Transverse_Rafter_${i}_${j}`,tops[j],tops[j+1],.18,.21));
 // Short stacked beams link inner main columns below the roof ridge.
 for(const [a,b,drop]of [[1,4,.34],[2,3,.12]]){const y=Math.min(tops[a].y,tops[b].y)-drop;rafters.push(beam(`V13_Stacked_Ruong_${i}_${a}`,new T.Vector3(xx,y,tops[a].z),new T.Vector3(xx,y,tops[b].z),.21,.25));}
 }
 const bronze=new T.MeshStandardMaterial({color:'#766343',metalness:.83,roughness:.48});bronze.name='V13_Patinated_Bronze';const dark=new T.MeshStandardMaterial({color:'#263d33',metalness:.65,roughness:.69});dark.name='V13_Bronze_Patina';
 const urn=new T.Group();urn.name='V13_Reference_Bronze_Censer';urn.position.set(x,.036,front+3.35);root.add(urn);
 function addUrn(name,g,mat=bronze,pos=[0,0,0]){const o=new T.Mesh(g,mat);o.name=name;o.position.set(...pos);o.userData.plazaCollision=false;urn.add(o);return o;}
 const foot=addUrn('V13_Censer_Stone_Plinth',new T.BoxGeometry(1.12,.09,1.12),stone,[0,.045,0]);
 const profile=[[.24,.33],[.38,.37],[.46,.49],[.49,.68],[.46,.86],[.43,.91],[.52,.94],[.52,.99],[.43,.99],[.40,.91],[.38,.71],[.24,.48]].map(([r,y])=>new T.Vector2(r,y));addUrn('V13_Censer_Hollow_Bronze_Bowl',new T.LatheGeometry(profile,64));
 for(let i=0;i<3;i++){const a=-Math.PI/2+i*Math.PI*2/3,xx=Math.cos(a),zz=Math.sin(a),curve=new T.CatmullRomCurve3([new T.Vector3(xx*.32,.42,zz*.32),new T.Vector3(xx*.43,.28,zz*.43),new T.Vector3(xx*.34,.16,zz*.34),new T.Vector3(xx*.46,.10,zz*.46)]);addUrn(`V13_Censer_Leg_${i}`,new T.TubeGeometry(curve,16,.075,10,false));addUrn(`V13_Censer_Foot_${i}`,new T.SphereGeometry(.09,12,8),bronze,[xx*.46,.13,zz*.46]);}
 for(const sign of [-1,1]){const curve=new T.CatmullRomCurve3([new T.Vector3(sign*.42,.73,0),new T.Vector3(sign*.65,.86,0),new T.Vector3(sign*.67,1.14,0),new T.Vector3(sign*.54,1.19,0),new T.Vector3(sign*.48,1.05,0)]);addUrn(`V13_Censer_Scroll_Handle_${sign}`,new T.TubeGeometry(curve,32,.045,10,false));}
 for(const y of [.40,.52,.90,.99]){const ring=addUrn('V13_Censer_Cast_Band',new T.TorusGeometry(y<.6?.37:.485,.017,8,64),y===.52?dark:bronze,[0,y,0]);ring.rotation.x=Math.PI/2;}
 for(let i=0;i<16;i++){const a=i*Math.PI/8,o=addUrn('V13_Censer_Relief_Motif',new T.TorusGeometry(.048,.013,6,12),i%3===0?dark:bronze,[Math.cos(a)*.479,.70,Math.sin(a)*.479]);o.rotation.y=Math.PI/2-a;}
 addUrn('V13_Censer_Ash',new T.CylinderGeometry(.40,.40,.025,48),new T.MeshStandardMaterial({color:'#81796b',roughness:1}),[0,.905,0]);
 for(let i=0;i<9;i++)addUrn('V13_Censer_Incense_Stick',new T.CylinderGeometry(.003,.003,.19+(i%3)*.035,5),new T.MeshStandardMaterial({color:'#642e20',roughness:.85}),[(i%3-1)*.085,1.02+(i%3)*.017, (Math.floor(i/3)-1)*.085]);
 map.updateMatrixWorld(true);return{root,cleared,rims,ties,rafters,braces,urn,obstacle:{minX:x-.72,maxX:x+.72,minZ:urn.position.z-.60,maxZ:urn.position.z+.60,minY:.036,maxY:1.30}};
}

import * as T from 'three';
// Rotate the entire cafe tree and its disconnected leaf triangles together.
export function improveCafeTreeV15(map,sources){
 map.updateMatrixWorld(true);const root=new T.Group();root.name='V15_Cafe_Outward_Canopy';map.add(root);const pivot=new T.Vector3(-13.5,.04,-2),rotation=new T.Matrix4().makeTranslation(...pivot.toArray()).multiply(new T.Matrix4().makeRotationY(Math.PI)).multiply(new T.Matrix4().makeTranslation(...pivot.clone().negate().toArray()));
 const leaves=[];let maxX=-Infinity;const v=new T.Vector3();
 for(const source of sources){const g=source.geometry.index?source.geometry.toNonIndexed():source.geometry.clone(),a=g.attributes.position,ids=[];for(let i=0;i<a.count;i+=3){const x=(a.getX(i)+a.getX(i+1)+a.getX(i+2))/3,z=(a.getZ(i)+a.getZ(i+1)+a.getZ(i+2))/3;if(x<-8&&z>-8){ids.push(i,i+1,i+2);for(let j=0;j<3;j++){v.fromBufferAttribute(a,i+j).applyMatrix4(rotation);maxX=Math.max(maxX,v.x);}}}leaves.push({source,g,ids});}
 // Clearance reserves room for both added canopy tiers beyond the cream wall.
 const dx=Math.min(-1.3,-13.5-maxX),transform=new T.Matrix4().makeTranslation(dx,0,-.8).multiply(rotation),branches=[];
 map.traverse(o=>{if(o.isMesh&&/^V15_Cafe_Shade_(Trunk|Branch)/.test(o.name))branches.push(o);});
 for(const o of branches){o.geometry=o.geometry.clone().applyMatrix4(o.matrixWorld).applyMatrix4(transform);o.position.set(0,0,0);o.quaternion.identity();o.scale.set(1,1,1);}
 const added=[];let addedTriangles=0;
 for(const{source,g,ids}of leaves){const a=source.geometry.attributes.position,n=source.geometry.attributes.normal,nm=new T.Matrix3().getNormalMatrix(transform);for(let i=0;i<a.count;i++)if(a.getX(i)<-8&&a.getZ(i)>-8){v.fromBufferAttribute(a,i).applyMatrix4(transform);a.setXYZ(i,v.x,v.y,v.z);if(n){v.fromBufferAttribute(n,i).applyMatrix3(nm).normalize();n.setXYZ(i,v.x,v.y,v.z);}}a.needsUpdate=true;if(n)n.needsUpdate=true;source.geometry.computeBoundingBox();source.geometry.computeBoundingSphere();
  const selected=new T.BufferGeometry();for(const[name,attr]of Object.entries(g.attributes)){const data=new attr.array.constructor(ids.length*attr.itemSize);ids.forEach((id,i)=>{for(let k=0;k<attr.itemSize;k++)data[i*attr.itemSize+k]=attr.array[id*attr.itemSize+k];});selected.setAttribute(name,new T.BufferAttribute(data,attr.itemSize,attr.normalized));}selected.applyMatrix4(transform);selected.computeBoundingBox();const centre=selected.boundingBox.getCenter(new T.Vector3());
  for(const [angle,scale,up]of [[.42,.88,-.65],[-.37,.84,.42]]){const matrix=new T.Matrix4().makeTranslation(centre.x-.35,centre.y+up,centre.z).multiply(new T.Matrix4().makeRotationY(angle)).multiply(new T.Matrix4().makeScale(scale,scale,scale)).multiply(new T.Matrix4().makeTranslation(...centre.clone().negate().toArray()));const geometry=selected.clone().applyMatrix4(matrix);geometry.computeBoundingBox();if(geometry.boundingBox.max.x>-12.45)geometry.translate(-12.45-geometry.boundingBox.max.x,0,0);const o=new T.Mesh(geometry,source.material);o.name='V15_Cafe_Extra_Folded_Leaves';o.userData.plazaCollision=false;root.add(o);added.push(o);addedTriangles+=ids.length/3;}
  g.dispose();selected.dispose();
 }
 // Rebuild every bough from the actual transformed trunk cross-section.
 const base=new T.Vector3(-13.5,.04,-2).applyMatrix4(transform),trunk=branches.find(o=>/Trunk/.test(o.name)),bark=trunk?.material,joins=[];
 function section(geometry,y){const a=geometry.attributes.position,index=geometry.index,points=[];for(let i=0;i<(index?.count??a.count);i+=3){const tri=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(a,index?index.getX(i+j):i+j));for(let j=0;j<3;j++){const u=tri[j],v=tri[(j+1)%3];if((u.y-y)*(v.y-y)<=0&&Math.abs(v.y-u.y)>1e-8)points.push(u.clone().lerp(v,(y-u.y)/(v.y-u.y)));}}if(!points.length)throw Error('Missing trunk section');return new T.Box3().setFromPoints(points).getCenter(new T.Vector3());}
 const old=branches.filter(o=>o!==trunk),tips=old.map(o=>{o.geometry.computeBoundingBox();return section(o.geometry,o.geometry.boundingBox.max.y-.02);});old.forEach(o=>o.removeFromParent());branches.splice(0,branches.length,trunk);
 for(let i=0;i<5;i++)tips.push(new T.Vector3(base.x-.8,7.6+i*.1,base.z+(i%2?1:-1)*1.35));
 for(const [i,tip]of tips.entries()){const y=4.9+(i%7)*.23,start=section(trunk.geometry,y),mid=start.clone().lerp(tip,.55);mid.y+=.23;const curve=new T.CatmullRomCurve3([start,mid,tip]),geometry=new T.TubeGeometry(curve,24,.17,10,false),a=geometry.attributes.position;
  for(let row=0;row<=24;row++){const t=row/24,c=curve.getPointAt(t),scale=1-.83*t;for(let j=0;j<=10;j++){const k=row*11+j,v=new T.Vector3().fromBufferAttribute(a,k).sub(c).multiplyScalar(scale).add(c);a.setXYZ(k,v.x,v.y,v.z);}}geometry.computeVertexNormals();
  const o=new T.Mesh(geometry,bark);o.name=i<old.length?'V16_Cafe_Joined_Original_Bough':'V15_Cafe_Extra_Bough';o.userData.plazaCollision=false;root.add(o);branches.push(o);joins.push({start,tip,trunk,bough:o});
 }
 map.updateMatrixWorld(true);return{root,added,branches,joins,addedTriangles,base,transform,clearanceX:-12.45};
}

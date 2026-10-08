import * as T from 'three';
// A reference-based altar ensemble; kept behind the stairs and off the walking aisle.
export function finishSanctuaryV14(map,dinh){
 const root=new T.Group();root.name='V14_Dinh_Altar_Ensemble';map.add(root);const wood=dinh.columns[0].material,bronze=new T.MeshStandardMaterial({color:'#95805a',metalness:.72,roughness:.58}),red=new T.MeshStandardMaterial({color:'#582821',roughness:.78}),porcelain=new T.MeshStandardMaterial({color:'#e5e5d6',roughness:.3}),blue=new T.MeshStandardMaterial({color:'#214770',roughness:.4});
 const {x,z,depth}=dinh.dimensions,back=z-depth/2,obstacles=[],nightMaterials=[],lampAnchors=[],cranes=[],screens=[];
 function mesh(name,g,mat,p,parent=root){const o=new T.Mesh(g,mat);o.name=name;o.position.set(...p);o.userData.plazaCollision=false;parent.add(o);return o;}
 function box(n,d,p,m=wood,parent=root){return mesh(n,new T.BoxGeometry(...d),m,p,parent);}
 function tube(n,pts,r,m=bronze,parent=root){return mesh(n,new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(...p))),32,r,8,false),m,[0,0,0],parent);}
 function obstacle(cx,cz,w,d,top){obstacles.push({minX:cx-w/2,maxX:cx+w/2,minZ:cz-d/2,maxZ:cz+d/2,minY:.24,maxY:top});}
 const table=new T.Group();table.name='V14_Altar_Table';table.position.set(x,.24,back+.72);root.add(table);
 box('V14_Altar_Top',[2.32,.13,.82],[0,1.13,0],wood,table);box('V14_Altar_Apron',[2.18,.32,.08],[0,.91,.37],red,table);
 for(const sx of [-1,1])for(const sz of [-1,1])box('V14_Altar_Leg',[.12,1.06,.12],[sx*1.02,.53,sz*.29],wood,table);
 for(const sx of [-1,1]){box('V14_Altar_Gold_Frame',[.045,.28,.03],[sx*1.03,.91,.418],bronze,table);box('V14_Altar_Crossrail',[.08,.10,.6],[sx*1.02,.30,0],wood,table);}
 for(const yy of [.77,1.05])box('V14_Altar_Gold_Frame',[2.1,.025,.03],[0,yy,.418],bronze,table);
 for(let i=0;i<3;i++){const ornament=mesh('V14_Altar_Medallion',new T.TorusGeometry(.095,.013,6,20),bronze,[(i-1)*.63,.91,.43],table);ornament.scale.y=.75;}
 mesh('V14_Altar_Censer',new T.LatheGeometry([[.14,1.2],[.22,1.25],[.24,1.42],[.26,1.46],[.20,1.46],[.18,1.30]].map(p=>new T.Vector2(...p)),32),bronze,[0,0,.03],table);
 for(const sx of [-1,1]){
  mesh('V14_Porcelain_Vase',new T.LatheGeometry([[.1,1.2],[.16,1.3],[.19,1.48],[.12,1.63],[.105,1.73]].map(p=>new T.Vector2(...p)),24),porcelain,[sx*.82,0,0],table);
  for(const yy of [1.31,1.5]){const ring=mesh('V14_Vase_Blue_Band',new T.TorusGeometry(yy===1.31?.16:.18,.016,6,24),blue,[sx*.82,yy,0],table);ring.rotation.x=Math.PI/2;}
  for(let i=0;i<5;i++)tube('V14_Altar_Flower_Stem',[[sx*.82,1.68,0],[sx*.82+(i-2)*.04,2.03,-.03],[sx*.82+(i-2)*.08,2.27,-.02]],.007,new T.MeshStandardMaterial({color:'#567042'}),table);
 }
 obstacle(x,table.position.z,2.4,.88,2.65);
 for(const side of [-1,1]){
  const bird=new T.Group();bird.name=`V14_Crane_${side}`;bird.position.set(x+side*1.77,.24,back+1.12);root.add(bird);cranes.push(bird);
  mesh('V14_Crane_Pedestal',new T.CylinderGeometry(.32,.37,.1,24),bronze,[0,.05,0],bird);
  const turtle=mesh('V14_Crane_Turtle',new T.SphereGeometry(1,20,12),bronze,[0,.17,0],bird);turtle.scale.set(.3,.13,.24);
  for(const sx of [-1,1])tube('V14_Crane_Leg',[[sx*.055,.22,0],[sx*.055,.63,0],[sx*.055,.92,-.02]],.023,bronze,bird);
  const body=mesh('V14_Crane_Body',new T.SphereGeometry(1,24,16),bronze,[0,1.15,-.045],bird);body.scale.set(.19,.28,.3);
  const wing=mesh('V14_Crane_Wing',new T.SphereGeometry(1,20,12),bronze,[side*.15,1.16,-.08],bird);wing.scale.set(.06,.21,.26);
  tube('V14_Crane_Neck',[[0,1.31,.1],[0,1.51,.14],[0,1.80,.04],[0,2.02,.10],[0,2.1,.20]],.049,bronze,bird);
  mesh('V14_Crane_Head',new T.SphereGeometry(.075,16,10),bronze,[0,2.1,.22],bird);
  const beak=mesh('V14_Crane_Beak',new T.ConeGeometry(.026,.22,10),bronze,[0,2.075,.37],bird);beak.rotation.x=Math.PI/2;
  for(const sx of [-1,1])mesh('V14_Crane_Eye',new T.SphereGeometry(.013,8,6),new T.MeshStandardMaterial({color:'#17150f'}),[sx*.063,2.12,.25],bird);
  for(let i=0;i<7;i++)tube('V14_Crane_Feather',[[side*.184,1.29-i*.025,.06],[side*.20,1.16-i*.026,-.13],[side*.17,1.06-i*.017,-.28]],.009,bronze,bird);
  obstacle(bird.position.x,bird.position.z,.72,.72,2.42);
  const screen=new T.Group();screen.name=`V14_Screen_${side}`;screen.position.set(x+side*2.55,1.02,back+.46);root.add(screen);screens.push(screen);
  box('V14_Screen_Panel',[.72,1.64,.095],[0,1.03,0],wood,screen);
  for(const xx of [-.40,.40])box('V14_Screen_Post',[.085,2.17,.16],[xx,1.085,.04],red,screen);
  for(const yy of [.21,1.85])box('V14_Screen_Rail',[.88,.10,.16],[0,yy,.04],red,screen);
  for(const xx of [-.30,.30])box('V14_Screen_Inlay',[.025,1.42,.02],[xx,1.03,.064],bronze,screen);
  for(const yy of [.33,1.73])box('V14_Screen_Inlay',[.62,.025,.02],[0,yy,.064],bronze,screen);
  for(const xx of [-.4,.4])box('V14_Screen_Foot',[.20,.12,.52],[xx,.06,0],wood,screen);
  obstacle(screen.position.x,screen.position.z,.95,.56,3.2);
 }
 // Restore missing lanterns from the nearest intact original, preserving the map's design.
 map.updateMatrixWorld(true);const piers=[],lanterns=[];map.traverse(o=>{if(!o.isMesh)return;if(/Stone_Balustrade_Pier/.test(o.name))piers.push(o);if(/Lantern_/.test(o.name))lanterns.push(o);});const restored=[];
 for(const pier of piers){const b=new T.Box3().setFromObject(pier),c=b.getCenter(new T.Vector3());if(lanterns.some(o=>{const q=new T.Box3().setFromObject(o).getCenter(new T.Vector3());return Math.hypot(q.x-c.x,q.z-c.z)<.35;}))continue;
  const nearest=lanterns.map(o=>({o,c:new T.Box3().setFromObject(o).getCenter(new T.Vector3())})).sort((a,b)=>Math.hypot(a.c.x-c.x,a.c.z-c.z)-Math.hypot(b.c.x-c.x,b.c.z-c.z))[0];if(!nearest)continue;const sourceX=nearest.c.x,sourceZ=nearest.c.z;
  for(const original of lanterns){const q=new T.Box3().setFromObject(original).getCenter(new T.Vector3());if(Math.hypot(q.x-sourceX,q.z-sourceZ)>.3)continue;const copy=original.clone();copy.geometry=original.geometry.clone().applyMatrix4(original.matrixWorld);copy.position.set(c.x-sourceX,0,c.z-sourceZ);copy.quaternion.identity();copy.scale.set(1,1,1);copy.name='V14_Restored_'+original.name;copy.userData.plazaCollision=false;root.add(copy);restored.push(copy);if(copy.material.emissive)nightMaterials.push(copy.material);}
  lampAnchors.push(new T.Vector3(c.x,b.max.y+.30,c.z));
 }
 map.updateMatrixWorld(true);return{root,table,cranes,screens,obstacles,restored,nightMaterials,lampAnchors};
}

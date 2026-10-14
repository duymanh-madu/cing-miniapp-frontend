import * as T from 'three';import {worldGeometry} from './batchPlazaMapV1.js';
export const protectedPlazaDetail=name=>/Chair_|Table_|Tea_Cup|Checkin|Check_In|Logo|Plaque|Sign|Stage_Name|Letters|Text/.test(name);
export const plazaFoliageName=name=>/Folded_Leaves|Layered_Leaves|Garden_New_(Foliage|Flowers)|Hundreds_Of_Ivory_Flowers/.test(name);

export function applyMobileFoliagePack(root,manifest,buffer){
 const entries=new Map(manifest.meshes.map(e=>[e.name,e])),old=new Set();let trianglesBefore=0,trianglesAfter=0,matched=0;
 root.traverse(o=>{const e=entries.get(o.name);if(!o.isMesh||!e)return;
  const g=new T.BufferGeometry();for(const [name,itemSize] of [['position',3],['normal',3],['uv',2]]){const a=e[name];if(a.offset%4||a.offset+a.bytes>buffer.byteLength)throw Error('INVALID_FOLIAGE_BUFFER');g.setAttribute(name,new T.BufferAttribute(new Float32Array(buffer,a.offset,a.count),itemSize));}
  const index=e.index;g.setIndex(new T.BufferAttribute(new Uint32Array(buffer,index.offset,index.count),1));g.computeBoundingBox();g.computeBoundingSphere();
  trianglesBefore+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;trianglesAfter+=index.count/3;old.add(o.geometry);o.geometry=g;matched++;
 });
 const used=new Set();root.traverse(o=>{if(o.geometry)used.add(o.geometry);});for(const g of old)if(!used.has(g))g.dispose();
 if(matched!==entries.size)throw Error('FOLIAGE_PACK_SOURCE_MISMATCH');return {matched,trianglesBefore,trianglesAfter};
}

export function splitFoliageSpatially(root,cellSize=6){
 root.updateMatrixWorld(true);const targets=[];root.traverse(o=>{if(o.isMesh&&plazaFoliageName(o.name)&&!protectedPlazaDetail(o.name)&&!o.isInstancedMesh&&!o.isSkinnedMesh&&o.visible)targets.push(o);});
 const inverse=root.matrixWorld.clone().invert(),matrix=new T.Matrix4(),retired=new Set();let before=0,after=0,chunks=0;
 for(const source of targets){
  const geometry=worldGeometry(source,matrix.multiplyMatrices(inverse,source.matrixWorld)),p=geometry.attributes.position,index=geometry.index,count=index?.count??p.count;
  const cells=new Map();for(let i=0;i<count;i+=3){const ids=[0,1,2].map(j=>index?index.getX(i+j):i+j);const x=ids.reduce((n,id)=>n+p.getX(id)/3,0),z=ids.reduce((n,id)=>n+p.getZ(id)/3,0),key=`${Math.floor(x/cellSize)}:${Math.floor(z/cellSize)}`;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(...ids);}
  before+=count/3;
  for(const ids of cells.values()){
   const compact=new Map(),indices=[];for(const id of ids){if(!compact.has(id))compact.set(id,compact.size);indices.push(compact.get(id));}
   const g=new T.BufferGeometry();for(const [name,a] of Object.entries(geometry.attributes)){const array=new a.array.constructor(compact.size*a.itemSize);for(const [old,id] of compact)for(let c=0;c<a.itemSize;c++)array[id*a.itemSize+c]=a.array[old*a.itemSize+c];g.setAttribute(name,new T.BufferAttribute(array,a.itemSize,a.normalized));}g.setIndex(indices);g.computeBoundingBox();g.computeBoundingSphere();
   const mesh=new T.Mesh(g,source.material);mesh.name='Mobile_Foliage_'+source.name;mesh.userData={...source.userData,plazaCollision:false,mobileFoliage:true};mesh.layers.mask=source.layers.mask;mesh.castShadow=source.castShadow;mesh.receiveShadow=source.receiveShadow;mesh.renderOrder=source.renderOrder;root.add(mesh);chunks++;after+=ids.length/3;
  }
  source.removeFromParent();retired.add(source.geometry);geometry.dispose();
 }
 const used=new Set();root.traverse(o=>{if(o.geometry)used.add(o.geometry);});for(const g of retired)if(!used.has(g))g.dispose();
 return {sourceMeshes:targets.length,chunks,trianglesBefore:before,trianglesAfter:after};
}

export function removeBackgroundRefraction(root){
 const clones=new Map();let changed=0;root.traverse(o=>{
  if(!o.isMesh||protectedPlazaDetail(o.name)||!(/Lantern.*Glass|Pond.*Water|Visible_Pond_Water/.test(o.name)))return;
  const convert=m=>{if(!(m.transmission>0))return m;if(!clones.has(m)){const clone=m.clone();clone.onBeforeCompile=m.onBeforeCompile;clone.customProgramCacheKey=m.customProgramCacheKey;clone.transmission=0;clone.needsUpdate=true;clones.set(m,clone);}changed++;return clones.get(m);};
  o.material=Array.isArray(o.material)?o.material.map(convert):convert(o.material);
 });return {meshesChanged:changed,materialsChanged:clones.size,replacements:clones};
}

// Background pigments use the authored ramp at the mean noise value. Fine
// procedural bump/noise is removed only from scenery, never hero furniture.
export function representativePlazaSurface(definition){
 const nodes=new Map(definition.nodes.map(n=>[n.name,n])),links=new Map(definition.links.map(l=>[`${l.to}:${l.input}`,l])),cache=new Map();
 const vec=v=>Array.isArray(v)?v.slice(0,3):[v,v,v],scalar=v=>Array.isArray(v)?v[0]*.2126+v[1]*.7152+v[2]*.0722:v;
 function input(n,id){const link=links.get(`${n.name}:${id}`);return link?output(link.from,link.output):n.inputs.find(i=>i.id===id)?.value;}
 function output(name,socket){const key=`${name}:${socket}`;if(cache.has(key))return cache.get(key);const n=nodes.get(name);let value;
  if(n.type==='ShaderNodeTexNoise'&&socket==='Fac')value=.5;
  else if(n.type==='ShaderNodeNewGeometry')value=[0,0,0];
  else if(n.type==='ShaderNodeValToRGB'){const x=scalar(input(n,'Fac')),r=n.ramp.elements;value=r[0].color.slice(0,3);for(let i=1;i<r.length;i++){const a=r[i-1],b=r[i];if(x>=b.position){value=b.color.slice(0,3);continue;}if(x>a.position){const t=(x-a.position)/(b.position-a.position);value=a.color.slice(0,3).map((v,k)=>v+(b.color[k]-v)*t);}break;}}
  else if(n.type==='ShaderNodeMixRGB'&&n.properties.blend_type==='MULTIPLY'){const f=scalar(input(n,'Fac')),a=vec(input(n,'Color1')),b=vec(input(n,'Color2'));value=a.map((v,i)=>v*(1-f)+v*b[i]*f);}
  else if(n.type==='ShaderNodeVectorMath'&&n.properties.operation==='MULTIPLY'){const a=vec(input(n,'Vector')),b=vec(input(n,'Vector_001'));value=a.map((v,i)=>v*b[i]);}
  else throw Error('UNSUPPORTED_REPRESENTATIVE_MATERIAL');cache.set(key,value);return value;
 }
 const node=definition.nodes.find(n=>n.type==='ShaderNodeBsdfPrincipled'),color=vec(input(node,'Base Color')),roughness=scalar(input(node,'Roughness'));
 if(!color.every(Number.isFinite)||!Number.isFinite(roughness))throw Error('INVALID_REPRESENTATIVE_MATERIAL');return {color,roughness};
}

export function simplifyBackgroundMaterials(root,data){
 const definitions=new Map(data.materials.map(m=>[m.name,m])),clones=new Map();let changed=0,procedural=0;
 root.traverse(o=>{if(!o.isMesh||o.isSkinnedMesh||protectedPlazaDetail(o.name))return;
  const convert=m=>{if(!m.isMeshPhysicalMaterial&&!definitions.has(m.name))return m;
   if(!clones.has(m)){let surface=null;const def=definitions.get(m.name);if(def){try{surface=representativePlazaSurface(def);}catch{return m;}}
    const copy=new T.MeshStandardMaterial().copy(m);if(surface){copy.color.setRGB(...surface.color);copy.roughness=surface.roughness;procedural++;}copy.needsUpdate=true;clones.set(m,copy);
   }changed++;return clones.get(m);};
  o.material=Array.isArray(o.material)?o.material.map(convert):convert(o.material);
 });return {meshesChanged:changed,materialsChanged:clones.size,proceduralMaterials:procedural,replacements:clones};
}

export function auditPlazaGeometry(root){
 const rows=[];root.updateMatrixWorld(true);root.traverse(o=>{if(!o.isMesh)return;let visible=true;for(let p=o;p;p=p.parent)visible&&=p.visible;if(!visible)return;
  const g=o.geometry,mats=Array.isArray(o.material)?o.material:[o.material],instances=o.isInstancedMesh?o.count:1;
  rows.push({name:o.name,triangles:(g.index?.count??g.attributes.position.count)/3*instances,instances,materials:mats.map(m=>m.name),transmission:mats.some(m=>m.transmission>0),protected:protectedPlazaDetail(o.name)});
 });rows.sort((a,b)=>b.triangles-a.triangles);return {meshCount:rows.length,triangles:rows.reduce((n,o)=>n+o.triangles,0),refractiveMeshes:rows.filter(r=>r.transmission).length,rows};
}

import {improveCafeTreeV15} from './plazaCafeTreeV15.js';
import {finishSanctuaryV14} from './plazaSanctuaryV14.js';
import {finishHeritageV13} from './plazaHeritageV13.js';
import {rebuildDinhV12} from './plazaDinhV12.js';
import {relocateGardenV11,LAYOUT_V11} from './plazaLayoutV11.js';
import {repairGardenV10} from './plazaGardenV10.js';
import * as THREE from 'three';
import { repairGardenFenceV9 } from './plazaFenceV9.js';
import { cleanCourtyardV8 } from './plazaCleanupV8.js';
import { rebuildGroundV7, closePondV7 } from './plazaGroundV7.js';
import { refineEntranceV6 } from './plazaEntranceV6.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const PLAZA_FLOOR_NAME = /(?:^Courtyard_Ground$|^Cafe_Floor_Ground$|^V17_Ground_Extension|^V15_Dinh_Entry_Step|^V15_Dinh_Wood_Floorboards$|^V15_Dinh_Platform_Cap$|^V15_Stage_Stone_Entry_Step|^V15_Stage_Individual_Wood_Planks$|^V15_Lotus_Medallion_Base$|^V15_Medallion_Radial_Mortar)/;

export const WORLD_V3 = {
  cafe: { x: -9, front: -1, rear: -13, floor: .276, width: 6.44, depth: 12 },
  bounds: { minX: -19.8, maxX: 38.8, minZ: -37.5, maxZ: 12.8 },
  spots: {
    cafe: { position: [-12.65, 0, 1.5], target: [-11.85, 1.3, .55], camera: [-13.15, 2.0, 4.6] },
    dinh: { position: [14.5, 0, -19.2], target: [14.5, 2.0, -20.8], camera: [15.8, 2.5, -14.5] },
  },
};
export const WORLD_TEXT = {
  entrance: 'ĐÌNH ĐÌNH BẢNG',
  heritage: ['DI TÍCH QUỐC GIA ĐẶC BIỆT', 'ĐÌNH ĐÌNH BẢNG'],
  cafe: ['Em sẽ đợi anh ở', 'Cing Hu Tang', 'I’ll wait for you at Cing Hu Tang', '我会在 Cing Hu Tang 等你'],
  dinh: ['Chào em!', 'Anh đứng ở đây từ chiều'],
  cafeRoad: ['Em sẽ đợi anh ở Cing Hu Tang', 'I’ll be waiting for you at Cing Hu Tang', '我会在 Cing Hu Tang 等你'],
  dinhRoad: ['Chào em! Anh đứng ở đây từ chiều', 'Hi! I’ve been standing here since this afternoon.', '嗨！我从下午就站在这里了。'],
};

export async function loadWorldAssets(assetRoot, signal) {
  const fonts = []; let logo = null;
  try {
    for (const [family, file] of [['PlazaSign', 'sign'], ['PlazaSerif', 'serif'], ['PlazaChinese', 'chinese'], ['PlazaRoad', 'road']]) {
      const response = await fetch(new URL(`${file === 'road' || file === 'chinese' ? 'v4' : 'v3'}/${file}.woff`, assetRoot), { signal });
      if (!response.ok) throw new Error(`Không tải được font biển ${file}.`);
      const font = new FontFace(family, await response.arrayBuffer());
      await font.load(); if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
      document.fonts.add(font); fonts.push(font);
    }
    const response = await fetch(new URL('v3/cing-logo-wall-reference.jpg', assetRoot), { signal });
    if (!response.ok) throw new Error('Không tải được cụm logo Cing.');
    // Use the user's original photograph unchanged; select the logo area with UVs.
    const bitmap = await createImageBitmap(await response.blob(), { imageOrientation: 'flipY' });
    logo = new THREE.Texture(bitmap); logo.flipY = false; logo.colorSpace = THREE.SRGBColorSpace;
    logo.repeat.set((854-300)/1152, (1085-775)/2048);
    logo.offset.set(300/1152, 1-1085/2048); logo.needsUpdate = true;
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
    return { logo, dispose: () => { fonts.forEach(f => document.fonts.delete(f)); } };
  } catch (error) {
    fonts.forEach(f => document.fonts.delete(f)); logo?.dispose(); logo?.source.data?.close?.();
    throw error;
  }
}

export function canvasLabel(lines, { width = 2048, height = 1024, background = '#fffdf5', color = '#22211e', heritage = false, road = false } = {}) {
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = background; ctx.fillRect(0, 0, width, height);
  if (road) {
    ctx.fillStyle='#307bce';ctx.fillRect(0,0,width,height*.72);
    ctx.fillStyle='#fffdf2';ctx.fillRect(0,height*.72,width,height*.28);
    ctx.textAlign='center';ctx.textBaseline='middle';
    lines.forEach((line,index)=>{
      const family=index===2?'PlazaChinese':'PlazaRoad';let size=index===0?132:index===1?102:140;
      ctx.font=`${size}px \"${family}\"`;while(ctx.measureText(line).width>width*.92&&size>35){size--;ctx.font=`${size}px \"${family}\"`;}
      ctx.fillStyle=index===2?'#242627':'#fffdf5';ctx.fillText(line,width/2,height*[.245,.535,.855][index]);
    });
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
    const material=new THREE.MeshBasicMaterial({map:texture,toneMapped:false});material.name='V4_Road_Sign_Face';material.userData.plazaBacklit=true;return material;
  }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = color;
  if (heritage) {
    ctx.strokeStyle = '#ac8846'; ctx.lineWidth = 9; ctx.strokeRect(22, 22, width-44, height-44);
    ctx.lineWidth = 2; ctx.strokeRect(43, 43, width-86, height-86);
  }
  const positions = lines.length === 4 ? [.24, .46, .70, .86] : lines.length === 2 ? [.32, .67] : [.5];
  lines.forEach((line, index) => {
    let size = lines.length === 4 ? (index < 2 ? 150 : 72) : lines.length === 2 ? (heritage && index === 0 ? 92 : 160) : 174;
    const family = /[\u4e00-\u9fff]/.test(line) ? 'PlazaChinese' : heritage && (lines.length === 1 || index > 0) ? 'PlazaSerif' : 'PlazaSign';
    ctx.font = `${size}px "${family}"`;
    while (ctx.measureText(line).width > width*.88 && size > 30) { size--; ctx.font = `${size}px "${family}"`; }
    ctx.fillText(line, width/2, height*positions[index]);
  });
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4;
  const material = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
  material.name = 'V3_Legible_Sign'; return material;
}

function solidBox(box, x, z, radius = .23) {
  const dx = Math.max(box.min.x - x, 0, x - box.max.x), dz = Math.max(box.min.z - z, 0, z - box.max.z);
  return dx*dx + dz*dz < radius*radius;
}

export function buildWorldV3(map, { labelFactory = canvasLabel, logo = null } = {}) {
  map.updateMatrixWorld(true);
  const records = [], removed = [], preserved = new Set(), explicitObstacles = [], addedFloors = [];
  const doors = [], originalMeshes = [], nightMaterials = [], lampAnchors = [];
  const cafeLeafSources=[], banyanLeafSources=[], movedFurniture=[];
  map.traverse(o => { if (o.isMesh) { const box = new THREE.Box3().setFromObject(o); records.push({ o, box }); originalMeshes.push(o); } });
  const stone = originalMeshes.find(o => o.name === 'Cafe_Back_Wall')?.material || new THREE.MeshStandardMaterial({ color: '#c8b59a', roughness: .85 });
  const timber = originalMeshes.find(o => o.name === 'V15_Dinh_Name_Plaque')?.material || new THREE.MeshStandardMaterial({ color: '#4c2818', roughness: .65 });
  const black = new THREE.MeshStandardMaterial({ color: '#181c1c', roughness: .4, metalness: .35 }); black.name = 'V3_Black_Frame';
  const cream = new THREE.MeshStandardMaterial({ color: '#e6dcc7', roughness: .75 }); cream.name = 'V3_Cream_Plaster';
  const cap = new THREE.MeshStandardMaterial({ color: '#92563c', roughness: .82 }); cap.name = 'V3_Terracotta_Cap';
  const gold = new THREE.MeshStandardMaterial({ color: '#b99453', roughness: .35, metalness: .65 }); gold.name = 'V3_Brass_Edge';
  const group = new THREE.Group(); group.name = 'Cing_Plaza_World_V3'; map.add(group);
  const addBox = (name, dims, pos, material, { collide = true, parent = group } = {}) => {
    const o = new THREE.Mesh(new THREE.BoxGeometry(...dims), material); o.name = name; o.position.set(...pos);
    o.userData.plazaCollision = collide; parent.add(o); return o;
  };
  function detach(o) { o.removeFromParent(); removed.push(o); }
  function replaceWorld(o, transform, name = o.name) {
    const geometry = o.geometry.clone().applyMatrix4(o.matrixWorld).applyMatrix4(transform);
    const mesh = new THREE.Mesh(geometry, o.material); mesh.name = name; mesh.userData = { ...o.userData };
    map.add(mesh); detach(o); return mesh;
  }
  const stretch = new THREE.Matrix4().makeTranslation(0, 0, -1).multiply(new THREE.Matrix4().makeScale(1, 1, 2)).multiply(new THREE.Matrix4().makeTranslation(0, 0, 1));
  const rearReflect = new THREE.Matrix4().makeTranslation(-9, 0, -7).multiply(new THREE.Matrix4().makeRotationY(Math.PI)).multiply(new THREE.Matrix4().makeTranslation(9, 0, 7));
  const moveDecoration = new THREE.Matrix4().makeTranslation(-12.04, 0, -7).multiply(new THREE.Matrix4().makeRotationY(Math.PI/2)).multiply(new THREE.Matrix4().makeTranslation(9, 0, 6.8));
  const gardenBeds=records.filter(({o})=>/^V17_Garden_Planter_Soil/.test(o.name)).map(({box})=>({box,center:box.getCenter(new THREE.Vector3())}));
  const rearMeshes = [];
  for (const { o, box } of records) {
    const center = box.getCenter(new THREE.Vector3());
    if (o.material?.name==='ART_Lamp_Glow' && box.min.x>-12.6 && box.max.x<-5.4 && center.z<-6.3 && center.z>-7.3) {detach(o);continue;}
    if (/^V17_Garden_New_(?:Foliage|Flowers)_/.test(o.name)) {
      const mesh=replaceWorld(o,new THREE.Matrix4()),a=mesh.geometry.attributes.position;
      for(let i=0;i<a.count;i++){
        const x=a.getX(i),z=a.getZ(i);let nearest=null,distance=Infinity;
        for(const bed of gardenBeds){const dx=Math.max(bed.box.min.x-x,0,x-bed.box.max.x),dz=Math.max(bed.box.min.z-z,0,z-bed.box.max.z),d=dx*dx+dz*dz;if(d<distance){distance=d;nearest=bed;}}
        if(nearest&&(nearest.center.x>10.5||nearest.center.z<-18))a.setX(i,x+6.5);
      }
      a.needsUpdate=true;mesh.geometry.computeBoundingBox();mesh.geometry.computeBoundingSphere();mesh.userData.plazaCollision=false;continue;
    }
    // Move the one garden lamp/pier buried by the relocated deck into its side aisle.
    if (/^V15_(?:Lantern_|Pier_|Stone_)/.test(o.name) && Math.abs(center.x-14.6)<.4 && Math.abs(center.z+6.3)<.4) {replaceWorld(o,new THREE.Matrix4().makeTranslation(3.1,0,0));continue;}
    if (/^V15_Thousands_Of_Folded_Leaves_/.test(o.name)) {
      // Each of the six material meshes contains disconnected leaves from ALL
      // trees. Translate per vertex, not by the aggregate bounding box.
      const mesh=replaceWorld(o,new THREE.Matrix4());
      const a=mesh.geometry.attributes.position;let cafeVertices=0;
      for(let i=0;i<a.count;i++) {
        if(a.getX(i)<-8 && a.getZ(i)>-8)cafeVertices++;
        else a.setX(i,a.getX(i)+6.5);
      }
      a.needsUpdate=true;mesh.geometry.computeBoundingBox();mesh.geometry.computeBoundingSphere();
      mesh.userData.plazaCollision=false;mesh.userData.cafeVertices=cafeVertices;cafeLeafSources.push(mesh);
      // Isolate only the banyan leaves for two extra, lower canopy tiers.
      const source=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();source.applyMatrix4(o.matrixWorld);
      const pos=source.attributes.position, selected=[];
      for(let i=0;i<pos.count;i+=3) {
        let x=0,z=0;for(let j=0;j<3;j++){x+=pos.getX(i+j)/3;z+=pos.getZ(i+j)/3;}
        const banyan=(x-16.2)**2+(z+12)**2;
        const back=Math.min((x+3.05)**2+(z+22.9)**2,(x-3.05)**2+(z+22.9)**2,(x-7.65)**2+(z+22.7)**2);
        if(banyan<back && x>8)selected.push(i,i+1,i+2);
      }
      if(selected.length) {
        const geometry=new THREE.BufferGeometry();
        for(const[name,attr]of Object.entries(source.attributes)){
          const array=new attr.array.constructor(selected.length*attr.itemSize);
          selected.forEach((vertex,index)=>{for(let c=0;c<attr.itemSize;c++)array[index*attr.itemSize+c]=attr.array[vertex*attr.itemSize+c];});
          geometry.setAttribute(name,new THREE.BufferAttribute(array,attr.itemSize,attr.normalized));
        }
        geometry.translate(6.5,0,0);banyanLeafSources.push({geometry,material:o.material});
      }
      source.dispose();continue;
    }
    if (/^V15_(?:Chair_|Table_|Tea_Cup_Handle)/.test(o.name) && center.y<2 && Math.hypot(center.x+10.84,center.z-2)<1.5) {
      const mesh=replaceWorld(o,new THREE.Matrix4().makeTranslation(3.49,.24,-11.5));movedFurniture.push(mesh);continue;
    }
    if (/^ART_(?:Back_Ivory|Interior_Crown|Interior_Dado)/.test(o.name) || /^Cafe_Orange_Back/.test(o.name) || /^(?:Cafe_Side_Wall_-1|Cafe_Orange_Side|Cafe_Orange_Side002)$/.test(o.name)) {detach(o);continue;}
    if (/^V15_Lantern_/.test(o.name) && Math.abs(center.x+15.1)<.4 && Math.abs(center.z-1.3875)<.4) { detach(o); continue; }
    if (/^(?:V15|V17)_Dinh_/.test(o.name) && !/^V15_Dinh_Name/.test(o.name)) { replaceWorld(o, new THREE.Matrix4().makeTranslation(6.5,0,0)); continue; }
    if (/^V15_(?:Banyan_|Stage_|Guitar_|Microphone_|Acoustic_|Back_)/.test(o.name) || /^V17_Garden_/.test(o.name) && center.z < -18 || center.x > 10.5 && !/^V17_(?:Ground|Courtyard|Mortar)/.test(o.name)) { replaceWorld(o, new THREE.Matrix4().makeTranslation(6.5,0,0)); continue; }
    if (/^V17_(?:Ground_Extension|Courtyard_|Mortar_)/.test(o.name)) {
      const expand = new THREE.Matrix4().makeTranslation(-20,0,0).multiply(new THREE.Matrix4().makeScale(48.5/42,1,1)).multiply(new THREE.Matrix4().makeTranslation(20,0,0));
      replaceWorld(o,expand); continue;
    }
    const insideX = box.min.x >= -12.6 && box.max.x <= -5.4;
    if (o.name === 'V15_Dinh_Name' || o.name === 'V15_Dinh_Name_Plaque' || o.name === 'ORIGINAL_CING_HU_TANG_KINH_BAC_LOGO') { detach(o); continue; }
    if (/^ART_(?:Orange_Logo_Panel|Interior_Panel)/.test(o.name) || /^ART_Sconce_/.test(o.name)) { detach(o); continue; }
    if (o.name === 'Cafe_Back_Wall' || /^V15_Cafe_Cornice_Rear/.test(o.name)) { detach(o); continue; }
    if (insideX && box.min.z < -6.4 && box.max.z > -7.3 && box.max.z-box.min.z < .8 && !/Floor|Roof|Cornice|Chair|Table/.test(o.name)) {
      replaceWorld(o, moveDecoration, `V3_Relocated_${o.name}`); continue;
    }
    if (/^Cafe_(?:Floor|Roof|Side_Wall|Orange_Side)|^V15_Cafe_(?:Cornice_Return|Roof_Stone_Pavers)/.test(o.name)) { replaceWorld(o, stretch); continue; }
    const facade = insideX && box.min.z >= -1.3 && box.max.z <= -.35 && !/Plant|Branch|Leaf|Flower|Trunk/.test(o.name);
    if (facade) {
      if (/^V4_Ground_Glass_[12]$|^V4_Ground_Frame_2$/.test(o.name)) { detach(o); continue; }
      const geometry = o.geometry.clone().applyMatrix4(o.matrixWorld).applyMatrix4(rearReflect);
      const clone = new THREE.Mesh(geometry, o.material); clone.name = `V3_Rear_${o.name}`; clone.userData = { ...o.userData };
      map.add(clone); rearMeshes.push(clone);
      if (o.name === 'V15_Facade_With_Continuous_Inset_Arch') { o.userData.plazaCollision = false; clone.userData.plazaCollision = false; }
    }
  }
  // Match the approved right wall exactly on the left, with no legacy ivory patch.
  for(const[sourceName,targetName]of [['Cafe_Side_Wall_1','Cafe_Side_Wall_-1'],['Cafe_Orange_Side001','Cafe_Orange_Side'],['Cafe_Orange_Side003','Cafe_Orange_Side002']]) {
    const source=map.getObjectByName(sourceName);source.updateMatrixWorld(true);
    const mesh=new THREE.Mesh(source.geometry.clone().applyMatrix4(source.matrixWorld).applyMatrix4(rearReflect),source.material);
    mesh.name=targetName;map.add(mesh);
  }
  // The facade is a mesh with an arch-shaped void: its full AABB would seal the door.
  for (const z of [-1, -13]) for (const [minX,maxX] of [[-12.3,-11.25],[-11.21,-10.104],[-7.896,-6.79],[-6.75,-5.7]]) {
    explicitObstacles.push({minX,maxX,minZ:z-.15,maxZ:z+.15,minY:0,maxY:4.6});
  }
  const glassOriginal = originalMeshes.find(o => o.name === 'V4_Ground_Glass_1')?.material;
  const glass = glassOriginal?.clone() || new THREE.MeshPhysicalMaterial({ color: '#c9ddd9', transparent: true, opacity: .25, roughness: .1 });
  glass.roughness=.045; glass.name = 'V3_Door_Clear_Glass'; glass.side = THREE.DoubleSide;
  for (const [index,z] of [-.99,-13.01].entries()) {
    const root = new THREE.Group(); root.name = `V3_Automatic_Door_${index}`; root.position.set(-9,0,z); root.rotation.y = index ? Math.PI : 0; group.add(root);
    const leaves = [];
    for (const side of [-1,1]) {
      const pivot = new THREE.Group(); pivot.position.x = side*1.104; root.add(pivot);
      const cx = -side*.552;
      addBox('V3_Moving_Door_Glass',[1.055,4.29,.018],[cx,2.376,0],glass,{parent:pivot,collide:false});
      for (const y of [.228,4.525]) addBox('V3_Moving_Door_Horizontal',[1.104,.035,.042],[cx,y,.018],black,{parent:pivot,collide:false});
      for (const x of [0,-side*1.104]) addBox('V3_Moving_Door_Vertical',[.035,4.33,.042],[x,2.376,.018],black,{parent:pivot,collide:false});
      addBox('V3_Door_Handle',[.035,.38,.08],[-side*.98,1.75,.055],gold,{parent:pivot,collide:false});
      const bars = pivot.children.filter(o => o.isMesh && o.material === black);
      const pieces = bars.map(o => { o.updateMatrix(); return o.geometry.clone().applyMatrix4(o.matrix); });
      const merged = mergeGeometries(pieces, false); pieces.forEach(g => g.dispose());
      if (merged) { bars.forEach(o => { o.removeFromParent(); o.geometry.dispose(); }); const frame=new THREE.Mesh(merged,black); frame.name='V3_Moving_Door_Frame'; frame.userData.plazaCollision=false; pivot.add(frame); }
      pivot.traverse(o => { if (o.isMesh) { o.userData.plazaDynamic = true; preserved.add(o); } });
      leaves.push({pivot,side,box:new THREE.Box3()});
    }
    doors.push({root,leaves,z,openness:0,hold:0});
    // Low ramps join the existing raised store floor without a 27 cm jump.
    const ramp = new THREE.Mesh(new THREE.PlaneGeometry(2.21,1.4), stone);
    ramp.geometry.rotateX(-Math.PI/2);
    const a = ramp.geometry.attributes.position;
    for(let i=0;i<a.count;i++) { const zz=a.getZ(i); a.setY(i,.018+(.276-.018)*(index ? (zz+.7)/1.4 : (.7-zz)/1.4)); }
    a.needsUpdate=true; ramp.geometry.computeVertexNormals();
    ramp.position.set(-9,0,index ? -13.7 : -.3); ramp.name=`V3_Cafe_Entry_Ramp_${index}`;
    ramp.userData.plazaCollision=false; group.add(ramp); addedFloors.push(ramp); preserved.add(ramp);
  }
  function panel(name, lines, width, height, pos, { rotation = 0, heritage = false, dark = false, standing = false } = {}) {
    const root = new THREE.Group(); root.name = name; root.position.set(...pos); root.rotation.y=rotation; group.add(root);
    addBox(`${name}_Back`,[width,height,.09],[0,0,0],dark?timber:cream,{parent:root});
    for(const y of [-height/2,height/2]) addBox(`${name}_Border`,[width+.06,.035,.11],[0,y,.015],heritage?gold:black,{parent:root,collide:false});
    for(const x of [-width/2,width/2]) addBox(`${name}_Border`,[.035,height,.11],[x,0,.015],heritage?gold:black,{parent:root,collide:false});
    const material = labelFactory(lines,{height:lines.length===1?512:1024,background:dark?'#352218':'#fffdf5',color:dark?'#eed7a2':'#22211e',heritage});
    const face = new THREE.Mesh(new THREE.PlaneGeometry(width-.045,height-.045),material);face.position.z=.052;face.userData.plazaCollision=false;face.name=`${name}_Text`;root.add(face);
    if(standing) for(const x of [-width*.34,width*.34]) {
      const h=pos[1]-height/2;
      addBox(`${name}_Post`,[.065,h,.065],[x,-height/2-h/2,0],black,{parent:root});
      addBox(`${name}_Foot`,[.48,.045,.36],[x,-pos[1]+.05,0],black,{parent:root});
    }
    root.userData.lines=lines; return root;
  }
  panel('V3_Dinh_Entrance_Name',[WORLD_TEXT.entrance],3.95,.72,[9,4.93,-12.86],{heritage:true,dark:true});
  panel('V3_Dinh_Heritage',WORLD_TEXT.heritage,5.6,1.25,[9,2.7,-18.77],{heritage:true,dark:true});
  // Reference: a small rounded blue road sign, white bottom strip, single dark pole.
  // Dimensions are set relative to the actual chibi, with the board above its head.
  const roadSigns = [];
  function roadSign(name, lines, position) {
    const width=1.76, height=.70, radius=.065;
    const root=new THREE.Group(); root.name=name; root.position.set(...position); group.add(root);
    const shape=new THREE.Shape(), x=-width/2,y=-height/2;
    shape.moveTo(x+radius,y);shape.lineTo(x+width-radius,y);shape.quadraticCurveTo(x+width,y,x+width,y+radius);
    shape.lineTo(x+width,y+height-radius);shape.quadraticCurveTo(x+width,y+height,x+width-radius,y+height);
    shape.lineTo(x+radius,y+height);shape.quadraticCurveTo(x,y+height,x,y+height-radius);
    shape.lineTo(x,y+radius);shape.quadraticCurveTo(x,y,x+radius,y);
    const body=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.065,bevelEnabled:true,bevelSize:.008,bevelThickness:.006,bevelSegments:2,steps:1,curveSegments:8}),black);
    body.name=name+'_Rounded_Body';root.add(body);
    // Canvas texture uses the same blue/white split as the photograph.
    const faceMaterial=labelFactory(lines,{road:true});
    const face=new THREE.Mesh(new THREE.ShapeGeometry(shape,8),faceMaterial);face.position.z=.072;face.name=name+'_Text';face.userData.plazaCollision=false;root.add(face);
    // ShapeGeometry UVs are in world units, so remap to a normalized label.
    const uv=face.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,(uv.getX(i)+width/2)/width,(uv.getY(i)+height/2)/height);uv.needsUpdate=true;
    preserved.add(face); nightMaterials.push(faceMaterial);
    const postHeight=position[1]-.08;
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(.047,.055,postHeight,12),black);pole.name=name+'_Single_Post';pole.position.set(0,-position[1]+postHeight/2+.04,-.04);root.add(pole);
    addBox(name+'_Anchor',[.24,.06,.24],[0,-position[1]+.065,-.04],black,{parent:root});
    const strip=new THREE.Mesh(new THREE.BoxGeometry(width-.10,.012,.032),new THREE.MeshStandardMaterial({color:'#fff3cf',emissive:'#fff3cf',emissiveIntensity:0}));
    strip.name=name+'_LED_Strip';strip.position.set(0,height/2+.015,.046);strip.userData.plazaCollision=false;root.add(strip);nightMaterials.push(strip.material);
    root.userData.lines=lines;root.userData.dimensions={width,height,posts:1,rounded:true};roadSigns.push(root);
    lampAnchors.push(new THREE.Vector3(position[0],position[1]+.35,position[2]+.35));
  }
  roadSign('V3_Cafe_Checkin',WORLD_TEXT.cafeRoad,[-11.65,2.14,.72]);
  roadSign('V3_Dinh_Checkin',WORLD_TEXT.dinhRoad,LAYOUT_V11.sign);
  roadSigns.at(-1).rotation.y=Math.PI;
  lampAnchors.at(-1).z=LAYOUT_V11.sign[2]-.35;

  // Both original-photo logos now belong to the cafe's interior walls.
  const logoRoots=[];
  if(logo) for(const [name,x,y,z,rotation]of [['V3_Interior_Cing_Logo',-11.98,3.22,-7.0,Math.PI/2],['V4_Relocated_Exterior_Cing_Logo',-6.02,3.22,-7.0,-Math.PI/2]]) {
    const root=new THREE.Group();root.name=name;root.position.set(x,y,z);root.rotation.y=rotation;group.add(root);logoRoots.push(root);
    const orange=new THREE.MeshStandardMaterial({color:'#d76d2a',roughness:.65});
    addBox(`${name}_Orange`,[3.25,1.95,.055],[0,0,-.04],orange,{parent:root,collide:false});
    for(const y of [-.975,.975])addBox(`${name}_Frame`,[3.35,.06,.08],[0,y,.004],cream,{parent:root,collide:false});
    for(const x of [-1.625,1.625])addBox(`${name}_Frame`,[.06,1.95,.08],[x,0,.004],cream,{parent:root,collide:false});
    const face=new THREE.Mesh(new THREE.PlaneGeometry(3.13,1.75),new THREE.MeshStandardMaterial({map:logo,roughness:.7}));face.position.z=.061;face.name=name+'_Photo';face.userData.plazaCollision=false;root.add(face);
    // The same spacing and height on either side of each logo; nothing overlays it.
    const bulbs=[];
    for(const side of [-1,1]) {
      const sx=side*2.05;
      addBox(name+'_Sconce_Plate',[.12,.38,.055],[sx,0,-.014],gold,{parent:root,collide:false});
      addBox(name+'_Sconce_Arm',[.055,.055,.22],[sx,-.04,.10],gold,{parent:root,collide:false});
      const mat=new THREE.MeshStandardMaterial({color:'#fff2cc',emissive:'#ffe5aa',emissiveIntensity:.25,roughness:.35});
      const bulb=new THREE.Mesh(new THREE.SphereGeometry(.10,12,8),mat);bulb.name=name+'_Sconce_Bulb';bulb.position.set(sx,.055,.23);root.add(bulb);bulbs.push(bulb);nightMaterials.push(mat);
    }
    root.userData.sconceSpacing=2.05;root.userData.bulbs=bulbs;
    root.updateMatrixWorld(true);lampAnchors.push(root.localToWorld(new THREE.Vector3(0,.1,1.2)));
  }

  // Invisible continuous collision floor covers tiny seams between the original
  // planks; the five original stone steps remain the visible access route.
  const stageFloor=new THREE.Mesh(new THREE.PlaneGeometry(6.5,4.5),timber);
  stageFloor.name='V5_Stage_Continuous_Walk_Surface';stageFloor.rotation.x=-Math.PI/2;stageFloor.position.set(21.7,1.12,-7.85);
  stageFloor.visible=false;stageFloor.userData.plazaCollision=false;group.add(stageFloor);addedFloors.push(stageFloor);preserved.add(stageFloor);

  const threshold=addBox('V5_Stage_Wood_Threshold',[3.10,.13,.14],[21.7,1.055,-5.565],timber,{collide:false});
  addedFloors.push(threshold);preserved.add(threshold);

  // A broad, layered banyan canopy preserves the original folded-leaf material.
  const canopyCenter=new THREE.Vector3(22.7,9.4,-12);
  let addedLeafTriangles=0;
  for(const{geometry,material}of banyanLeafSources) {
    for(const[scale,angle,drop,offsetZ]of [[.86,.25,-1.15,.30],[.72,-.30,-1.85,.85]]) {
      const transform=new THREE.Matrix4().makeTranslation(canopyCenter.x,canopyCenter.y+drop,canopyCenter.z+offsetZ)
        .multiply(new THREE.Matrix4().makeRotationY(angle)).multiply(new THREE.Matrix4().makeScale(scale,.84,scale))
        .multiply(new THREE.Matrix4().makeTranslation(-canopyCenter.x,-canopyCenter.y,-canopyCenter.z));
      const leaves=new THREE.Mesh(geometry.clone().applyMatrix4(transform),material);leaves.name='V5_Banyan_Layered_Leaves';leaves.userData.plazaCollision=false;map.add(leaves);addedLeafTriangles+=leaves.geometry.attributes.position.count/3;
    }
    geometry.dispose();
  }
  const bark=originalMeshes.find(o=>/^V15_Banyan_Main_Branch/.test(o.name))?.material||timber;
  for(let i=0;i<8;i++) {
    const angle=i*Math.PI/4+.15;
    const end=new THREE.Vector3(22.7+Math.cos(angle)*3.5,7.7+Math.sin(i*1.9)*.25,-12+Math.sin(angle)*3.3);
    const curve=new THREE.CubicBezierCurve3(new THREE.Vector3(22.7,4.6,-12),new THREE.Vector3(22.7,6.25,-12),new THREE.Vector3(22.7+Math.cos(angle)*2.3,7.05,-12+Math.sin(angle)*2.3),end);
    const branch=new THREE.Mesh(new THREE.TubeGeometry(curve,16,.085,6,false),bark);branch.name='V5_Banyan_Lower_Bough';branch.userData.plazaCollision=false;map.add(branch);
  }

  const entranceV6=refineEntranceV6(map);
  const groundV7=rebuildGroundV7(map,WORLD_V3.bounds),pondV7=closePondV7(map,entranceV6);
  const cleanupV8=cleanCourtyardV8(map);
  const fenceV9=repairGardenFenceV9(map);
  const gardenV10=repairGardenV10(map);
  const layoutV11=relocateGardenV11(map,gardenV10);
  const dinhV12=rebuildDinhV12(map,{labelFactory,heritageLines:WORLD_TEXT.heritage,entranceLines:[WORLD_TEXT.entrance]});
  const heritageV13=finishHeritageV13(map,dinhV12,cleanupV8);explicitObstacles.push(heritageV13.obstacle);
  const cafeTreeV15=improveCafeTreeV15(map,cafeLeafSources);
  const sanctuaryV14=finishSanctuaryV14(map,dinhV12);explicitObstacles.push(...sanctuaryV14.obstacles);for(const m of sanctuaryV14.nightMaterials)nightMaterials.push(m);for(const p of sanctuaryV14.lampAnchors)lampAnchors.push(p);
  addedFloors.push(...dinhV12.floors);for(const o of [dinhV12.entrance,dinhV12.heritage])preserved.add(o);
  addedFloors.push(groundV7.walk);preserved.add(groundV7.walk);
  addedFloors.push(entranceV6.floor);preserved.add(entranceV6.floor);

  // A low regional-style enclosure keeps the grounds readable from above.
  const {minX,maxX,minZ,maxZ}=WORLD_V3.bounds;
  const boundarySegment = (name,a,b) => {
    const horizontal=a[1]===b[1], length=Math.hypot(b[0]-a[0],b[1]-a[1]);
    const x=(a[0]+b[0])/2,z=(a[1]+b[1])/2;
    addBox(`${name}_Stone`,horizontal?[length,.38,.28]:[.28,.38,length],[x,.19,z],stone);
    addBox(`${name}_Plaster`,horizontal?[length,1.0,.24]:[.24,1.0,length],[x,.88,z],cream);
    addBox(`${name}_Cap`,horizontal?[length,.14,.38]:[.38,.14,length],[x,1.45,z],cap);
    const count=Math.ceil(length/4.0);
    for(let i=0;i<=count;i++) {const t=i/count;addBox(`${name}_Pier`,[.42,1.6,.42],[a[0]+(b[0]-a[0])*t,.8,a[1]+(b[1]-a[1])*t],cream);addBox(`${name}_PierCap`,[.53,.13,.53],[a[0]+(b[0]-a[0])*t,1.66,a[1]+(b[1]-a[1])*t],cap);}
  };
  boundarySegment('V3_Boundary_West',[minX,minZ],[minX,maxZ]);boundarySegment('V3_Boundary_East',[maxX,minZ],[maxX,maxZ]);
  boundarySegment('V3_Boundary_North',[minX,minZ],[maxX,minZ]);
  boundarySegment('V3_Boundary_SouthLeft',[minX,maxZ],[-1,maxZ]);boundarySegment('V3_Boundary_SouthRight',[3,maxZ],[maxX,maxZ]);
  for(const x of [-1,3]){addBox('V3_Main_Gate_Pillar',[.55,2.3,.55],[x,1.15,maxZ],stone);addBox('V3_Main_Gate_Cap',[.70,.17,.70],[x,2.4,maxZ],cap);}
  const gateGlobes=[];
  const gateMetal=new THREE.MeshStandardMaterial({color:'#66513b',metalness:.65,roughness:.45});
  const globeMaterial=new THREE.MeshStandardMaterial({color:'#f5ead5',emissive:'#ffe4ad',emissiveIntensity:.25,roughness:.3});globeMaterial.name='V16_Gate_Opal_Glass';nightMaterials.push(globeMaterial);
  for(const x of [-1,3]){
    const root=new THREE.Group();root.name='V16_Gate_Globe';root.position.set(x,2.485,maxZ);group.add(root);gateGlobes.push(root);
    const foot=new THREE.Mesh(new THREE.CylinderGeometry(.13,.17,.075,24),gateMetal);foot.position.y=.0375;root.add(foot);
    const collar=new THREE.Mesh(new THREE.CylinderGeometry(.10,.12,.055,24),gateMetal);collar.position.y=.10;root.add(collar);
    const globe=new THREE.Mesh(new THREE.SphereGeometry(.24,32,20),globeMaterial);globe.position.y=.355;globe.name='V16_Gate_Globe_Glass';root.add(globe);
    root.traverse(o=>{o.userData.plazaCollision=false;});lampAnchors.push(new THREE.Vector3(x,2.84,maxZ));
  }
  for(let i=0;i<=20;i++)addBox('V3_Main_Gate_Bar',[.035,1.65,.065],[-1+i*.2,.84,maxZ],black);
  for(const y of [.15,1.62])addBox('V3_Main_Gate_Rail',[4,.06,.09],[1,y,maxZ],black);
  panel('V3_Main_Gate_Name',['CING PLAZA'],3.6,.55,[1,2.16,maxZ+.08],{heritage:true,dark:true,rotation:Math.PI});
  group.updateMatrixWorld(true); map.updateMatrixWorld(true);
  // Boundary meshes are tiny. One batch per material is cheaper than many tile
  // batches, while original narrow colliders keep the middle of the map open.
  const boundarySources = [], boundaryBatches = new Map();
  group.traverse(o => {
    if (!o.isMesh || !/^V3_(?:Boundary_|Main_Gate_(?:Pillar|Cap|Bar|Rail))/.test(o.name)) return;
    boundarySources.push(o.name);
    const b=new THREE.Box3().setFromObject(o);
    explicitObstacles.push({minX:b.min.x,maxX:b.max.x,minZ:b.min.z,maxZ:b.max.z,minY:b.min.y,maxY:b.max.y});
    if(!boundaryBatches.has(o.material))boundaryBatches.set(o.material,[]);boundaryBatches.get(o.material).push(o);
  });
  for(const [material,meshes]of boundaryBatches) {
    const pieces=meshes.map(o=>o.geometry.clone().applyMatrix4(o.matrixWorld)), merged=mergeGeometries(pieces,false);pieces.forEach(g=>g.dispose());
    if(!merged)continue;meshes.forEach(o=>{o.removeFromParent();o.geometry.dispose();});
    const mesh=new THREE.Mesh(merged,material);mesh.name='V3_Perimeter_Batch';mesh.userData.plazaCollision=false;map.add(mesh);
  }
  const updateDoors = (position,dt,peers=[]) => {
    dt = Math.max(0, dt || 0);
    for(const door of doors) {
      const approach=[position,...peers].some(p=>Math.abs(p.x+9)<1.8&&Math.abs(p.z-door.z)<1.8);
      if(approach)door.hold=1.3;else door.hold=Math.max(0,door.hold-dt);
      const target=door.hold>0?1:0;
      door.openness=THREE.MathUtils.clamp(THREE.MathUtils.damp(door.openness,target,target?9:5,dt),0,1);
      for(const leaf of door.leaves) {leaf.pivot.rotation.y=-leaf.side*door.openness*1.45;leaf.pivot.updateMatrixWorld(true);leaf.box.setFromObject(leaf.pivot);}
    }
  };
  updateDoors(new THREE.Vector3(0,0,2.5),0);
  const doorBlocked=(x,z,y)=>doors.some(d=>d.leaves.some(l=>y<4.6&&solidBox(l.box,x,z)));
  const waitingAtDoor=position=>doors.some(d=>Math.abs(position.x+9)<1.5&&Math.abs(position.z-d.z)<1.8&&d.openness<.92);
  const used=new Set();map.traverse(o=>{if(o.geometry)used.add(o.geometry);});removed.forEach(o=>{if(!used.has(o.geometry))o.geometry.dispose();});
  return { gateGlobes, cafeTreeV15, sanctuaryV14, heritageV13, dinhV12, layoutV11, gardenV10, fenceV9, cleanupV8, groundV7, pondV7, entranceV6, cafeLeafSources, movedFurniture, addedLeafTriangles, nightMaterials, lampAnchors, roadSigns, logoRoots, preserved, floors:addedFloors, obstacles:explicitObstacles, doors, updateDoors, doorBlocked, waitingAtDoor, rearMeshes, group, boundarySources,
    stats:{gardenFenceBays:fenceV9.bays,gardenFencePiers:fenceV9.piers,removedWhiteStrips:cleanupV8.strips,removedOrphanPlantTriangles:cleanupV8.removedTriangles,courtyardBricks:groundV7.count,pondSides:pondV7.sides,entranceBricks:entranceV6.brickCount,entranceRailParts:entranceV6.sourceParts,movedFurnitureParts:movedFurniture.length,addedBanyanLeafTriangles:addedLeafTriangles,mapWidth:58.6,dinhShift:6.5,cafeDepth:12,automaticDoors:2,checkinBoards:2,perimeterWalls:5},
  };
}

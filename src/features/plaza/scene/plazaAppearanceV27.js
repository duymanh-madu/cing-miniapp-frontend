import {createFashionControllerV29} from './plazaFashionV29.js';
import {VRMExpression,VRMExpressionMorphTargetBind} from '@pixiv/three-vrm';
import * as THREE from 'three';
export const PLAZA_SKIN_ITEMS=Object.freeze([
 {id:'skin_white',slot:'skin',label:'Ngà sứ',shortLabel:'Trắng',toneLabel:'TÔNG DA · TRẮNG / NGÀ SỨ',priceCoin:30,color:'#fff0df'},
 {id:'skin_yellow',slot:'skin',label:'Mật ong',shortLabel:'Vàng',toneLabel:'TÔNG DA · VÀNG / MẬT ONG',priceCoin:30,color:'#dca36e'},
 {id:'skin_black',slot:'skin',label:'Hổ phách',shortLabel:'Đen',toneLabel:'TÔNG DA · ĐEN / HỔ PHÁCH',priceCoin:30,color:'#7b503b'},
]);
export const APPEARANCE_SLOTS=Object.freeze(['hair','face','top','bottom','outfit','shoes','skin']);
const hairStyles=[
 ['girl','cloud-bob','Mây Tơ','Bob tầng · mái bay','rgba(102,54,45,1)','bob'],
 ['girl','peach-twin','Song Đào','Hai bím cao · nơ lụa','rgba(91,42,38,1)','twin'],
 ['girl','lotus-chignon','Sen Ngọc','Búi trâm · cánh ngọc','rgba(50,42,38,1)','bun'],
 ['girl','moon-waves','Trăng Khuyết','Tóc dài gợn · kẹp trăng','rgba(46,42,58,1)','long'],
 ['girl','phoenix-ponytail','Phượng Vũ','Đuôi ngựa cao · dải lụa','rgba(107,47,37,1)','pony'],
 ['girl','silk-braid','Vân Lụa','Tết lệch · chuỗi ngọc','rgba(65,42,39,1)','braid'],
 ['boy','scholar-part','Nho Sinh','Rẽ ngôi gọn · mái cong','rgba(49,39,35,1)','part'],
 ['boy','wind-texture','Phong Vân','Mái rối tầng · lọn dựng','rgba(62,42,38,1)','texture'],
 ['boy','night-undercut','Dạ Lam','Undercut · chỏm vuốt','rgba(39,38,54,1)','crest'],
 ['boy','young-hero','Thiếu Hiệp','Búi cao · dây buộc đồng','rgba(53,38,34,1)','topknot'],
 ['boy','chestnut-crop','Hạt Dẻ','Crop chibi · mái nhọn','rgba(105,62,40,1)','crop'],
 ['boy','moon-curtain','Lam Nguyệt','Mái rèm · sóng mềm','rgba(40,46,60,1)','curtain'],
];
export const PLAZA_HAIR_ITEMS=Object.freeze(hairStyles.map(([character,id,name,detail,color,style])=>Object.freeze({id:`hair_${id.replace(/-/g,'_')}`,slot:'hair',character,label:name,detail,color,style,priceCoin:50})));
// Preview-only face styles use the facial morph targets authored in the current
// boy/girl modular VRMs. They are intentionally not purchasable/equippable until
// the server catalogue and ownership contract expose the face slot.
export const PLAZA_FACE_EXPRESSION_ITEMS=Object.freeze([
 {id:'face_laugh',slot:'face',label:'Cười rạng rỡ',mood:'Năng lượng ấm áp',targets:[['Fcl_EYE_Joy',.82],['Fcl_BRW_Joy',.34],['Fcl_MTH_Joy',.82]]},
 {id:'face_confident',slot:'face',label:'Ánh nhìn tự tin',mood:'Bình tĩnh, cuốn hút',targets:[['Fcl_EYE_Fun',.34],['Fcl_BRW_Fun',.38],['Fcl_MTH_Up',.42]]},
 {id:'face_wink',slot:'face',label:'Nháy mắt tinh nghịch',mood:'Tếu táo, lanh lợi',targets:[['Fcl_EYE_Close_L',1],['Fcl_BRW_Fun',.35],['Fcl_MTH_Fun',.68]]},
 {id:'face_teary',slot:'face',label:'Mắt ướt phụng phịu',mood:'Mềm mại, giàu cảm xúc',targets:[['Fcl_EYE_Sorrow',.72],['Fcl_BRW_Sorrow',.72],['Fcl_MTH_Sorrow',.7]]},
 {id:'face_fierce',slot:'face',label:'Ánh nhìn quyết đoán',mood:'Mạnh mẽ, bản lĩnh',targets:[['Fcl_EYE_Angry',.55],['Fcl_BRW_Angry',.7],['Fcl_MTH_Neutral',1]]},
 {id:'face_dreamy',slot:'face',label:'Mơ màng buồn ngủ',mood:'Êm dịu, thư thái',targets:[['Fcl_EYE_Close',.48],['Fcl_BRW_Fun',.18],['Fcl_MTH_Up',.18]]},
]);
export function materialSlot(name=''){
 if(/Body.*SKIN|Face.*SKIN/i.test(name))return 'skin';
 if(/HAIR/i.test(name))return 'hair';
 if(/Shoes/i.test(name))return 'shoes';
 if(/Bottoms|Pants|Shorts/i.test(name))return 'bottom';
 if(/Tops/i.test(name))return 'top';
 if(/Onepiece/i.test(name))return 'outfit';
 if(/Face|Eye|Mouth|Brow|Iris/i.test(name))return 'face';
 return null;
}
// Keep skin lighting consistent between face, hands and legs. The authored
// materials used different hard toon thresholds and a colored matcap.
export function softenPlazaSkin(material){
 if(materialSlot(material.name)!=='skin')return material;
 if(material.shadeColorFactor)material.shadeColorFactor.copy(material.color).multiplyScalar(.92);
 if('shadingToonyFactor' in material)material.shadingToonyFactor=.15;
 if('shadingShiftFactor' in material)material.shadingShiftFactor=0;
 if('giEqualizationFactor' in material)material.giEqualizationFactor=1;
 material.normalScale?.set(0,0);
 material.matcapFactor?.setRGB(0,0,0);
 material.parametricRimColorFactor?.setRGB(0,0,0);
 return material;
}
function makeHairPiece(geometry,material,position,scale,rotationY=0){
 const mesh=new THREE.Mesh(geometry,material);mesh.position.set(...position);mesh.scale.set(...scale);mesh.rotation.y=rotationY;mesh.castShadow=true;mesh.receiveShadow=true;return mesh;
}
function createHairLook(style,material,accent){
 const group=new THREE.Group();group.name=`CingHairStyle:${style}`;
 const sphere=new THREE.SphereGeometry(1,14,10);
 const add=(pos,size,color=material)=>group.add(makeHairPiece(sphere,color,pos,size));
 // A compact chibi cap plus silhouette pieces. Pieces live under the VRM head
 // bone, so every style follows head animation without another animation rig.
 const capSize=style==='long'?[.12,.105,.105]:[.112,.09,.098];
 add([0,.035,-.006],capSize);
 const fringe=(count=3,drop=.036)=>{for(let i=0;i<count;i++){const x=(i-(count-1)/2)*.052;add([x,.005-drop*(i%2?.78:1),.078],[.034,.052,.026],material);}};
 const sideLocks=(length=.09)=>{for(const sign of [-1,1])add([sign*.092,-.035,-.003],[.029,length,.035],material);};
 const tail=(x,y,z,length,width,rot=0)=>{const piece=makeHairPiece(sphere,material,[x,y,z],[width,length,width*.72],rot);group.add(piece);};
 const clip=(x,y,z,angle=0)=>{const pin=makeHairPiece(new THREE.CapsuleGeometry(.009,.075,3,6),accent,[x,y,z],[1,1,1],angle);group.add(pin);add([x,y+.018,z+.006],[.026,.019,.012],accent);};
 switch(style){
  case 'bob': fringe(5,.052);sideLocks(.09);tail(0,-.105,-.052,.075,.09);break;
  case 'twin': fringe(5,.035);for(const x of [-.105,.105]){add([x,.075,-.008],[.047,.055,.05]);tail(x,-.075,-.02,.14,.035,x<0?-.16:.16);add([x,.035,.004],[.054,.018,.05],accent);}break;
  case 'bun': fringe(3,.042);sideLocks(.11);add([0,.112,-.045],[.064,.06,.06]);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;add([Math.cos(a)*.035,.126,-.045+Math.sin(a)*.035],[.025,.036,.018],accent);}clip(.055,.11,-.032,.4);break;
  case 'long': fringe(5,.048);sideLocks(.14);tail(0,-.16,-.105,.20,.105);clip(.085,.01,.035,.75);break;
  case 'pony': fringe(5,.043);sideLocks(.085);add([0,.112,-.035],[.052,.045,.05]);tail(0,-.015,-.12,.22,.052);add([0,.075,-.025],[.066,.018,.055],accent);break;
  case 'braid': fringe(5,.05);sideLocks(.12);tail(-.112,-.095,-.015,.10,.032);for(let i=0;i<5;i++)add([-.13,-.17-i*.04,-.015],[.025,.035,.027],i%2?material:accent);break;
  case 'part': fringe(3,.025);sideLocks(.055);for(let i=0;i<3;i++)add([-.025+i*.018,.105-i*.012,.02],[.063,.018,.038],material);break;
  case 'texture': fringe(5,.04);for(let i=0;i<5;i++)add([-.08+i*.04,.105+(i%2)*.018,.015],[.035,.055,.032],material);sideLocks(.06);break;
  case 'crest': fringe(3,.024);sideLocks(.045);for(let i=0;i<4;i++)add([-.06+i*.04,.125-i*.006,-.004],[.03,.065,.03],material);clip(.083,.035,.04,.95);break;
  case 'topknot': fringe(3,.035);sideLocks(.07);add([0,.13,-.035],[.048,.055,.05]);tail(0,.19,-.045,.055,.02);clip(.045,.12,.005,.6);break;
  case 'crop': fringe(5,.045);for(let i=0;i<4;i++)add([-.06+i*.04,.098+(i%2)*.015,.005],[.028,.047,.03],material);sideLocks(.055);break;
  case 'curtain': fringe(5,.06);sideLocks(.15);tail(0,-.14,-.09,.16,.085);clip(.08,.005,.035,.65);break;
 }
 group.traverse(o=>{if(o.isMesh){o.frustumCulled=false;o.userData.cingAppearanceSlot='hair';}});
 return group;
}
function createHairController(root,character){
 const head=[];let anchor=null;root.traverse(object=>{if(object.isBone&&object.name==='J_Bip_C_Head')anchor=object;if(object.isMesh&&(object.userData?.cingAppearanceSlot==='hair'||object.name==='Hair'))head.push(object);});
 const materials=new Map();for(const item of PLAZA_HAIR_ITEMS){if(item.character!==character)continue;materials.set(item.id,{base:new THREE.MeshStandardMaterial({color:item.color,roughness:.76,metalness:.02}),accent:new THREE.MeshStandardMaterial({color:item.style==='bun'||item.style==='pony'?'#c9a66b':'#dfc990',roughness:.42,metalness:.25})});}
 let active=null,hidden=[];
 function apply(id){
  for(const entry of hidden)entry.object.visible=entry.visible;hidden=[];active?.traverse(o=>{if(o.geometry)o.geometry.dispose();});if(active?.parent)active.parent.remove(active);active=null;
  const item=PLAZA_HAIR_ITEMS.find(value=>value.id===id&&value.character===character);if(!item||!anchor)return;
  for(const object of head){hidden.push({object,visible:object.visible});object.visible=false;}
  const material=materials.get(item.id);active=createHairLook(item.style,material.base,material.accent);anchor.add(active);
 }
 return {apply,dispose(){apply(null);for(const value of materials.values()){value.base.dispose();value.accent.dispose();}}};
}
function createFaceExpressionController(root,manager){
 if(!manager?.registerExpression||!manager?.setValue)return {apply(){},dispose(){}};
 const meshes=[];root.traverse(object=>{if(object.isMesh&&object.morphTargetDictionary&&object.morphTargetInfluences)meshes.push(object);});
 const expressions=[];
 for(const item of PLAZA_FACE_EXPRESSION_ITEMS){
  const expression=new VRMExpression(item.id);
  for(const [targetName,weight] of item.targets){
   const primitives=meshes.filter(mesh=>Number.isInteger(mesh.morphTargetDictionary[targetName]));
   if(primitives.length)expression.addBind(new VRMExpressionMorphTargetBind({primitives,index:primitives[0].morphTargetDictionary[targetName],weight}));
  }
  if(expression.binds.length){manager.registerExpression(expression);expressions.push(expression);}
 }
 const baseValues=new Map((manager.expressions||[]).filter(expression=>!expressions.includes(expression)).map(expression=>[expression.expressionName,expression.weight]));
 function apply(id){
  manager.resetValues?.();
  for(const [name,value] of baseValues)manager.setValue(name,value);
  for(const expression of expressions)manager.setValue(expression.expressionName,0);
  if(expressions.some(expression=>expression.expressionName===id))manager.setValue(id,1);
 }
 return {apply,dispose(){apply(null);for(const expression of expressions)manager.unregisterExpression?.(expression);}};
}
// Private materials prevent a local recipe from changing every shared avatar.
export function createAppearanceController(root,options={}){
 const fashion=createFashionControllerV29(root,options);
 const face=createFaceExpressionController(root,options.expressionManager);
 const hair=createHairController(root,options.character);
 const bindings=[],owned=new Map();let disposed=false;
 root.traverse(object=>{if(object.material)bindings.push({object,array:Array.isArray(object.material),originals:Array.isArray(object.material)?object.material:[object.material]});});
 return {apply(recipe={}){
  if(disposed)return;
  fashion.apply(recipe);
  face.apply(recipe.face);
  hair.apply(recipe.hair);
  const skin=PLAZA_SKIN_ITEMS.find(x=>x.id===recipe.skin)?.color;
  for(const b of bindings){const next=b.originals.map(m=>{
   if(materialSlot(m.name)!=='skin'||!m.color)return m;
   let privateMaterial=owned.get(m);if(!privateMaterial){privateMaterial=m.clone();owned.set(m,privateMaterial);}
   privateMaterial.color.copy(m.color);if(skin)privateMaterial.color.multiply(privateMaterial.color.clone().set(skin));softenPlazaSkin(privateMaterial);return privateMaterial;
  });b.object.material=b.array?next:next[0];}
 },slots:()=>Object.fromEntries(APPEARANCE_SLOTS.map(slot=>[slot,bindings.flatMap(b=>b.originals.filter(m=>materialSlot(m.name)===slot).map(m=>m.name))])),dispose(){
  if(disposed)return;disposed=true;fashion.dispose();face.dispose();hair.dispose();
  for(const b of bindings)b.object.material=b.array?b.originals:b.originals[0];
  for(const m of owned.values())m.dispose();owned.clear();bindings.length=0;
 }};
}

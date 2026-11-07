import {createFashionControllerV29} from './plazaFashionV29.js';
import {VRMExpression,VRMExpressionMorphTargetBind} from '@pixiv/three-vrm';
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
// The current VRM files only contain their authored base haircut. Do not build
// replacement styles from primitive spheres: real, fitted hair assets are not
// present in this release bundle, and the old spheres caused severe overlap.
function createHairController(){return {apply(){},dispose(){}};}
export function registerPlazaFaceExpressionsV27(root,manager){
 if(!manager?.registerExpression)return;
 const meshes=[];root.traverse(o=>{if(o.isMesh&&o.morphTargetDictionary)meshes.push(o);});
 for(const item of PLAZA_FACE_EXPRESSION_ITEMS){
  if(manager.getExpression(item.id))continue;
  const expression=new VRMExpression(item.id);
  for(const [name,weight] of item.targets)for(const mesh of meshes){
   const index=mesh.morphTargetDictionary[name];
   if(Number.isInteger(index))expression.addBind(new VRMExpressionMorphTargetBind({primitives:[mesh],index,weight}));
  }
  if(expression.binds.length)manager.registerExpression(expression);
 }
}
function createFaceExpressionController(root,manager){
 registerPlazaFaceExpressionsV27(root,manager);
 const meshes=[];root.traverse(o=>{if(o.isMesh&&o.morphTargetDictionary&&o.morphTargetInfluences)meshes.push(o);});
 const touched=new Map();
 function restore(){for(const [mesh,values] of touched)for(const [index,value] of values)mesh.morphTargetInfluences[index]=value;touched.clear();}
 function write(mesh,index,value){if(!touched.has(mesh))touched.set(mesh,new Map());const values=touched.get(mesh);if(!values.has(index))values.set(index,mesh.morphTargetInfluences[index]);mesh.morphTargetInfluences[index]=value;}
 function apply(id){
  restore();
  for(const item of PLAZA_FACE_EXPRESSION_ITEMS)manager?.setValue?.(item.id,item.id===id?1:0);
  const item=PLAZA_FACE_EXPRESSION_ITEMS.find(x=>x.id===id);if(!item){manager?.update?.();return;}
  if(manager?.getExpression?.(id)){manager.update?.();return;}
  for(const mesh of meshes){
   const compressed=mesh.morphTargetDictionary[id];
   if(Number.isInteger(compressed)){write(mesh,compressed,1);continue;}
   for(const [name,weight] of item.targets){const index=mesh.morphTargetDictionary[name];if(Number.isInteger(index))write(mesh,index,weight);}
  }
 }
 return {apply,dispose(){apply(null);}};
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

import {createFashionControllerV29} from './plazaFashionV29.js';
import {VRMExpression,VRMExpressionMorphTargetBind} from '@pixiv/three-vrm';
export const PLAZA_SKIN_ITEMS=Object.freeze([
 {id:'skin_white',slot:'skin',label:'Da Trắng',priceCoin:30,color:'#fff5ec'},
 {id:'skin_yellow',slot:'skin',label:'Da vàng',priceCoin:30,color:'#deb283'},
 {id:'skin_black',slot:'skin',label:'Da Đen',priceCoin:30,color:'#795039'},
]);
export const APPEARANCE_SLOTS=Object.freeze(['hair','face','top','bottom','outfit','shoes','skin']);
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
 const bindings=[],owned=new Map();let disposed=false;
 root.traverse(object=>{if(object.material)bindings.push({object,array:Array.isArray(object.material),originals:Array.isArray(object.material)?object.material:[object.material]});});
 return {apply(recipe={}){
  if(disposed)return;
  fashion.apply(recipe);
  face.apply(recipe.face);
  const skin=PLAZA_SKIN_ITEMS.find(x=>x.id===recipe.skin)?.color;
  for(const b of bindings){const next=b.originals.map(m=>{
   if(materialSlot(m.name)!=='skin'||!m.color)return m;
   let privateMaterial=owned.get(m);if(!privateMaterial){privateMaterial=m.clone();owned.set(m,privateMaterial);}
   privateMaterial.color.copy(m.color);if(skin)privateMaterial.color.multiply(privateMaterial.color.clone().set(skin));softenPlazaSkin(privateMaterial);return privateMaterial;
  });b.object.material=b.array?next:next[0];}
 },slots:()=>Object.fromEntries(APPEARANCE_SLOTS.map(slot=>[slot,bindings.flatMap(b=>b.originals.filter(m=>materialSlot(m.name)===slot).map(m=>m.name))])),dispose(){
  if(disposed)return;disposed=true;fashion.dispose();face.dispose();
  for(const b of bindings)b.object.material=b.array?b.originals:b.originals[0];
  for(const m of owned.values())m.dispose();owned.clear();bindings.length=0;
 }};
}

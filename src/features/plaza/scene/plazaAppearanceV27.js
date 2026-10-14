export const PLAZA_SKIN_ITEMS=Object.freeze([
 {id:'skin_white',slot:'skin',label:'Da Trắng',priceCoin:30,color:'#fff5ec'},
 {id:'skin_yellow',slot:'skin',label:'Da vàng',priceCoin:30,color:'#deb283'},
 {id:'skin_black',slot:'skin',label:'Da Đen',priceCoin:30,color:'#795039'},
]);
export const APPEARANCE_SLOTS=Object.freeze(['hair','face','top','bottom','outfit','shoes','skin']);
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
// Private materials prevent a local recipe from changing every shared avatar.
export function createAppearanceController(root){
 const bindings=[],owned=new Map();let disposed=false;
 root.traverse(object=>{if(object.material)bindings.push({object,array:Array.isArray(object.material),originals:Array.isArray(object.material)?object.material:[object.material]});});
 return {apply(recipe={}){
  if(disposed)return;
  const skin=PLAZA_SKIN_ITEMS.find(x=>x.id===recipe.skin)?.color;
  for(const b of bindings){const next=b.originals.map(m=>{
   if(!skin||materialSlot(m.name)!=='skin'||!m.color)return m;
   let privateMaterial=owned.get(m);if(!privateMaterial){privateMaterial=m.clone();owned.set(m,privateMaterial);}
   privateMaterial.color.set(skin).multiply(m.color);if(privateMaterial.shadeColorFactor&&m.shadeColorFactor)privateMaterial.shadeColorFactor.set(skin).multiply(m.shadeColorFactor);return privateMaterial;
  });b.object.material=b.array?next:next[0];}
 },slots:()=>Object.fromEntries(APPEARANCE_SLOTS.map(slot=>[slot,bindings.flatMap(b=>b.originals.filter(m=>materialSlot(m.name)===slot).map(m=>m.name))])),dispose(){
  if(disposed)return;disposed=true;
  for(const b of bindings)b.object.material=b.array?b.originals:b.originals[0];
  for(const m of owned.values())m.dispose();owned.clear();bindings.length=0;
 }};
}

import * as T from 'three';
export const LAYOUT_V11=Object.freeze({fenceX:18,planterX:17.25,fenceShiftZ:-1.2,planterZ:{'005':3.6,'006':.2,'007':-3.2},sign:[-5.8,2.14,-14.5]});
export function relocateGardenV11(map,garden){
 map.updateMatrixWorld(true);const moves=[],obsolete=[];map.traverse(o=>{if(!o.isMesh||!/^V15_Wood_Railing_Ornamental_Loop/.test(o.name))return;const c=new T.Box3().setFromObject(o).getCenter(new T.Vector3());if(Math.abs(c.x-21.1)<.2&&c.z>=-6.5&&c.z<7.3)obsolete.push(o);});obsolete.forEach(o=>o.removeFromParent());
 for(const [suffix,z]of Object.entries(LAYOUT_V11.planterZ)){
  const soil=map.getObjectByName('V15_Garden_Planter_Dark_Soil'+suffix),box=new T.Box3().setFromObject(soil),c=box.getCenter(new T.Vector3()),dx=LAYOUT_V11.planterX-c.x,dz=z-c.z;
  const index=garden.restored.findIndex(b=>b.getCenter(new T.Vector3()).distanceTo(c)<.001);
  const parts=[];map.traverse(o=>{if(o.isMesh&&((o.name.startsWith('V15_Garden_Planter_')&&o.name.endsWith(suffix))||(index>=0&&o.name.startsWith(`V10_Restored_Planter_${index}_`))))parts.push(o);});
  for(const o of parts){o.position.x+=dx;o.position.z+=dz;}if(index>=0)garden.restored[index].translate(new T.Vector3(dx,0,dz));moves.push({suffix,dx,dz,parts});
 }
 for(const o of garden.copies){o.position.x-=3.1;o.position.z+=LAYOUT_V11.fenceShiftZ;}
 // The old isolated end pier moves with the row, replacing the copied end pier.
 const original=[];map.traverse(o=>{if(!o.isMesh||!/^V15_(?:Stone_Balustrade_Pier|Stone_Pier_|Pier_|Lantern_)/.test(o.name))return;const c=new T.Box3().setFromObject(o).getCenter(new T.Vector3());if(Math.abs(c.x-17.7)<.3&&Math.abs(c.z+6.3)<.3)original.push(o);});
 if(original.length){const replaced=garden.copies.filter(o=>o.name.startsWith('V10_East_Pier_0_'));for(const o of replaced)o.removeFromParent();garden.copies=garden.copies.filter(o=>!replaced.includes(o));for(const o of original){o.position.x+=.3;o.position.z+=1.75;garden.copies.push(o);}}
 garden.start+=LAYOUT_V11.fenceShiftZ;garden.end+=LAYOUT_V11.fenceShiftZ;map.updateMatrixWorld(true);return{moves,fence: garden.copies,sign:LAYOUT_V11.sign};
}

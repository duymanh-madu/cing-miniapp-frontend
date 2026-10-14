import {protectedPlazaDetail,plazaFoliageName} from './plazaMobileSceneV20.js';
export function plazaAuditGroup(name){
 if(protectedPlazaDetail(name))return 'protected';
 if(plazaFoliageName(name)||/^Mobile_Foliage_/.test(name))return 'foliage';
 if(/Banyan|Tree|Root|Branch|Trunk/.test(name))return 'treeWood';
 if(/Roof|Tile|Ridge/.test(name))return 'roof';
 if(/Lantern|Rail|Fence|Balustrade/.test(name))return 'railLights';
 if(/Ground|Brick|Floor|Courtyard|Pond|Water/.test(name))return 'groundWater';
 return 'architecture';
}
export function tagPlazaAuditGroups(root){root.traverse(o=>{if(o.isMesh)o.userData.plazaAuditGroup=plazaAuditGroup(o.name);});}
export function createPlazaAuditVisibility(root){
 const meshes=[];root.traverse(o=>{if(o.isMesh)meshes.push({mesh:o,visible:o.visible,group:o.userData.plazaAuditGroup||plazaAuditGroup(o.name)});});
 return {setHidden(group='none'){if(!['none','foliage','treeWood','roof','railLights','groundWater','architecture','protected'].includes(group))throw Error('INVALID_AUDIT_GROUP');for(const e of meshes)e.mesh.visible=e.visible&&e.group!==group;return {group,hiddenMeshes:meshes.filter(e=>e.visible&&e.group===group).length};},restore(){for(const e of meshes)e.mesh.visible=e.visible;}};
}

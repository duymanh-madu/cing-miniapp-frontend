import {VRMUtils} from '@pixiv/three-vrm';

// Preserve the authored mesh and textures. Merge only equivalent skeletons and
// expression morphs, before any GPU upload or remote clone is constructed.
export function preparePlazaAvatarV13(vrm) {
  VRMUtils.combineSkeletons(vrm.scene);
  VRMUtils.combineMorphs(vrm);
}

// SkeletonUtils clones each mesh's skeleton, even when the source shares one.
// Restore that sharing inside this actor, never across different actors.
export function shareActorSkeletonsV13(root) {
  const skeletons=new Map();
  root.traverse(mesh=>{
    if(!mesh.isSkinnedMesh)return;
    const s=mesh.skeleton;
    const key=s.bones.map(b=>b.uuid).join('|')+s.boneInverses.map(m=>m.elements.join(',')).join('|');
    const existing=skeletons.get(key);
    if(existing){if(existing!==s)s.dispose();mesh.skeleton=existing;}
    else skeletons.set(key,s);
  });
  return skeletons.size;
}

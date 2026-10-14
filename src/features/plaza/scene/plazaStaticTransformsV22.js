// Only generated fixed batches: doors, skinned avatars and authored objects
// retain their normal transform updates. Call after final map transforms.
export function freezePlazaStaticBatches(root){
 root.updateMatrixWorld(true);let frozen=0;
 root.traverse(o=>{if(!o.isMesh||o.isSkinnedMesh||o.children.length||o.userData.plazaDynamic||!/^PlazaStaticBatch_|^PlazaStaticInstancesV19$/.test(o.name))return;o.matrixAutoUpdate=false;o.matrixWorldAutoUpdate=false;frozen++;});return {frozen};
}
export function remotePoseBudgetV22(visible,elapsed){
 if(!Number.isFinite(elapsed)||elapsed<0)throw Error('INVALID_POSE_ELAPSED');
 return visible?{animationSeconds:elapsed,physicsSeconds:Math.min(elapsed,.1)}:null;
}

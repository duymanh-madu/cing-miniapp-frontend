// Normalized VRM axes: both avatars share this pose; raw mirrored axes are not used.
export function applyPlazaSeatedPose(vrm) {
 const h=vrm.humanoid;
 for(const side of ['left','right']) {
  h.getNormalizedBoneNode(side+'UpperLeg')?.rotation.set(-1.43,0,side==='left'?.045:-.045);
  h.getNormalizedBoneNode(side+'LowerLeg')?.rotation.set(1.43,0,0);
  h.getNormalizedBoneNode(side+'Foot')?.rotation.set(0,0,0);
 }
 const hips=h.getNormalizedBoneNode('hips');
 if(hips){hips.quaternion.identity();const rest=h.normalizedRestPose?.hips?.position;if(rest)hips.position.fromArray(rest);}
}

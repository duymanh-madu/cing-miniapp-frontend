import {VRMExpressionMorphTargetBind} from '@pixiv/three-vrm';

// combineMorphs bakes one attribute per expression, including custom faces.
// Some models already have fewer authored targets than registered expressions.
// Predict the allocation first: never increase morph buffers just to combine.
export function plazaMorphBudgetV31(vrm) {
  const uses=new Map(),original=new Set(),retained=new Set();
  for(const [name,expression] of Object.entries(vrm.expressionManager?.expressionMap||{})) {
    for(const bind of expression.binds||[])if(bind instanceof VRMExpressionMorphTargetBind && bind.weight!==0) {
      for(const mesh of bind.primitives){if(!uses.has(mesh))uses.set(mesh,new Set());uses.get(mesh).add(name);}
    }
  }
  let predictedBytes=0,unsupported=false;
  vrm.scene.traverse(mesh=>{
    if(!mesh.isMesh)return;
    const morphs=mesh.geometry.morphAttributes;
    for(const [kind,attributes]of Object.entries(morphs)) {
      for(const attribute of attributes)original.add(attribute);
      if(!uses.has(mesh)){for(const attribute of attributes)retained.add(attribute);continue;}
      if(!['position','normal'].includes(kind)){unsupported=true;continue;}
      const first=attributes[0];
      if(first)predictedBytes+=uses.get(mesh).size*first.count*first.itemSize*Float32Array.BYTES_PER_ELEMENT;
    }
  });
  for(const attribute of retained)predictedBytes+=attribute.array.byteLength;
  const originalBytes=[...original].reduce((n,a)=>n+a.array.byteLength,0);
  return {originalBytes,predictedBytes,shouldCombine:!unsupported&&predictedBytes<originalBytes};
}

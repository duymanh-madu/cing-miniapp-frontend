import * as THREE from 'three';

// The avatar is lit in its own pass, preserving depth from the world. Transparent
// glass is composed last, so an indoor character remains behind the glass.
// This avoids brightening the whole night scene to expose a face.
export function renderPlazaLayers(renderer,scene,camera,{updateWorldOnce=true,singlePass=false}={}) {
  const mask=camera.layers.mask,background=scene.background,autoClear=renderer.autoClear,infoReset=renderer.info.autoReset,worldAutoUpdate=scene.matrixWorldAutoUpdate;
  renderer.info.autoReset=false;renderer.info.reset();
  try {
    // All three layers use the same pose: update world matrices once, not three times.
    if(updateWorldOnce){scene.updateMatrixWorld();scene.matrixWorldAutoUpdate=false;}else scene.matrixWorldAutoUpdate=true;
    if(singlePass){camera.layers.set(0);camera.layers.enable(1);camera.layers.enable(2);renderer.autoClear=true;renderer.render(scene,camera);return;}
    camera.layers.set(0);renderer.autoClear=true;renderer.render(scene,camera);
    scene.background=null;renderer.autoClear=false;
    camera.layers.set(1);renderer.render(scene,camera);
    camera.layers.set(2);renderer.render(scene,camera);
  } finally {camera.layers.mask=mask;scene.background=background;renderer.autoClear=autoClear;renderer.info.autoReset=infoReset;scene.matrixWorldAutoUpdate=worldAutoUpdate;}
}

export function createPlazaLightingV4(scene, camera, avatar, {mobileBudget=false}={}) {
  const fill=new THREE.DirectionalLight('#fffaf2',.18);
  const ambient=new THREE.AmbientLight('#fff5e6',0);
  const portrait=new THREE.HemisphereLight('#f8fbff','#756377',.25);
  const rim=new THREE.DirectionalLight('#afdcff',.35);rim.name='V10_Portrait_Rim';rim.layers.set(1);scene.add(rim,rim.target);
  fill.name='V4_Portrait_Fill';ambient.name='V4_Night_Ambient';portrait.name='V4_Portrait_Hemisphere';
  for(const light of [fill,ambient,portrait])light.layers.set(1);
  scene.add(fill,fill.target,ambient,portrait);
  const lamps=[];let world=null,night=0,budgetElapsed=.25;
  function attachWorld(value) {
    world=value;
    for(const [index,p] of (mobileBudget?value.lampAnchors.slice(0,4):value.lampAnchors).entries()) {
      const lamp=new THREE.PointLight('#ffedce',0,5.5,2);
      lamp.userData.anchorIndex=index;lamp.userData.targetIndex=index;lamp.name='V4_Local_Night_Lamp';lamp.position.copy(p);lamp.layers.enable(2);scene.add(lamp);lamps.push(lamp);
    }
  }
  function apply(palette, hemisphere, renderer, sun) {
    night=THREE.MathUtils.clamp((1.1-palette.sun)/.78,0,1);
    fill.intensity=THREE.MathUtils.lerp(.24,1.08,night);rim.intensity=THREE.MathUtils.lerp(.3,.5,night);
    ambient.intensity=.06*night;portrait.intensity=THREE.MathUtils.lerp(.2,.5,night);
    hemisphere.intensity=palette.hemisphere*.52;if(sun)sun.intensity=palette.sun*1.35;hemisphere.color.copy(palette.light);
    renderer.toneMappingExposure=Math.max(palette.exposure,.90*night);
    scene.environmentIntensity=palette.environment*.45;
    lamps.forEach((lamp,index)=>{lamp.intensity=night*(index<2?1.5:5);lamp.visible=mobileBudget||lamp.intensity>0;});
    world?.nightMaterials.forEach(material=>{
      if(material.name==='V4_Road_Sign_Face')material.color.setScalar(.90+.10*night);
      else material.emissiveIntensity=.25+2*night;
    });
  }
  const dir=new THREE.Vector3();
  function update(dt=1/60) {
    if(mobileBudget&&world){
      budgetElapsed+=Math.min(.1,Math.max(0,dt));
      if(budgetElapsed>=.25){
        budgetElapsed=0;const ranked=world.lampAnchors.map((p,index)=>({index,score:p.distanceToSquared(avatar.position)+.12*p.distanceToSquared(camera.position)})).sort((a,b)=>a.score-b.score);
        const threshold=(ranked[Math.min(3,ranked.length-1)]?.score??0)*1.25;
        const retained=lamps.map(l=>l.userData.targetIndex).filter((index,i,all)=>all.indexOf(index)===i&&ranked.some(r=>r.index===index&&r.score<=threshold)).slice(0,4);
        for(const r of ranked)if(retained.length<4&&!retained.includes(r.index))retained.push(r.index);
        const pending=retained.filter(index=>!lamps.some(l=>l.userData.targetIndex===index));
        for(const lamp of lamps)if(!retained.includes(lamp.userData.targetIndex))lamp.userData.targetIndex=pending.shift();
      }
      for(const lamp of lamps){const state=lamp.userData,target=state.targetIndex;
        if(target===undefined){lamp.intensity=0;continue;}
        const switching=target!==state.anchorIndex,desired=switching?0:night*(target<2?1.5:5);
        lamp.intensity=THREE.MathUtils.damp(lamp.intensity,desired,16,Math.min(.1,Math.max(0,dt)));
        if(switching&&lamp.intensity<.025){state.anchorIndex=target;lamp.position.copy(world.lampAnchors[target]);lamp.intensity=0;}
        lamp.visible=true;
      }
    }

    dir.copy(camera.position).sub(avatar.position);dir.y=0;
    if(dir.lengthSq()<.001)dir.set(0,0,1);dir.normalize();
    fill.position.copy(avatar.position).addScaledVector(dir,5);fill.position.y+=4;
    fill.target.position.copy(avatar.position);fill.target.position.y+=1;
    fill.target.updateMatrixWorld(true);
    rim.position.copy(avatar.position).addScaledVector(dir,-4);rim.position.x+=2;rim.position.y+=3;rim.target.position.copy(avatar.position);rim.target.position.y+=1;rim.target.updateMatrixWorld(true);
  }
  return {attachWorld,apply,update,fill,ambient,portrait,rim,lamps,get night(){return night;},get budget(){return {mobileBudget,pointLightCount:lamps.length,anchorCount:world?.lampAnchors.length??0};}};
}

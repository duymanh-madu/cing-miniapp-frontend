import * as THREE from 'three';

// The avatar is lit in its own pass, preserving depth from the world. Transparent
// glass is composed last, so an indoor character remains behind the glass.
// This avoids brightening the whole night scene to expose a face.
export function renderPlazaLayers(renderer,scene,camera) {
  const mask=camera.layers.mask,background=scene.background,autoClear=renderer.autoClear,infoReset=renderer.info.autoReset;
  renderer.info.autoReset=false;renderer.info.reset();
  try {
    camera.layers.set(0);renderer.autoClear=true;renderer.render(scene,camera);
    scene.background=null;renderer.autoClear=false;
    camera.layers.set(1);renderer.render(scene,camera);
    camera.layers.set(2);renderer.render(scene,camera);
  } finally {camera.layers.mask=mask;scene.background=background;renderer.autoClear=autoClear;renderer.info.autoReset=infoReset;}
}

export function createPlazaLightingV4(scene, camera, avatar) {
  const fill=new THREE.DirectionalLight('#fffaf2',.18);
  const ambient=new THREE.AmbientLight('#fff5e6',0);
  const portrait=new THREE.HemisphereLight('#fffaf0','#a89d8f',.25);
  fill.name='V4_Portrait_Fill';ambient.name='V4_Night_Ambient';portrait.name='V4_Portrait_Hemisphere';
  for(const light of [fill,ambient,portrait])light.layers.set(1);
  scene.add(fill,fill.target,ambient,portrait);
  const lamps=[];let world=null,night=0;
  function attachWorld(value) {
    world=value;
    for(const p of value.lampAnchors) {
      const lamp=new THREE.PointLight('#ffedce',0,5.5,2);
      lamp.name='V4_Local_Night_Lamp';lamp.position.copy(p);lamp.layers.enable(2);scene.add(lamp);lamps.push(lamp);
    }
  }
  function apply(palette, hemisphere, renderer) {
    night=THREE.MathUtils.clamp((1.1-palette.sun)/.78,0,1);
    fill.intensity=THREE.MathUtils.lerp(.12,1.02,night);
    ambient.intensity=.15*night;portrait.intensity=THREE.MathUtils.lerp(.15,.85,night);
    hemisphere.intensity=palette.hemisphere;hemisphere.color.copy(palette.light);
    renderer.toneMappingExposure=Math.max(palette.exposure,.90*night);
    scene.environmentIntensity=palette.environment;
    lamps.forEach((lamp,index)=>lamp.intensity=night*(index<2?1.5:5));
    world?.nightMaterials.forEach(material=>{
      if(material.name==='V4_Road_Sign_Face')material.color.setScalar(.90+.10*night);
      else material.emissiveIntensity=.25+2*night;
    });
  }
  const dir=new THREE.Vector3();
  function update() {
    dir.copy(camera.position).sub(avatar.position);dir.y=0;
    if(dir.lengthSq()<.001)dir.set(0,0,1);dir.normalize();
    fill.position.copy(avatar.position).addScaledVector(dir,5);fill.position.y+=4;
    fill.target.position.copy(avatar.position);fill.target.position.y+=1;
    fill.target.updateMatrixWorld(true);
  }
  return {attachWorld,apply,update,fill,ambient,portrait,lamps,get night(){return night;}};
}

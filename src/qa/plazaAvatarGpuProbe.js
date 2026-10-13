import * as T from 'three';
// QA only. Small synchronous readback exclusively after a user failure marker.
export function countPlazaProbePixels(bytes){let pixels=0;for(let i=3;i<bytes.length;i+=4)if(bytes[i]>16)pixels++;return pixels;}
export function probePlazaAvatarGpu(renderer,scene,camera){
 const saved={target:renderer.getRenderTarget(),background:scene.background,override:scene.overrideMaterial,mask:camera.layers.mask,autoClear:renderer.autoClear,clear:renderer.getClearColor(new T.Color()),alpha:renderer.getClearAlpha(),infoAutoReset:renderer.info.autoReset};
 const target=new T.WebGLRenderTarget(96,96,{depthBuffer:true,stencilBuffer:false});const silhouette=new T.MeshBasicMaterial({color:0xffffff,side:T.DoubleSide});const bytes=new Uint8Array(96*96*4),result={scope:'isolated-avatar-pass-not-final-screen',width:96,height:96,passes:[],error:null};
 try{
  scene.background=null;camera.layers.set(1);renderer.autoClear=true;renderer.setClearColor(0,0);renderer.setRenderTarget(target);
  for(const samples of [4,0]){
   // Targets differ so GPU attachments are rebuilt with the requested sample count.
   renderer.setRenderTarget(null);target.dispose();target.samples=Math.min(samples,renderer.capabilities.maxSamples);renderer.setRenderTarget(target);
   for(const mode of ['original','silhouette']){
    scene.overrideMaterial=mode==='silhouette'?silhouette:null;renderer.info.reset();renderer.clear();renderer.render(scene,camera);
    renderer.readRenderTargetPixels(target,0,0,96,96,bytes);
    result.passes.push({mode,samples:target.samples,pixels:countPlazaProbePixels(bytes),calls:renderer.info.render.calls,triangles:renderer.info.render.triangles});
   }
  }
 }catch(error){result.error=String(error.message||error);}
 finally{
  renderer.setRenderTarget(saved.target);renderer.setClearColor(saved.clear,saved.alpha);renderer.autoClear=saved.autoClear;renderer.info.autoReset=saved.infoAutoReset;scene.background=saved.background;scene.overrideMaterial=saved.override;camera.layers.mask=saved.mask;target.dispose();silhouette.dispose();
 }
 return result;
}

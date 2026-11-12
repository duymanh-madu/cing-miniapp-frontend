import {KTX2Loader} from 'three/addons/loaders/KTX2Loader.js';
const paths=Object.freeze(Object.fromEntries([
 ['v30/cing-boy-modular-v30.vrm','cing-boy-modular-v30.vrm'],['v32/cing-girl-modular-v32.vrm','cing-girl-modular-v32.vrm'],
 ...['boy','girl'].flatMap(sex=>['campus','royal','street'].map(style=>[`v34/${sex}-${style}-v34.glb`,`${sex}-${style}-v34.glb`])),
].map(([source,file])=>[source,'v29-gpu/'+file])));
export const compressedPlazaAssetV29=file=>paths[file]||file;
export function configurePlazaGpuTexturesV29(loader,renderer,assetRoot,{Loader=KTX2Loader}={}){
 const ktx=new Loader().setTranscoderPath(new URL('v29-gpu/basis/',assetRoot).href).setWorkerLimit(1).detectSupport(renderer);
 let disposed=false;const pending=new Set(),pool=ktx.workerPool,post=pool.postMessage.bind(pool);
 pool.postMessage=(...args)=>{
  if(disposed)return Promise.reject(new DOMException('Disposed','AbortError'));
  return new Promise((resolve,reject)=>{const task={reject};pending.add(task);post(...args).then(value=>{pending.delete(task);resolve(value);},error=>{pending.delete(task);reject(error);});});
 };
 const ready=ktx.init();ready.catch(()=>{});loader.setKTX2Loader(ktx);
 return {dispose(){if(disposed)return;disposed=true;for(const task of pending)task.reject(new DOMException('Disposed','AbortError'));pending.clear();ready.then(()=>ktx.dispose(),()=>pool.dispose());}};
}
export function plazaTextureInventoryV29(root){
 const textures=new Set(),buffers=new Set(),formats={};let compressed=0,plain=0,bytes=0;
 root.traverse(o=>{for(const material of Array.isArray(o.material)?o.material:[o.material])if(material){for(const value of Object.values(material))if(value?.isTexture)textures.add(value);for(const uniform of Object.values(material.uniforms||{}))if(uniform.value?.isTexture)textures.add(uniform.value);}});
 for(const texture of textures){if(texture.isCompressedTexture)compressed++;else plain++;formats[texture.format]=(formats[texture.format]||0)+1;for(const mip of texture.mipmaps||[]){if(mip.data&&!buffers.has(mip.data)){buffers.add(mip.data);bytes+=mip.data.byteLength;}}}
 return {compressedTextures:compressed,plainTextures:plain,uniqueMipDataBytes:bytes,formats};
}

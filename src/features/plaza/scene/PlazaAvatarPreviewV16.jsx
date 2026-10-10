import React,{useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {VRMLoaderPlugin,VRMUtils} from '@pixiv/three-vrm';
import {VRMAnimationLoaderPlugin,createVRMAnimationClip} from '@pixiv/three-vrm-animation';
import {preparePlazaAvatarV13} from './plazaAvatarResourcesV13.js';
import {refinePlazaAvatarSurfaceV10} from './plazaAvatarSurfaceV10.js';
import PlazaTitleV10 from '../pages/PlazaTitleV10.jsx';
export default function PlazaAvatarPreviewV16({character,titleKey}){
 const root=useRef(null),[status,setStatus]=useState('loading');
 useEffect(()=>{let disposed=false,frame=0,vrm,mixer,renderer;const host=root.current;setStatus('loading');
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(29,1,.05,50),clock=new THREE.Clock();let yaw=0,baseYaw=0,last=null,fitHeight=0,fitWidth=0,targetY=0;
  scene.add(new THREE.HemisphereLight(0xfff7e8,0x334051,2.2));const light=new THREE.DirectionalLight(0xffe8d4,2.4);light.position.set(3,5,4);scene.add(light);
  const loader=new GLTFLoader();loader.register(parser=>new VRMLoaderPlugin(parser));loader.register(parser=>new VRMAnimationLoaderPlugin(parser));
  function release(tree){const geometries=new Set(),materials=new Set(),textures=new Set(),skeletons=new Set();tree?.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.isSkinnedMesh&&o.skeleton)skeletons.add(o.skeleton);for(const m of Array.isArray(o.material)?o.material:[o.material])if(m){materials.add(m);for(const value of Object.values(m))if(value?.isTexture)textures.add(value);}});for(const t of textures)t.dispose();for(const m of materials)m.dispose();for(const g of geometries)g.dispose();for(const skeleton of skeletons)skeleton.dispose();}
  function resize(){if(!renderer)return;const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();if(fitHeight){const tangent=Math.tan(THREE.MathUtils.degToRad(camera.fov/2)),distance=Math.max(fitHeight/(2*tangent),fitWidth/(2*tangent*camera.aspect))*1.12;camera.position.set(0,targetY,distance);camera.lookAt(0,targetY,0);}}
  function animate(){if(disposed)return;frame=requestAnimationFrame(animate);if(document.hidden)return;const delta=Math.min(.05,clock.getDelta());mixer?.update(delta);vrm?.update(delta);if(vrm)vrm.scene.rotation.y=baseYaw+yaw;renderer.render(scene,camera);}
  const observer=new ResizeObserver(resize);observer.observe(host);
  const down=e=>{last=e.clientX;host.setPointerCapture?.(e.pointerId);},move=e=>{if(last===null)return;yaw+=(e.clientX-last)*.012;last=e.clientX;},up=()=>last=null;
  host.addEventListener('pointerdown',down);host.addEventListener('pointermove',move);host.addEventListener('pointerup',up);host.addEventListener('pointercancel',up);
  async function start(){try{
   renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0,0);host.appendChild(renderer.domElement);resize();
   const gltf=await loader.loadAsync('/cing-plaza/assets/cing-'+character+'-v01.vrm');if(disposed){release(gltf.scene);return;}vrm=gltf.userData.vrm;if(!vrm)throw new Error('Invalid VRM');VRMUtils.rotateVRM0(vrm);baseYaw=vrm.scene.rotation.y;preparePlazaAvatarV13(vrm);refinePlazaAvatarSurfaceV10(vrm.scene);scene.add(vrm.scene);
   const box=new THREE.Box3().setFromObject(vrm.scene),height=box.max.y-box.min.y,target=new THREE.Vector3(0,box.min.y+height*.5,0);fitHeight=height;fitWidth=(box.max.x-box.min.x)*.7;targetY=target.y;resize();
   setStatus('ready');animate();const animation=await loader.loadAsync('/cing-plaza/assets/cing-'+character+'-idle.vrma');if(disposed){release(animation.scene);return;}if(animation.userData.vrmAnimations?.[0]){mixer=new THREE.AnimationMixer(vrm.scene);mixer.clipAction(createVRMAnimationClip(animation.userData.vrmAnimations[0],vrm)).play();mixer.update(.1);vrm.update(.1);vrm.scene.updateMatrixWorld(true);const posed=new THREE.Box3().setFromObject(vrm.scene,true);fitHeight=posed.max.y-posed.min.y;fitWidth=posed.max.x-posed.min.x;targetY=(posed.max.y+posed.min.y)/2;resize();}release(animation.scene);
  }catch{if(!disposed)setStatus('error');}}
  void start();return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();host.removeEventListener('pointerdown',down);host.removeEventListener('pointermove',move);host.removeEventListener('pointerup',up);host.removeEventListener('pointercancel',up);mixer?.stopAllAction();release(vrm?.scene);renderer?.dispose();renderer?.forceContextLoss();renderer?.domElement.remove();};
 },[character]);
 return <div className="plaza-v16-preview"><div ref={root} className="plaza-v16-preview-canvas" aria-label="Xem nhân vật 3D"/>{status==='loading'&&<span className="plaza-v16-preview-status">Đang tải…</span>}{status==='error'&&<img className="plaza-v16-preview-fallback" src={`/cing-plaza/assets/v7/${character}-portrait.webp`} alt="Nhân vật của bạn"/>}<div className="plaza-v16-preview-title"><PlazaTitleV10 titleKey={titleKey} size="overhead"/></div><small>Vuốt để xoay nhân vật</small></div>;
}

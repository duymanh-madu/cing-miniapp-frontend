import {createFashionCacheV29} from './plazaFashionV29.js';
import {createAppearanceController} from './plazaAppearanceV27.js';
import React,{useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {VRMLoaderPlugin,VRMUtils} from '@pixiv/three-vrm';
import {VRMAnimationLoaderPlugin,createVRMAnimationClip} from '@pixiv/three-vrm-animation';
import {preparePlazaAvatarV13} from './plazaAvatarResourcesV13.js';
import {refinePlazaAvatarSurfaceV10} from './plazaAvatarSurfaceV10.js';
import PlazaTitleV10 from '../pages/PlazaTitleV10.jsx';
import {PLAZA_PREVIEW_INITIAL_ZOOM_V19,clampPlazaPreviewZoomV19,pinchPlazaPreviewZoomV19,clampPlazaPreviewVerticalPanV19,dragPlazaPreviewVerticalPanV19} from './plazaPreviewZoomV19.js';
import {computePlazaPreviewDistanceV19} from './plazaPreviewFitV19.js';
export default function PlazaAvatarPreviewV16({character,titleKey,appearance={},interactiveZoom=false}){
 const appearanceRef=useRef(appearance),appearanceController=useRef(null);appearanceRef.current=appearance;
 useEffect(()=>{appearanceController.current?.apply(appearance);},[appearance]);
 const root=useRef(null),zoomAction=useRef(null),resetAction=useRef(null),[status,setStatus]=useState('loading'),[zoomPercent,setZoomPercent]=useState(Math.round(PLAZA_PREVIEW_INITIAL_ZOOM_V19*100));
 useEffect(()=>{let disposed=false,frame=0,vrm,mixer,renderer;const host=root.current;setStatus('loading');
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(29,1,.05,50),clock=new THREE.Clock();let yaw=0,baseYaw=0,last=null,fitHeight=0,fitWidth=0,fitDepth=0,targetY=0,panY=0,visibleHeight=0,zoomScale=interactiveZoom?PLAZA_PREVIEW_INITIAL_ZOOM_V19:1; const pointers=new Map();
  scene.add(new THREE.HemisphereLight(0xfff7e8,0x334051,2.2));const light=new THREE.DirectionalLight(0xffe8d4,2.4);light.position.set(3,5,4);scene.add(light);
  const fashionRoots=[];
  const loader=new GLTFLoader();loader.register(parser=>new VRMLoaderPlugin(parser));loader.register(parser=>new VRMAnimationLoaderPlugin(parser));
  function release(tree){const geometries=new Set(),materials=new Set(),textures=new Set(),skeletons=new Set();tree?.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.isSkinnedMesh&&o.skeleton)skeletons.add(o.skeleton);for(const m of Array.isArray(o.material)?o.material:[o.material])if(m){materials.add(m);for(const value of Object.values(m))if(value?.isTexture)textures.add(value);}});for(const t of textures)t.dispose();for(const m of materials)m.dispose();for(const g of geometries)g.dispose();for(const skeleton of skeletons)skeleton.dispose();}
  function resize(){if(!renderer)return;const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();if(fitHeight){const tangent=Math.tan(THREE.MathUtils.degToRad(camera.fov/2)),distance=computePlazaPreviewDistanceV19({height:fitHeight,width:fitWidth,aspect:camera.aspect,fov:camera.fov,depth:fitDepth});const actualDistance=distance/zoomScale;visibleHeight=2*tangent*actualDistance;panY=interactiveZoom?clampPlazaPreviewVerticalPanV19(panY,fitHeight,visibleHeight):0;camera.position.set(0,targetY+panY,actualDistance);camera.lookAt(0,targetY+panY,0);}}
  function setZoom(next){if(!interactiveZoom)return;zoomScale=clampPlazaPreviewZoomV19(next);resize();setZoomPercent(Math.round(zoomScale*100));}
  zoomAction.current=setZoom;
  const resetView=()=>{yaw=0;panY=0;setZoom(PLAZA_PREVIEW_INITIAL_ZOOM_V19);};
  resetAction.current=resetView;
  function animate(){if(disposed)return;frame=requestAnimationFrame(animate);if(document.hidden)return;const delta=Math.min(.05,clock.getDelta());mixer?.update(delta);vrm?.update(delta);if(vrm)vrm.scene.rotation.y=baseYaw+yaw;renderer.render(scene,camera);}
  const contextLost=event=>{event.preventDefault();if(!disposed)setStatus('error');};
  const contextRestored=()=>{if(!disposed){resize();setStatus(v=>vrm?'ready':v);}};
  const observer=new ResizeObserver(resize);observer.observe(host);
  const down=e=>{if(e.pointerType==='mouse'&&e.button!==0)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});last=pointers.size===1?{x:e.clientX,y:e.clientY}:null;host.setPointerCapture?.(e.pointerId);};
  const move=e=>{const prior=pointers.get(e.pointerId);if(!prior)return;
    const before=[...pointers.values()];pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(interactiveZoom&&pointers.size===2){const after=[...pointers.values()];setZoom(pinchPlazaPreviewZoomV19(zoomScale,Math.hypot(before[0].x-before[1].x,before[0].y-before[1].y),Math.hypot(after[0].x-after[1].x,after[0].y-after[1].y)));last=null;return;}
    if(pointers.size===1&&last!==null){
      const dx=e.clientX-last.x,dy=e.clientY-last.y;
      // Horizontal drag ONLY rotates about world Y; vertical drag ONLY translates the view.
      yaw+=dx*.012;
      if(interactiveZoom){panY=dragPlazaPreviewVerticalPanV19(panY,dy,fitHeight,visibleHeight,host.clientHeight);resize();}
      last={x:e.clientX,y:e.clientY};
    }
  };
  const up=e=>{pointers.delete(e.pointerId);last=pointers.size===1?{...pointers.values().next().value}:null;};
  const wheel=e=>{if(!interactiveZoom)return;e.preventDefault();setZoom(zoomScale*(e.deltaY<0?1.10:.90));};
  const reset=()=>resetView();
  host.addEventListener('pointerdown',down);host.addEventListener('pointermove',move);host.addEventListener('pointerup',up);host.addEventListener('pointercancel',up);
  if(interactiveZoom){host.addEventListener('wheel',wheel,{passive:false});host.addEventListener('dblclick',reset);}
  async function start(){try{
   renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0,0);host.appendChild(renderer.domElement);renderer.domElement.addEventListener('webglcontextlost',contextLost);renderer.domElement.addEventListener('webglcontextrestored',contextRestored);resize();
   const gltf=await loader.loadAsync('/cing-plaza/assets/cing-'+character+'-v01.vrm');if(disposed){release(gltf.scene);return;}vrm=gltf.userData.vrm;if(!vrm)throw new Error('Invalid VRM');VRMUtils.rotateVRM0(vrm);baseYaw=vrm.scene.rotation.y;preparePlazaAvatarV13(vrm);refinePlazaAvatarSurfaceV10(vrm.scene);scene.add(vrm.scene);appearanceController.current=createAppearanceController(vrm.scene,{character,load:createFashionCacheV29(async file=>{const asset=await loader.loadAsync('/cing-plaza/assets/'+file);if(disposed){release(asset.scene);throw new Error('PREVIEW_DISPOSED');}fashionRoots.push(asset.scene);return asset;})});appearanceController.current.apply(appearanceRef.current);
   const box=new THREE.Box3().setFromObject(vrm.scene),height=box.max.y-box.min.y,target=new THREE.Vector3(0,box.min.y+height*.5,0);fitHeight=height;fitWidth=box.max.x-box.min.x;fitDepth=box.max.z-box.min.z;targetY=target.y;resize();
   setStatus('ready');animate();const animation=await loader.loadAsync('/cing-plaza/assets/cing-'+character+'-idle.vrma');if(disposed){release(animation.scene);return;}if(animation.userData.vrmAnimations?.[0]){mixer=new THREE.AnimationMixer(vrm.scene);mixer.clipAction(createVRMAnimationClip(animation.userData.vrmAnimations[0],vrm)).play();mixer.update(.1);vrm.update(.1);vrm.scene.updateMatrixWorld(true);const posed=new THREE.Box3().setFromObject(vrm.scene,true);fitHeight=posed.max.y-posed.min.y;fitWidth=posed.max.x-posed.min.x;fitDepth=posed.max.z-posed.min.z;targetY=(posed.max.y+posed.min.y)/2;resize();}release(animation.scene);
  }catch{if(!disposed)setStatus('error');}}
  void start();return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();host.removeEventListener('pointerdown',down);host.removeEventListener('pointermove',move);host.removeEventListener('pointerup',up);host.removeEventListener('pointercancel',up);host.removeEventListener('wheel',wheel);host.removeEventListener('dblclick',reset);pointers.clear();zoomAction.current=null;resetAction.current=null;mixer?.stopAllAction();appearanceController.current?.dispose();appearanceController.current=null;release(vrm?.scene);fashionRoots.forEach(release);renderer?.domElement.removeEventListener('webglcontextlost',contextLost);renderer?.domElement.removeEventListener('webglcontextrestored',contextRestored);renderer?.dispose();renderer?.forceContextLoss();renderer?.domElement.remove();};
 },[character,interactiveZoom]);
 return <div className="plaza-v16-preview"><div ref={root} className="plaza-v16-preview-canvas" aria-label="Xem nhân vật 3D"/>{status==='loading'&&<span className="plaza-v16-preview-status">Đang tải…</span>}{status==='error'&&<img className="plaza-v16-preview-fallback" src={`/cing-plaza/assets/v7/${character}-portrait.webp`} alt="Nhân vật của bạn"/>}<div className="plaza-v16-preview-title"><PlazaTitleV10 titleKey={titleKey} size="preview"/></div>{interactiveZoom&&<div className="plaza-v19-preview-zoom-controls" role="group" aria-label="Thu phóng nhân vật"><button type="button" aria-label="Phóng to nhân vật" onClick={()=>zoomAction.current?.(zoomPercent/100+0.25)}>＋</button><output aria-label="Mức phóng">{zoomPercent}%</output><button type="button" aria-label="Thu nhỏ nhân vật" onClick={()=>zoomAction.current?.(zoomPercent/100-0.25)}>−</button><button type="button" aria-label="Khôi phục góc nhìn toàn thân" onClick={()=>resetAction.current?.()} style={{fontSize:12}}>↺</button></div>}<small>{interactiveZoom?'Vuốt ngang: xoay · Vuốt dọc: xem chi tiết · Chụm: phóng':'Vuốt để xoay nhân vật'}</small></div>;
}

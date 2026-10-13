import {plazaFrameSecondsV20,movePlazaInSubsteps,updatePlazaVrmInSubsteps} from './plazaFrameStepsV20.js';
import {applyMobileFoliagePack,splitFoliageSpatially,removeBackgroundRefraction,simplifyBackgroundMaterials,auditPlazaGeometry} from './plazaMobileSceneV20.js';
import {rebuildMobileGroundV19} from './plazaMobileGroundV19.js';
import {createPlazaRefractionBudgetV19} from './plazaRefractionBudgetV19.js';
import {createPlazaGroundDetailV19} from './plazaGroundDetailV19.js';
import {createPlazaFrameProfiler} from '../../../qa/plazaFrameProfiler.js';
import {plazaRenderProfile} from '../../../qa/plazaRenderProfiles.js';
import {probePlazaAvatarGpu} from '../../../qa/plazaAvatarGpuProbe.js';
import {instancePlazaStaticMeshes} from './plazaStaticInstancesV19.js';
import {plazaCameraOccluderBoxes} from './plazaCameraOcclusionV19.js';
import {createPlazaFloorIndexV19} from './plazaFloorIndexV19.js';
import {createPlazaFramePacerV19} from './plazaFramePacerV19.js';
import {preparePlazaAvatarV13} from './plazaAvatarResourcesV13.js';
import {addCafeRoofLogoV11} from './plazaCafeRoofV11.js';
import {createPlazaLabelsV9} from './plazaLabelsV9.jsx';
import {createPlazaCameraV10} from "./plazaCameraV10.js";
import {refinePlazaAvatarSurfaceV10} from "./plazaAvatarSurfaceV10.js";
import {applyPlazaSeatedPose} from './plazaSeatedPoseV3.js';
import {createPlazaTableSignsV3} from './plazaTableSignsV3.js';
import * as THREE from 'three';
import {createPlazaRemoteAvatarsV2} from './plazaRemoteAvatarsV2.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { VRMAnimationLoaderPlugin, createVRMAnimationClip } from '@pixiv/three-vrm-animation';
import { batchPlazaMapV1 } from './batchPlazaMapV1.js';
import { createObstacleIndex, isSolidObstacle } from './plazaMotionV1.js';
import { refinePlazaMap, findTapPath, vietnamHour, timePalette } from './plazaRefinementsV2.js';
import { buildWorldV3, loadWorldAssets, WORLD_V3, PLAZA_FLOOR_NAME } from './plazaWorldV3.js';
import { createPlazaLightingV4, renderPlazaLayers } from './plazaLightingV4.js';
import { acceptsPavingEdge } from './plazaEntranceV6.js';
import { PLAZA_AVATARS, plazaWalkPlaybackRate, nextAvatarMotion, girlExpression } from './plazaAvatarV6.js';
import { applyPlazaMaterialsV1 } from './plazaMaterialsV1.js';

const FILES = {
  map: 'cing-plaza-map-v17.glb', boy: 'cing-boy-v01.vrm',
  idle: 'cing-boy-idle.vrma', walk: 'cing-boy-walk.vrma', wave: 'cing-boy-wave.vrma',
};
const floorName = PLAZA_FLOOR_NAME;

function disposeTree(root) {
  const geometries = new Set(), materials = new Set(), textures = new Set(), skeletons = new Set();
  root.traverse(object => {
    if (object.geometry) geometries.add(object.geometry);
    if (object.isSkinnedMesh && object.skeleton) skeletons.add(object.skeleton);
    const list = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of list) {
      if (!material) continue;
      materials.add(material);
      for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
      for(const uniform of Object.values(material.uniforms||{}))if(uniform.value?.isTexture)textures.add(uniform.value);
    }
  });
  skeletons.forEach(value => value.dispose());
  geometries.forEach(value => value.dispose());
  materials.forEach(value => value.dispose());
  textures.forEach(value => { value.dispose(); value.source?.data?.close?.(); });
}

export function createPlazaSceneV1(host, { onProgress = () => {}, onState = () => {}, onStats = () => {}, onNotice = () => {}, character = 'girl', adaptiveRefraction = false, qaTransmissionScale = 1, filteredMaterialNoise = false, subpixelGroundDetail = false, qaRenderProfile = 'control', mobileGround = false, mobileSceneBudget = false, qaBudgetSwitchable = false, qaFixedPixelRatio = null, onQAEvent = () => {}, onLocalState = () => {}, onPosition=()=>{} } = {}) {
  const renderProfile=plazaRenderProfile(qaRenderProfile);
  const avatarConfig = PLAZA_AVATARS[character] || PLAZA_AVATARS.girl;
  const walkSpeed = avatarConfig.speed;
  let expressionTime = 0;
  const scene = new THREE.Scene();
  const tableSigns=createPlazaTableSignsV3(scene);let authoritativeSeat=null,lastSeatId=null;
  scene.background = new THREE.Color('#f0e6d4');
  scene.fog = new THREE.Fog('#f0e6d4', 35, 90);
  const camera = new THREE.PerspectiveCamera(45, 1, 0.08, 120);
  const refractionBudget=createPlazaRefractionBudgetV19(camera);
  const mobile = window.matchMedia('(pointer: coarse)').matches;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'default' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  renderer.transmissionResolutionScale=qaTransmissionScale;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.debug.onShaderError=(gl,program,vertex,fragment)=>onQAEvent('shader-error',{program:gl.getProgramInfoLog(program),vertex:gl.getShaderInfoLog(vertex),fragment:gl.getShaderInfoLog(fragment)});
  const profiler=createPlazaFrameProfiler(renderer.getContext());
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  function renderFrame(viewCamera){const selection=adaptiveRefraction?refractionBudget.select(viewCamera):{camera:viewCamera,scale:qaTransmissionScale};renderer.transmissionResolutionScale=selection.scale;renderPlazaLayers(renderer,scene,selection.camera,renderProfile);}
  renderer.domElement.setAttribute('aria-label', 'Không gian Cing Plaza 3D');
  host.appendChild(renderer.domElement);
  let cameraOccluders=[];
  const controls=createPlazaCameraV10(camera,renderer.domElement,WORLD_V3.bounds,{floorAt:(x,z,hint)=>groundAt(x,z,hint),occluders:()=>cameraOccluders});
  if(mobileGround)controls.maxDistance=29.7;
  const cameraCenter=new THREE.Vector3();
  const hemisphere = new THREE.HemisphereLight('#fff4dd', '#796b53', 0.8);
  hemisphere.layers.enable(1);hemisphere.layers.enable(2);scene.add(hemisphere);
  const sun = new THREE.DirectionalLight('#fff0d5', 2.0);
  sun.position.set(-10, 24, 12);
  sun.target.position.set(0, 0, -3);
  sun.layers.enable(1);sun.layers.enable(2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -27; sun.shadow.camera.right = 27;
  sun.shadow.camera.top = 27; sun.shadow.camera.bottom = -27;
  sun.shadow.camera.far = 70; sun.shadow.normalBias = 0.03;
  scene.add(sun, sun.target);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environmentScene = new RoomEnvironment();
  const environmentTarget = pmrem.fromScene(environmentScene, 0.04);
  scene.environment = environmentTarget.texture;
  scene.environmentIntensity = 0.65;
  environmentScene.dispose();
  pmrem.dispose();

  const abort = new AbortController();
  const loader = new GLTFLoader();
  loader.register(parser => new VRMLoaderPlugin(parser));
  loader.register(parser => new VRMAnimationLoaderPlugin(parser));
  let contextLost = false, restoreTimer = null;
  let disposed = false, raf = 0, vrm = null, mixer = null, currentAction = null;
  let state = 'idle', waveRequested = false, waveFinished = false, loaded = false;
  let input = { x: 0, z: 0 }, map = null, floors = [], collision = () => false;
  let groundY = 0, soleOffset = 0, stats = {}, preset = 'follow';
  const groundViewport=new THREE.Vector2();let groundDetail=null;
  let world = null, worldAssets = null, cafeRoof = null, interactionPaused=false, backgroundRenderAt=0;
  let walkPlayback = 1;
  let materialResources = null, path = [], walkLift = .035, lift = 0, clockMinute = '';
  const marker = new THREE.Mesh(new THREE.RingGeometry(.16, .22, 32), new THREE.MeshBasicMaterial({ color: '#e7a34a', side: THREE.DoubleSide, transparent: true, opacity: .85, depthWrite: false }));
  marker.rotation.x = -Math.PI / 2; marker.visible = false; scene.add(marker);
  function updateLighting() {
    const minute = new Date().toISOString().slice(0, 16);
    if (minute === clockMinute) return; clockMinute = minute;
    const palette = timePalette(vietnamHour());
    scene.background.copy(palette.background); scene.fog.color.copy(palette.background);
    hemisphere.intensity = palette.hemisphere; hemisphere.color.copy(palette.light);
    sun.intensity = palette.sun; sun.color.copy(palette.light);
    renderer.toneMappingExposure = palette.exposure; scene.environmentIntensity = palette.environment;
    lighting.apply(palette,hemisphere,renderer,sun);
    stats = { ...stats, timeOfDay: palette.label };
  }
  function stopPath() { path = []; marker.visible = false; }
  const actions = {};
  let pendingMembers=[],pendingSelfId=null;
  let netSeq=0, netLast=-Infinity, netValue=null, gesture=0, initialPresence=null;
  const labels=createPlazaLabelsV9(host);let labelIdentity={},labelMember={},labelLast=-Infinity;const headPosition=new THREE.Vector3();
  const remote=createPlazaRemoteAvatarsV2({scene,load,onNotice,avatarPreparation:renderProfile,physicsSubsteps:mobileSceneBudget});
  const spawn = new THREE.Vector3(0, 0, 2.5);
  const forward = new THREE.Vector3(), right = new THREE.Vector3(), movement = new THREE.Vector3();
  const ray = new THREE.Raycaster();
  const normalMatrix = new THREE.Matrix3();
  const normal = new THREE.Vector3();
  const avatar = new THREE.Group();
  scene.add(avatar);
  const lighting=createPlazaLightingV4(scene,camera,avatar,{mobileBudget:mobileSceneBudget});
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = shadowCanvas.height = 128;
  const context = shadowCanvas.getContext('2d');
  const gradient = context.createRadialGradient(64, 64, 8, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(30,20,10,0.36)');
  gradient.addColorStop(1, 'rgba(30,20,10,0)');
  context.fillStyle = gradient; context.fillRect(0, 0, 128, 128);
  const contact = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.6), new THREE.MeshBasicMaterial({
    map: new THREE.CanvasTexture(shadowCanvas), transparent: true, depthWrite: false,
    polygonOffset: true, polygonOffsetFactor: -2,
  }));
  contact.rotation.x = -Math.PI / 2;
  scene.add(contact);

  const assetRoot = new URL(`${import.meta.env.BASE_URL || '/'}cing-plaza/assets/`, window.location.origin);
  async function load(file) {
    const assetURL=new URL(file,assetRoot);if(/cing-(boy|girl)-(idle|walk)\.vrma$/.test(file))assetURL.searchParams.set('v','15');
    const response = await fetch(assetURL, { signal: abort.signal });
    if (!response.ok) throw new Error(`Không tải được ${file} (${response.status}).`);
    const buffer = await response.arrayBuffer();
    if (disposed) throw new DOMException('Disposed', 'AbortError');
    if (buffer.byteLength < 20 || new DataView(buffer).getUint32(0, true) !== 0x46546c67) {
      throw new Error(`File ${file} không phải GLB/VRM hợp lệ.`);
    }
    const gltf = await loader.parseAsync(buffer, assetRoot.href);
    if (disposed) { if (gltf.scene) disposeTree(gltf.scene); throw new DOMException('Disposed', 'AbortError'); }
    return gltf;
  }

  function groundAt(x, z, fromY) {
    ray.set(floorOrigin.set(x,fromY+.3,z),floorDirection);floorHits.length=0;
    ray.near = 0; ray.far = 2;
    for (const hit of ray.intersectObjects(floorIndex?floorIndex.query(x,z):floors, false,floorHits)) {
      if (!hit.face) continue;
      normalMatrix.getNormalMatrix(hit.object.matrixWorld);
      normal.copy(hit.face.normal).applyNormalMatrix(normalMatrix);
      if (normal.y > 0.65) return /^(Courtyard_Ground|V17_Ground_Extension)/.test(hit.object.name) ? Math.max(.036, hit.point.y) : hit.point.y;
    }
    return null;
  }

  function changeAction(next) {
    if (state === next && currentAction) return;
    const old = currentAction;
    state = next; currentAction = actions[next];
    if(next==='wave'||next==='checkin')gesture++;
    currentAction.reset().setEffectiveWeight(1).setEffectiveTimeScale(1).play();
    if (old && old !== currentAction) currentAction.crossFadeFrom(old, character === 'girl' ? .26 : .18, false);
    waveRequested = false; waveFinished = false;
    onState(next);
  }

  function cameraPreset(next) {
    if (disposed) return;
    preset = next;
    camera.fov = 45; camera.updateProjectionMatrix();
    const target = avatar.position.clone().add(new THREE.Vector3(0, 0.9, 0));
    if (next === 'overview') {
      controls.target.set(9.5, 1, -12.5);
      camera.position.set(44, 40, 43);
    } else {
      controls.target.copy(target);
      camera.position.copy(target).add(next === 'close' ? new THREE.Vector3(0.4, 0.65, 3) : new THREE.Vector3(2.6, 1.8, 4.1));
    }
    controls.sync();controls.update();
  }

  function tryStep(x, z) {
    const y = groundAt(x, z, groundY);
    if (y === null || y - groundY > 0.24 || groundY - y > 0.38 || collision(x, z, y) || world?.doorBlocked(x, z, y)) return false;
    avatar.position.x = x; avatar.position.z = z;
    groundY = y; avatar.position.y = y + soleOffset + lift;
    return true;
  }

  function resize() {
    if (disposed) return;
    const width = Math.max(1, host.clientWidth), height = Math.max(1, host.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height; camera.updateProjectionMatrix();
    // The user radius is unchanged by resize, movement or map boundaries.
  }
  const observer = new ResizeObserver(resize);
  observer.observe(host); resize();
  const oldPosition=new THREE.Vector3(),floorHits=[],floorOrigin=new THREE.Vector3(),floorDirection=new THREE.Vector3(0,-1,0);
  let floorIndex=null;const framePacer=createPlazaFramePacerV19(60);
  let last = performance.now(), statLast = last, frames = 0;
  function tick(now) {
    if (disposed || contextLost) return;
    raf = 0;
    if (document.hidden) return;
    if(!framePacer.shouldRender(now)){raf=requestAnimationFrame(tick);return;}
    try {
    const dt = plazaFrameSecondsV20(now,last,mobileSceneBudget?.2:.05); last = now;
    profiler.beginFrame(now);
    updateLighting(); world?.updateDoors(avatar.position, dt, remote.positions());
    oldPosition.copy(avatar.position);
    camera.getWorldDirection(forward); forward.y = 0; forward.normalize();
    right.crossVectors(forward, camera.up).normalize();
    movement.copy(forward).multiplyScalar(input.z).addScaledVector(right, input.x);
    if (movement.lengthSq() > 1) movement.normalize();
    if (path.length && movement.lengthSq() < .001) {
      while (path.length && Math.hypot(path[0].x - avatar.position.x, path[0].z - avatar.position.z) < .055) path.shift();
      if (path.length) {
        movement.set(path[0].x - avatar.position.x, 0, path[0].z - avatar.position.z);
        const length = movement.length(); movement.normalize().multiplyScalar(Math.min(1, length / (walkSpeed * dt || .001)));
      } else stopPath();
    }
    const distance = walkSpeed * dt;
    let moved = false;
    if (authoritativeSeat)movement.set(0,0,0);
    if (movement.lengthSq() > 0.001) {
      if(mobileSceneBudget)moved=movePlazaInSubsteps(avatar.position,movement,walkSpeed,dt,tryStep);
      else{
        moved = tryStep(avatar.position.x + movement.x * distance, avatar.position.z + movement.z * distance);
        if (!moved) {const movedX = tryStep(avatar.position.x + movement.x * distance, avatar.position.z),movedZ = tryStep(avatar.position.x, avatar.position.z + movement.z * distance);moved=movedX||movedZ;}
      }
      if(!moved&&path.length&&!world?.waitingAtDoor(avatar.position)){stopPath();onNotice('Lối đi đang bị chắn. Hãy chọn điểm khác.');}
      const heading = Math.atan2(movement.x, movement.z);
      const delta = Math.atan2(Math.sin(heading - avatar.rotation.y), Math.cos(heading - avatar.rotation.y));
      avatar.rotation.y += delta * Math.min(1, dt * 14);
    }
    changeAction(authoritativeSeat?'sit':nextAvatarMotion(state, moved, waveRequested, waveFinished));
    const actualSpeed = Math.hypot(avatar.position.x-oldPosition.x,avatar.position.z-oldPosition.z)/(dt||1);
    // Match the authored foot speed to actual travel, including partial joystick input.
    walkPlayback=moved ? plazaWalkPlaybackRate(avatarConfig,actualSpeed) : 0;
    actions.walk.setEffectiveTimeScale(walkPlayback);
    mixer.update(dt);
    if (character === 'girl') { expressionTime += dt; const expression = girlExpression(expressionTime,state); for (const [name,value] of Object.entries(expression)) vrm.expressionManager?.setValue(name,value); }
    if(authoritativeSeat)applyPlazaSeatedPose(vrm);
    if(mobileSceneBudget)updatePlazaVrmInSubsteps(vrm,dt);else vrm.update(dt);
    lift = walkLift * (actions.walk.isRunning() ? actions.walk.getEffectiveWeight() : 0);
    avatar.position.y = authoritativeSeat?authoritativeSeat.y:groundY + soleOffset + lift;
    contact.visible=!authoritativeSeat;
    contact.position.set(avatar.position.x, groundY + 0.009, avatar.position.z);
    const packet={x:avatar.position.x,y:avatar.position.y,z:avatar.position.z,heading:avatar.rotation.y,motion:state,character,phase:currentAction.time,speed:Math.min(1.6,actualSpeed),gesture};
    const changed=!netValue || Math.hypot(packet.x-netValue.x,packet.y-netValue.y,packet.z-netValue.z)>.001 || Math.abs(packet.heading-netValue.heading)>.002 || packet.motion!==netValue.motion || packet.gesture!==netValue.gesture;
    onPosition(packet);
    if(now-netLast>=100 && (changed || now-netLast>=500)){netLast=now;netValue=packet;onLocalState({...packet,seq:++netSeq});}
    controls.update(cameraCenter.set(avatar.position.x,avatar.position.y+.9,avatar.position.z));
    if(groundDetail)Object.assign(stats,groundDetail.update(camera,renderer.getSize(groundViewport).y,renderer.getPixelRatio()));
    remote.update(dt,camera); cafeRoof?.update(camera,avatar,dt); lighting.update(dt); if(now-labelLast>=50){labelLast=now;labels.update(camera,[{...labelIdentity.identity,...labelMember,memberId:labelIdentity.selfId,position:vrm.humanoid.getNormalizedBoneNode('head')?.getWorldPosition(headPosition)||headPosition.copy(avatar.position).add(new THREE.Vector3(0,1.4,0))},...remote.anchors()]);} if(!interactionPaused||now-backgroundRenderAt>200){profiler.beginRender();try{renderFrame(camera);}finally{profiler.endRender();}backgroundRenderAt=now;}
    profiler.endFrame();
    frames++;
    if (now - statLast >= 1000) {
      stats = { ...stats, frameTiming:profiler.snapshot(),fps: Math.round(frames * 1000 / (now - statLast)), calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, ...remote.stats(),textures:renderer.info.memory.textures,geometries:renderer.info.memory.geometries,antialias:renderer.getContext().getContextAttributes().antialias,dpr:renderer.getPixelRatio(),cameraRadius:controls.requestedRadius, motion: state, x: avatar.position.x, z: avatar.position.z, groundY };
      // Keep pixel density stable: low FPS must not reduce visual quality.
      onStats(stats); frames = 0; statLast = now;
    }
    raf = requestAnimationFrame(tick);
    } catch (error) {
      onQAEvent("render-loop-error",{name:error.name,message:error.message});
      // An exception in the render loop previously stopped RAF silently, leaving a blank scene
      // and a still-active HUD. Fail visibly so the existing Retry button can rebuild the scene.
      input={x:0,z:0};stopPath();cancelAnimationFrame(raf);raf=0;
      if(!disposed&&!contextLost)onProgress({ready:false,error:'Cảnh 3D gặp lỗi khi hiển thị. Hãy chọn Mở lại.'});
    }
  }
  function onVisibility() {
    onQAEvent("scene-visibility",{hidden:document.hidden});
    input = { x: 0, z: 0 }; stopPath();controls.cancelGestures();
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0;clearTimeout(restoreTimer); }
    else if(contextLost)armRestoreTimeout();
    else if (loaded && !disposed && !contextLost && !raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
  }
  function onContextLost(event) {
    onQAEvent("webglcontextlost",{message:event.statusMessage||""});
    event.preventDefault();if(disposed)return;contextLost=true;
    input={x:0,z:0};stopPath();cancelAnimationFrame(raf);raf=0;
    onProgress({text:'Đang khôi phục hiển thị 3D…',percent:100});
    armRestoreTimeout();
  }
  function armRestoreTimeout(){
    clearTimeout(restoreTimer);
    if(document.hidden||disposed)return;
    restoreTimer=setTimeout(()=>{if(!disposed&&contextLost&&!document.hidden){dispose();onProgress({error:'Thiết bị chưa khôi phục được hiển thị 3D. Hãy bấm Mở lại.'});}},12000);
  }
  function onContextRestored(){
    onQAEvent("webglcontextrestored",{});
    if(disposed)return;contextLost=false;clearTimeout(restoreTimer);
    renderer.shadowMap.needsUpdate=true;resize();last=performance.now();
    if(loaded){onProgress({ready:true,percent:100});if(!document.hidden&&!raf)raf=requestAnimationFrame(tick);}
  }
  document.addEventListener('visibilitychange', onVisibility);
  renderer.domElement.addEventListener('webglcontextlost', onContextLost);
  renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

  function dispose() {
    if (disposed) return;
    disposed = true; clearTimeout(restoreTimer); loaded = false; abort.abort(); cancelAnimationFrame(raf);
    observer.disconnect(); controls.dispose();remote.dispose();labels.dispose();
    document.removeEventListener('visibilitychange', onVisibility);
    renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
    renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
    if (mixer) { mixer.stopAllAction(); mixer.uncacheRoot(vrm.scene); }
    profiler.dispose();groundDetail?.dispose();disposeTree(scene); worldAssets?.dispose(); materialResources?.dispose(); environmentTarget.dispose();
    sun.shadow.map?.dispose(); renderer.dispose(); renderer.forceContextLoss();
    renderer.domElement.remove();
    floors = []; map = null; collision = () => false;
  }

  const ready = (async () => {
    try {
      onProgress({ text: 'Đang mở không gian Kinh Bắc…', percent: 8 });
      const mapFile = await load(FILES.map);
      if (mapFile.animations.length) throw new Error('Map đang chứa animation; cần dùng bản cảnh riêng.');
      let hasAvatar = false;
      mapFile.scene.traverse(object => { if (object.isSkinnedMesh || /CING_(BOY|GIRL).*ARMATURE/i.test(object.name)) hasAvatar = true; });
      if (hasAvatar) { disposeTree(mapFile.scene); throw new Error('Map còn chứa nhân vật. Hãy xuất lại phần cảnh riêng.'); }
      map = mapFile.scene;
      if(mobileSceneBudget){const urls=['foliage.json','foliage.bin'].map(file=>new URL('mobile-scene/'+file,assetRoot));const responses=await Promise.all(urls.map(url=>fetch(url,{signal:abort.signal})));if(responses.some(r=>!r.ok))throw Error('Thiếu bản cây/hoa mobile');const manifest=await responses[0].json(),buffer=await responses[1].arrayBuffer();const pack=applyMobileFoliagePack(map,manifest,buffer);onQAEvent('mobile-foliage-pack',pack);}
      const refinements = refinePlazaMap(map); scene.add(map); map.updateMatrixWorld(true);
      onProgress({ text: 'Đang dựng cửa hàng và các góc check-in…', percent: 22 });
      worldAssets = await loadWorldAssets(assetRoot, abort.signal);
      if (disposed) { worldAssets.dispose(); worldAssets.logo.dispose(); worldAssets.logo.source.data.close(); throw new DOMException('Disposed', 'AbortError'); }
      let mobileTextures=null;
      if(mobileGround){const textureLoader=new THREE.TextureLoader();const [color,normal,ao]=await Promise.all(['color','normal','ao'].map(name=>textureLoader.loadAsync(new URL('mobile-ground/'+name+'.png',assetRoot).href)));color.colorSpace=THREE.SRGBColorSpace;for(const t of [color,normal,ao]){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());}mobileTextures={color,normal,ao};}
      world = buildWorldV3(map, { logo: worldAssets.logo,...(mobileTextures?{groundFactory:(root,bounds)=>rebuildMobileGroundV19(root,bounds,mobileTextures)}:{}) }); floors.push(...world.floors);
      cafeRoof=await addCafeRoofLogoV11(map,assetRoot,abort.signal);
      lighting.attachWorld(world); clockMinute=''; updateLighting();
      const materialResponse = await fetch(new URL('cing-plaza-materials.json', assetRoot), { signal: abort.signal });
      if (!materialResponse.ok) throw new Error('Thiếu dữ liệu vật liệu của map.');
      const materialData = await materialResponse.json();
      if (disposed) throw new DOMException('Disposed', 'AbortError');
      materialResources = applyPlazaMaterialsV1(map, materialData,{retiredMaterials:world.dinhV12.retiredMaterials,filteredNoise:filteredMaterialNoise});
      const obstacles = [...world.obstacles];
      map.traverse(object => {
        if (!object.isMesh) return;
        const thinGlass=(Array.isArray(object.material)?object.material:[object.material]).filter(m=>/Clear_Glass|Door_Clear_Glass/.test(m.name));
        if(thinGlass.length){for(const m of thinGlass){m.transmission=0;m.transparent=true;m.opacity=.16;m.depthWrite=false;m.roughness=.045;m.color.set('#c7d5d2');}object.layers.set(2);}
        object.castShadow = !object.userData.plazaDynamic; object.receiveShadow = true;
        if (floors.includes(object)) return;
        if (floorName.test(object.name)) { floors.push(object); return; }
        if (object.userData.plazaCollision === false || object.userData.plazaDynamic) return;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        if (!isSolidObstacle(materials.map(material => material.name))) return;
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());
        // Ignore hairline decorations but retain walls, columns, chairs, pots.
        if (size.x < 0.06 || size.z < 0.06 || size.y < 0.12 || box.min.y > 3 || box.max.y < 0.1) return;
        obstacles.push({ minX: box.min.x, maxX: box.max.x, minZ: box.min.z, maxZ: box.max.z, minY: box.min.y, maxY: box.max.y });
      });
      if (!floors.length) throw new Error('Không tìm thấy mặt sân của map.');
      collision = createObstacleIndex(obstacles);
      cameraOccluders=plazaCameraOccluderBoxes(obstacles);
      onProgress({ text: 'Đang chuẩn bị cửa hàng và sân đình…', percent: 35 });
      if(mobileSceneBudget){
        const before=auditPlazaGeometry(map),split=splitFoliageSpatially(map),refraction=removeBackgroundRefraction(map),background=simplifyBackgroundMaterials(map,materialData);
        for(const m of [...world.nightMaterials]){const copy=refraction.replacements.get(m);if(copy)world.nightMaterials.push(copy);}
        for(const m of [...world.nightMaterials]){const copy=background.replacements.get(m);if(copy)world.nightMaterials.push(copy);}
        world.cafeLeafSources.length=0;world.cafeTreeV15.added.length=0;
        onQAEvent('mobile-scene-budget',{before,after:auditPlazaGeometry(map),split,background:{meshesChanged:background.meshesChanged,materialsChanged:background.materialsChanged,proceduralMaterials:background.proceduralMaterials},refraction:{meshesChanged:refraction.meshesChanged,materialsChanged:refraction.materialsChanged}});
      }
      const preserveStatic=new Set([...floors,...world.preserved,...cafeRoof.preserved]);
      const instancing=instancePlazaStaticMeshes(map,{preserved:preserveStatic});
      const batching = await batchPlazaMapV1(map, { preserved: new Set([...floors, ...world.preserved,...cafeRoof.preserved,...((subpixelGroundDetail||qaBudgetSwitchable)?world.groundV7.meshes:[])]), cancelled: () => disposed });
      if (disposed) { disposeTree(mapFile.scene); throw new DOMException('Disposed', 'AbortError'); }
      if(!mobileGround&&(subpixelGroundDetail||qaBudgetSwitchable)){groundDetail=createPlazaGroundDetailV19(world.groundV7.meshes);groundDetail.setEnabled(subpixelGroundDetail);}
      refractionBudget.setWorld(map);
      floorIndex=createPlazaFloorIndexV19(floors);
      stats = { ...stats, ...refinements, ...world.stats, floorCount:floors.length,floorIndexCells:floorIndex.cellCount,mapDrawsBefore: batching.before, mapDrawsAfter: batching.after };
      onProgress({ text: 'Đang chuẩn bị nhân vật…', percent: 55 });
      const modelFile = await load(avatarConfig.model);
      vrm = modelFile.userData.vrm;
      if (!vrm) { disposeTree(modelFile.scene); throw new Error('Không đọc được nhân vật VRM.'); }
      VRMUtils.rotateVRM0(vrm);preparePlazaAvatarV13(vrm,renderProfile);refinePlazaAvatarSurfaceV10(vrm.scene);remote.seed(character,vrm);
      avatar.add(vrm.scene);
      vrm.scene.traverse(object => { if (object.isMesh) { object.layers.set(1);object.frustumCulled = false; object.castShadow = false; object.receiveShadow = false; } });
      mixer = new THREE.AnimationMixer(vrm.scene);
      for (const [index, name] of Object.keys(avatarConfig).filter(name => ['idle','walk','wave','checkin'].includes(name)).entries()) {
        onProgress({ text: 'Đang chuẩn bị chuyển động…', percent: 72 + index * 8 });
        const animationFile = await load(avatarConfig[name]);
        const animation = animationFile.userData.vrmAnimations?.[0];
        if (!animation) throw new Error(`Không đọc được chuyển động ${name}.`);
        remote.setAnimation(character,name,animation);
        const clip = createVRMAnimationClip(animation, vrm);
        clip.name = `Cing_${character}_${name}`;
        const action = mixer.clipAction(clip);
        action.setLoop(['wave','checkin'].includes(name) ? THREE.LoopOnce : THREE.LoopRepeat, ['wave','checkin'].includes(name) ? 1 : Infinity);
        action.clampWhenFinished = ['wave','checkin'].includes(name);
        actions[name] = action;
        disposeTree(animationFile.scene);
      }
      actions.sit=actions.idle;
      mixer.addEventListener('finished', event => { if (event.action === actions.wave || event.action === actions.checkin) waveFinished = true; });
      changeAction('idle'); mixer.update(0); vrm.update(0); avatar.updateMatrixWorld(true);
      const idleSole = new THREE.Box3().setFromObject(vrm.scene, true).min.y;
      soleOffset = -idleSole + .004;
      actions.idle.stop(); actions.walk.reset().play();
      let walkSole = idleSole;
      for (let i = 0; i < 32; i++) {
        mixer.setTime(actions.walk.getClip().duration * i / 32); vrm.update(0); avatar.updateMatrixWorld(true);
        walkSole = Math.min(walkSole, new THREE.Box3().setFromObject(vrm.scene, true).min.y);
      }
      walkLift = Math.max(0,idleSole-walkSole+.001);
      actions.walk.stop(); actions.idle.reset().play(); mixer.setTime(0); vrm.update(0);
      stats.staticInstancedObjects=instancing.instancedObjects;stats.staticDrawCallsSaved=instancing.drawCallsSaved;
      stats.walkLift = walkLift; stats.character = character; updateLighting();
      groundY = groundAt(spawn.x, spawn.z, 0.1) ?? 0;
      avatar.position.set(spawn.x, groundY + soleOffset, spawn.z);
      cameraPreset('follow'); contact.position.set(spawn.x, groundY + 0.009, spawn.z);
      renderer.shadowMap.needsUpdate = true;
      if(initialPresence){netSeq=Math.max(netSeq,initialPresence.seq||0);avatar.position.set(initialPresence.x,initialPresence.y,initialPresence.z);groundY=groundAt(initialPresence.x,initialPresence.z,initialPresence.y)??groundY;avatar.rotation.y=initialPresence.heading;cameraPreset('follow');}
      if(initialPresence?.seatId){authoritativeSeat=initialPresence;lastSeatId=initialPresence.seatId;}
      loaded = true; remote.setMembers(pendingMembers,pendingSelfId); if(!contextLost)onProgress({ ready: true, percent: 100 });
      onStats(stats); last = performance.now();
      if (!document.hidden && !contextLost) raf = requestAnimationFrame(tick);
      return stats;
    } catch (error) {
      const wasDisposed = disposed;
      dispose();
      if (!wasDisposed && error.name !== 'AbortError') onProgress({ error: error.message || 'Chưa mở được không gian 3D.' });
      throw error;
    }
  })();

  return {
    ready, dispose,
    setIdentity:value=>{labelIdentity=value||{};labels.setMessages(labelIdentity.roomId,labelIdentity.messages);},
    correct:value=>{
      if(!loaded||disposed||!value||![value.x,value.y,value.z,value.heading].every(Number.isFinite))return;
      netSeq=Math.max(netSeq,Number.isSafeInteger(value.seq)?value.seq:0);
      const deviation=Math.hypot(avatar.position.x-value.x,avatar.position.y-value.y,avatar.position.z-value.z);
      // Authoritative coordinates ALWAYS win. Only small reconciliation preserves navigation.
      // Real displacement beyond 0.12m still stops the path (anti-teleport authority unchanged).
      avatar.position.set(value.x,value.y,value.z);
      groundY=groundAt(value.x,value.z,value.y)??groundY;
      avatar.rotation.y=value.heading;
      netValue=null; // the next 100ms state publishes the corrected authoritative location
      if(deviation>0.12)stopPath();
      controls.update(cameraCenter.set(avatar.position.x,avatar.position.y+.9,avatar.position.z));
    },
    setTables:tables=>tableSigns.update(tables),
    setMembers:(members,selfId)=>{
      const own=members?.find(v=>v.memberId===selfId);labelMember=own||{};
      if(own && loaded && (own.seatId||null)!==lastSeatId){authoritativeSeat=own.seatId?own:null;lastSeatId=own.seatId||null;input={x:0,z:0};stopPath();avatar.position.set(own.x,own.y,own.z);avatar.rotation.y=own.heading;groundY=groundAt(own.x,own.z,Math.max(own.y,0))??groundY;controls.update(cameraCenter.set(avatar.position.x,avatar.position.y+.9,avatar.position.z));}

      if(!loaded && !initialPresence)initialPresence=members?.find(v=>v.memberId===selfId)||null;
      pendingMembers=members||[];pendingSelfId=selfId;
      if(loaded)remote.setMembers(pendingMembers,pendingSelfId);
    },
    setInteractionPaused:value=>{const wasPaused=interactionPaused;interactionPaused=Boolean(value);if(interactionPaused){input={x:0,z:0};stopPath();controls.cancelGestures();}else if(wasPaused&&loaded&&!disposed&&!contextLost){resize();backgroundRenderAt=-Infinity;renderer.shadowMap.needsUpdate=true;}},
    cancelGestures:()=>controls.cancelGestures(),
    setInput: value => { if (!disposed) { input = { x: value.x, z: value.z }; if (Math.hypot(value.x, value.z) > .01) stopPath(); } },
    stop: () => { input = { x: 0, z: 0 }; stopPath(); },
    tap: (clientX, clientY) => {
      if (!loaded || disposed || authoritativeSeat) return;
      const rect = renderer.domElement.getBoundingClientRect();
      ray.near = 0; ray.far = 120;
      ray.setFromCamera(new THREE.Vector2((clientX - rect.left) / rect.width * 2 - 1, -(clientY - rect.top) / rect.height * 2 + 1), camera);
      const hit = ray.intersectObject(map, true)[0];
      const surfaceY = hit ? groundAt(hit.point.x, hit.point.z, Math.max(groundY,hit.point.y)) : null;
      const horizontal = hit?.face && Math.abs(hit.face.normal.clone().applyNormalMatrix(new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld)).y) > .65;
      const hitMaterials=hit ? (Array.isArray(hit.object.material)?hit.object.material:[hit.object.material]).map(m=>m.name) : [];
      const pavingEdge=hit && acceptsPavingEdge(hitMaterials,hit.point.y,surfaceY);
      if (!hit || (!floors.includes(hit.object) && !pavingEdge && !(horizontal && surfaceY !== null && Math.abs(hit.point.y - surfaceY) < .12))) { onNotice('Chạm lên mặt sân hoặc lối đi để chọn đích đến.'); return; }
      const target = { x: hit.point.x, z: hit.point.z };
      // Use height differences along every path edge, not one fixed height for
      // the whole route. This permits staircases and rejects platform-side jumps.
      const level=Math.max(groundY,surfaceY??groundY),cache=new Map();
      const surface=(x,z)=>{
        const k=`${x.toFixed(3)},${z.toFixed(3)}`;
        if(!cache.has(k)){const y=groundAt(x,z,level);cache.set(k,{y,ok:y!==null&&!collision(x,z,y)});}
        return cache.get(k);
      };
      const walkable=(x,z)=>surface(x,z).ok;
      const canTraverse=(a,b)=>{const from=surface(a.x,a.z).y,to=surface(b.x,b.z).y;return from!==null&&to!==null&&to-from<=.24+1e-6&&from-to<=.38+1e-6;};
      const result=findTapPath(avatar.position,target,walkable,{canTraverse});
      if (!result) { onNotice('Chưa có lối đi tới điểm này. Hãy chọn điểm gần hơn trên cùng mặt sân.'); return; }
      input = { x: 0, z: 0 }; path = result;
      marker.position.set(target.x, hit.point.y + .015, target.z); marker.visible = true;
      onNotice('Đang đi tới điểm đã chọn. Chạm vị trí khác để đổi đích.');
    },
    wave: () => { if (loaded && state !== 'wave') { stopPath(); waveRequested = 'wave'; } },
    pose: () => { if (loaded && !disposed && actions.checkin) { input={x:0,z:0}; stopPath(); waveRequested='checkin'; } },
    cameraPreset,
    zoom: direction => {if(!disposed&&loaded)controls.zoom(direction);},
    checkin: kind => {
      if (!loaded || disposed || !WORLD_V3.spots[kind]) return;
      const spot = WORLD_V3.spots[kind], [x,,z] = spot.position;
      const y = groundAt(x,z,.3);
      if (y === null || collision(x,z,y)) { onNotice('Góc chụp đang bị chắn. Hãy chọn điểm gần đó trên sân.'); return; }
      input = { x:0,z:0 }; stopPath(); groundY = y; lift = 0;
      avatar.position.set(x,y+soleOffset,z);
      changeAction('idle'); preset = 'overview';
      camera.fov = 52; camera.updateProjectionMatrix(); camera.position.set(...spot.camera); controls.target.set(...spot.target);
      if(camera.aspect<1.05){const shift=kind==='cafe'?.50:0;camera.position.sub(controls.target).multiplyScalar(1.28).add(controls.target);camera.position.x+=shift;controls.target.x+=shift;}
      controls.sync();
      avatar.rotation.y = Math.atan2(camera.position.x-x,camera.position.z-z);
      controls.update(); onNotice('Góc check-in đã sẵn sàng.');
    },
    reset: () => {
      if (!loaded || disposed) return;
      input = { x: 0, z: 0 }; stopPath(); lift = 0; avatar.rotation.y = 0;
      groundY = groundAt(spawn.x, spawn.z, 0.1) ?? 0;
      avatar.position.set(spawn.x, groundY + soleOffset, spawn.z);
      changeAction('idle'); cameraPreset('follow');
    },
    setQABudgetProfile:profile=>{
      if(!qaBudgetSwitchable||disposed||contextLost||!loaded)return false;
      subpixelGroundDetail=['ground','combined'].includes(profile);
      adaptiveRefraction=['refraction','combined'].includes(profile);
      groundDetail?.setEnabled(subpixelGroundDetail);profiler.reset();frames=0;statLast=performance.now();return true;
    },
    prewarmQABudget:()=>{
      // Keep natural frame-by-frame warm-up; do not render the entire map or
      // allocate every transmission target synchronously on a mobile GPU.
      if(disposed||contextLost||!loaded)return false;
      profiler.reset();frames=0;statLast=performance.now();return true;
    },
    captureQACurrentView:()=>{if(contextLost||disposed||!loaded)return null;renderFrame(camera);return renderer.domElement.toDataURL('image/png');},
    captureQAWaterView:()=>{
      const capture=(height,z)=>{const shot=camera.clone();shot.position.set(-6,height,z);shot.lookAt(-6,0,8.5);shot.updateMatrixWorld(true);
        if(groundDetail)groundDetail.update(shot,renderer.getSize(groundViewport).y,renderer.getPixelRatio());
        renderFrame(shot);return renderer.domElement.toDataURL('image/png');};
      const near=capture(4,12),far=capture(26,30);
      if(groundDetail)groundDetail.update(camera,renderer.getSize(groundViewport).y,renderer.getPixelRatio());renderFrame(camera);return {near,far};
    },
    setQAOrbit:(yaw,pitch,radius)=>controls.setQAOrbit(yaw,pitch,radius),
    probeQAAvatarPixels:()=>probePlazaAvatarGpu(renderer,scene,camera),
    getQAState: () => {
      const gl=renderer.getContext(),skeletons=new Set(),materials=new Set();let meshCount=0,visibleMeshes=0,nonFiniteBoneValues=0;
      vrm?.scene.traverse(o=>{if(o.isMesh){meshCount++;if(o.visible)visibleMeshes++;for(const m of Array.isArray(o.material)?o.material:[o.material])if(m)materials.add(m);}if(o.isSkinnedMesh)skeletons.add(o.skeleton);});
      for(const sk of skeletons)for(const value of sk.boneMatrices||[])if(!Number.isFinite(value))nonFiniteBoneValues++;
      const bone=name=>vrm?.humanoid.getNormalizedBoneNode(name)?.getWorldPosition(new THREE.Vector3()).toArray()||null;
      return {mobileSceneBudget,lightingBudget:lighting.budget,mobileGround,groundTriangles:world?.groundV7.triangles,groundChunks:world?.groundV7.chunks,cameraMaxDistance:controls.maxDistance,refractionBudgetMetrics:refractionBudget.getMetrics(),adaptiveRefraction,refractionScale:renderer.transmissionResolutionScale,qaTransmissionScale,filteredMaterialNoise,subpixelGroundDetail,qaRenderProfile,qaOrbit:{yaw:controls.yaw,pitch:controls.pitch,radius:controls.requestedRadius},contextLost:contextLost||gl.isContextLost(),hidden:document.hidden,loaded,disposed,frame:renderer.info.render.frame,antialias:gl.getContextAttributes()?.antialias,samples:gl.getParameter(gl.SAMPLES),glError:gl.getError(),dpr:renderer.getPixelRatio(),exposure:renderer.toneMappingExposure,background:scene.background?.getHexString?.()||null,hemisphere:hemisphere.intensity,sun:sun.intensity,camera:{position:camera.position.toArray(),fov:camera.fov,near:camera.near,far:camera.far},actor:{position:avatar.position.toArray(),visible:vrm?.scene.visible??false,meshCount,visibleMeshes,head:bone('head'),hips:bone('hips'),leftFoot:bone('leftFoot'),rightFoot:bone('rightFoot')},nonFiniteBoneValues,skeletons:[...skeletons].map(sk=>({bones:sk.bones.length,textureVersion:sk.boneTexture?.version??null,textureWidth:sk.boneTexture?.image?.width??null})),materials:[...materials].map(m=>({type:m.type,visible:m.visible,opacity:m.opacity,transparent:m.transparent,alphaTest:m.alphaTest,alphaToCoverage:m.alphaToCoverage,depthWrite:m.depthWrite})),animations:Object.fromEntries(Object.entries(actions).map(([name,a])=>[name,{time:a.time,weight:a.getEffectiveWeight(),timeScale:a.getEffectiveTimeScale(),running:a.isRunning()}]))};
    },
    getStats: () => ({ ...stats }),
  };
}

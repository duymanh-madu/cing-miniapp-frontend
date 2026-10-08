import {applyPlazaSeatedPose} from './plazaSeatedPoseV3.js';
import {createPlazaTableSignsV3} from './plazaTableSignsV3.js';
import * as THREE from 'three';
import {createPlazaRemoteAvatarsV2} from './plazaRemoteAvatarsV2.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { VRMAnimationLoaderPlugin, createVRMAnimationClip } from '@pixiv/three-vrm-animation';
import { batchPlazaMapV1 } from './batchPlazaMapV1.js';
import { createObstacleIndex, isSolidObstacle } from './plazaMotionV1.js';
import { refinePlazaMap, findTapPath, vietnamHour, timePalette } from './plazaRefinementsV2.js';
import { buildWorldV3, loadWorldAssets, WORLD_V3, PLAZA_FLOOR_NAME } from './plazaWorldV3.js';
import { createPlazaLightingV4, renderPlazaLayers } from './plazaLightingV4.js';
import { acceptsPavingEdge } from './plazaEntranceV6.js';
import { PLAZA_AVATARS, nextAvatarMotion, girlExpression } from './plazaAvatarV6.js';
import { applyPlazaMaterialsV1 } from './plazaMaterialsV1.js';

const FILES = {
  map: 'cing-plaza-map-v17.glb', boy: 'cing-boy-v01.vrm',
  idle: 'cing-boy-idle.vrma', walk: 'cing-boy-walk.vrma', wave: 'cing-boy-wave.vrma',
};
const floorName = PLAZA_FLOOR_NAME;

function disposeTree(root) {
  const geometries = new Set(), materials = new Set(), textures = new Set();
  root.traverse(object => {
    if (object.geometry) geometries.add(object.geometry);
    const list = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of list) {
      if (!material) continue;
      materials.add(material);
      for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
    }
  });
  geometries.forEach(value => value.dispose());
  materials.forEach(value => value.dispose());
  textures.forEach(value => { value.dispose(); value.source?.data?.close?.(); });
}

export function createPlazaSceneV1(host, { onProgress = () => {}, onState = () => {}, onStats = () => {}, onNotice = () => {}, character = 'girl', onLocalState = () => {}, onPosition=()=>{} } = {}) {
  const avatarConfig = PLAZA_AVATARS[character] || PLAZA_AVATARS.girl;
  const walkSpeed = avatarConfig.speed;
  let expressionTime = 0;
  const scene = new THREE.Scene();
  const tableSigns=createPlazaTableSignsV3(scene);let authoritativeSeat=null,lastSeatId=null;
  scene.background = new THREE.Color('#f0e6d4');
  scene.fog = new THREE.Fog('#f0e6d4', 35, 90);
  const camera = new THREE.PerspectiveCamera(45, 1, 0.08, 120);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.domElement.setAttribute('aria-label', 'Không gian Cing Plaza 3D');
  host.appendChild(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 2.2;
  controls.maxDistance = 55;
  controls.maxPolarAngle = Math.PI * 0.47;
  controls.minPolarAngle = 0.2;
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
  let disposed = false, raf = 0, vrm = null, mixer = null, currentAction = null;
  let state = 'idle', waveRequested = false, waveFinished = false, loaded = false;
  let input = { x: 0, z: 0 }, map = null, floors = [], collision = () => false;
  let groundY = 0, soleOffset = 0, stats = {}, preset = 'follow';
  let world = null, worldAssets = null;
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
    lighting.apply(palette,hemisphere,renderer);
    stats = { ...stats, timeOfDay: palette.label };
  }
  function stopPath() { path = []; marker.visible = false; }
  const actions = {};
  let netSeq=0, netLast=-Infinity, netValue=null, gesture=0, initialPresence=null;
  const remote=createPlazaRemoteAvatarsV2({scene,load,onNotice});
  const spawn = new THREE.Vector3(0, 0, 2.5);
  const forward = new THREE.Vector3(), right = new THREE.Vector3(), movement = new THREE.Vector3();
  const followDelta = new THREE.Vector3(), ray = new THREE.Raycaster();
  const normalMatrix = new THREE.Matrix3();
  const normal = new THREE.Vector3();
  const avatar = new THREE.Group();
  scene.add(avatar);
  const lighting=createPlazaLightingV4(scene,camera,avatar);
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
    ray.set(new THREE.Vector3(x, fromY + 0.3, z), new THREE.Vector3(0, -1, 0));
    ray.near = 0; ray.far = 2;
    for (const hit of ray.intersectObjects(floors, false)) {
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
    controls.update();
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
  }
  const observer = new ResizeObserver(resize);
  observer.observe(host); resize();
  let last = performance.now(), statLast = last, frames = 0;
  function tick(now) {
    if (disposed) return;
    raf = 0;
    if (document.hidden) return;
    const dt = Math.max(0, Math.min((now - last) / 1000, 0.05)); last = now;
    updateLighting(); world?.updateDoors(avatar.position, dt, remote.positions());
    const oldPosition = avatar.position.clone();
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
      moved = tryStep(avatar.position.x + movement.x * distance, avatar.position.z + movement.z * distance);
      if (!moved) {
        const movedX = tryStep(avatar.position.x + movement.x * distance, avatar.position.z);
        const movedZ = tryStep(avatar.position.x, avatar.position.z + movement.z * distance);
        moved = movedX || movedZ;
        if (!moved && path.length && !world?.waitingAtDoor(avatar.position)) { stopPath(); onNotice('Lối đi đang bị chắn. Hãy chọn điểm khác.'); }
      }
      const heading = Math.atan2(movement.x, movement.z);
      const delta = Math.atan2(Math.sin(heading - avatar.rotation.y), Math.cos(heading - avatar.rotation.y));
      avatar.rotation.y += delta * Math.min(1, dt * 14);
    }
    changeAction(authoritativeSeat?'sit':nextAvatarMotion(state, moved, waveRequested, waveFinished));
    const actualSpeed = Math.hypot(avatar.position.x-oldPosition.x,avatar.position.z-oldPosition.z)/(dt||1);
    // Both clips are authored at walkSpeed; time follows actual travel, including partial joystick input.
    walkPlayback=moved ? Math.min(1.15,actualSpeed/walkSpeed) : 0;
    actions.walk.setEffectiveTimeScale(walkPlayback);
    mixer.update(dt);
    if (character === 'girl') { expressionTime += dt; const expression = girlExpression(expressionTime,state); for (const [name,value] of Object.entries(expression)) vrm.expressionManager?.setValue(name,value); }
    if(authoritativeSeat)applyPlazaSeatedPose(vrm);
    vrm.update(dt);
    lift = walkLift * (actions.walk.isRunning() ? actions.walk.getEffectiveWeight() : 0);
    avatar.position.y = authoritativeSeat?authoritativeSeat.y:groundY + soleOffset + lift;
    contact.visible=!authoritativeSeat;
    contact.position.set(avatar.position.x, groundY + 0.009, avatar.position.z);
    if (preset !== 'overview') {
      followDelta.copy(avatar.position).sub(oldPosition);
      controls.target.add(followDelta); camera.position.add(followDelta);
    }
    const packet={x:avatar.position.x,y:avatar.position.y,z:avatar.position.z,heading:avatar.rotation.y,motion:state,character,phase:currentAction.time,speed:Math.min(1.6,actualSpeed),gesture};
    const changed=!netValue || Math.hypot(packet.x-netValue.x,packet.y-netValue.y,packet.z-netValue.z)>.001 || Math.abs(packet.heading-netValue.heading)>.002 || packet.motion!==netValue.motion || packet.gesture!==netValue.gesture;
    onPosition(packet);
    if(now-netLast>=100 && (changed || now-netLast>=500)){netLast=now;netValue=packet;onLocalState({...packet,seq:++netSeq});}
    remote.update(dt,camera);
    controls.update(); lighting.update(); renderPlazaLayers(renderer,scene,camera);
    frames++;
    if (now - statLast >= 1000) {
      stats = { ...stats, fps: Math.round(frames * 1000 / (now - statLast)), calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, ...remote.stats(), motion: state, x: avatar.position.x, z: avatar.position.z, groundY };
      onStats(stats); frames = 0; statLast = now;
    }
    raf = requestAnimationFrame(tick);
  }
  function onVisibility() {
    input = { x: 0, z: 0 }; stopPath();
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
    else if (loaded && !disposed && !raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
  }
  function onContextLost(event) {
    event.preventDefault();
    dispose();
    onProgress({ error: 'Phiên hiển thị 3D bị gián đoạn. Hãy bấm Mở lại.' });
  }
  document.addEventListener('visibilitychange', onVisibility);
  renderer.domElement.addEventListener('webglcontextlost', onContextLost);

  function dispose() {
    if (disposed) return;
    disposed = true; loaded = false; abort.abort(); cancelAnimationFrame(raf);
    observer.disconnect(); controls.dispose();remote.dispose();
    document.removeEventListener('visibilitychange', onVisibility);
    renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
    if (mixer) { mixer.stopAllAction(); mixer.uncacheRoot(vrm.scene); }
    disposeTree(scene); worldAssets?.dispose(); materialResources?.dispose(); environmentTarget.dispose();
    sun.shadow.map?.dispose(); renderer.dispose();
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
      map = mapFile.scene; const refinements = refinePlazaMap(map); scene.add(map); map.updateMatrixWorld(true);
      onProgress({ text: 'Đang dựng cửa hàng và các góc check-in…', percent: 22 });
      worldAssets = await loadWorldAssets(assetRoot, abort.signal);
      if (disposed) { worldAssets.dispose(); worldAssets.logo.dispose(); worldAssets.logo.source.data.close(); throw new DOMException('Disposed', 'AbortError'); }
      world = buildWorldV3(map, { logo: worldAssets.logo }); floors.push(...world.floors);
      lighting.attachWorld(world); clockMinute=''; updateLighting();
      const materialResponse = await fetch(new URL('cing-plaza-materials.json', assetRoot), { signal: abort.signal });
      if (!materialResponse.ok) throw new Error('Thiếu dữ liệu vật liệu của map.');
      const materialData = await materialResponse.json();
      if (disposed) throw new DOMException('Disposed', 'AbortError');
      materialResources = applyPlazaMaterialsV1(map, materialData,{retiredMaterials:world.dinhV12.retiredMaterials});
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
      onProgress({ text: 'Đang chuẩn bị cửa hàng và sân đình…', percent: 35 });
      const batching = await batchPlazaMapV1(map, { preserved: new Set([...floors, ...world.preserved]), cancelled: () => disposed });
      if (disposed) { disposeTree(mapFile.scene); throw new DOMException('Disposed', 'AbortError'); }
      stats = { ...stats, ...refinements, ...world.stats, mapDrawsBefore: batching.before, mapDrawsAfter: batching.after };
      onProgress({ text: 'Đang chuẩn bị nhân vật…', percent: 55 });
      const modelFile = await load(avatarConfig.model);
      vrm = modelFile.userData.vrm;
      if (!vrm) { disposeTree(modelFile.scene); throw new Error('Không đọc được nhân vật VRM.'); }
      VRMUtils.rotateVRM0(vrm);remote.seed(character,vrm);
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
      stats.walkLift = walkLift; stats.character = character; updateLighting();
      groundY = groundAt(spawn.x, spawn.z, 0.1) ?? 0;
      avatar.position.set(spawn.x, groundY + soleOffset, spawn.z);
      cameraPreset('follow'); contact.position.set(spawn.x, groundY + 0.009, spawn.z);
      renderer.shadowMap.needsUpdate = true;
      if(initialPresence){netSeq=Math.max(netSeq,initialPresence.seq||0);avatar.position.set(initialPresence.x,initialPresence.y,initialPresence.z);groundY=groundAt(initialPresence.x,initialPresence.z,initialPresence.y)??groundY;avatar.rotation.y=initialPresence.heading;cameraPreset('follow');}
      if(initialPresence?.seatId){authoritativeSeat=initialPresence;lastSeatId=initialPresence.seatId;}
      loaded = true; onProgress({ ready: true, percent: 100 });
      onStats(stats); last = performance.now();
      if (!document.hidden) raf = requestAnimationFrame(tick);
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
    correct:value=>{if(!loaded||disposed||!value)return;netSeq=Math.max(netSeq,value.seq||0);const before=avatar.position.clone();avatar.position.set(value.x,value.y,value.z);groundY=groundAt(value.x,value.z,value.y)??groundY;avatar.rotation.y=value.heading;stopPath();const delta=avatar.position.clone().sub(before);camera.position.add(delta);controls.target.add(delta);},
    setTables:tables=>tableSigns.update(tables),
    setMembers:(members,selfId)=>{
      const own=members?.find(v=>v.memberId===selfId);
      if(own && loaded && (own.seatId||null)!==lastSeatId){const before=avatar.position.clone();authoritativeSeat=own.seatId?own:null;lastSeatId=own.seatId||null;input={x:0,z:0};stopPath();avatar.position.set(own.x,own.y,own.z);avatar.rotation.y=own.heading;groundY=groundAt(own.x,own.z,Math.max(own.y,0))??groundY;const d=avatar.position.clone().sub(before);camera.position.add(d);controls.target.add(d);}

      if(!loaded && !initialPresence)initialPresence=members?.find(v=>v.memberId===selfId)||null;
      remote.setMembers(members,selfId);
    },
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
      onNotice('Đang đi tới điểm đã chọn. Kéo cần để đổi hướng hoặc bấm Dừng.');
    },
    wave: () => { if (loaded && state !== 'wave') { stopPath(); waveRequested = 'wave'; } },
    pose: () => { if (loaded && !disposed && actions.checkin) { input={x:0,z:0}; stopPath(); waveRequested='checkin'; } },
    cameraPreset,
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
      avatar.rotation.y = Math.atan2(camera.position.x-x,camera.position.z-z);
      controls.update(); onNotice('Góc check-in đã sẵn sàng. Bấm Chụp ảnh để lưu ảnh của anh.');
    },
    snapshot: () => {
      if (!loaded || disposed) return;
      lighting.update(); renderPlazaLayers(renderer,scene,camera);
      renderer.domElement.toBlob(blob => {
        if (!blob || disposed) return;
        const url = URL.createObjectURL(blob), link = document.createElement('a');
        link.href=url; link.download='cing-plaza-check-in.png'; document.body.appendChild(link); link.click(); link.remove();
        setTimeout(()=>URL.revokeObjectURL(url),10000); onNotice('Ảnh Cing Plaza đã được tạo.');
      },'image/png');
    },
    reset: () => {
      if (!loaded || disposed) return;
      input = { x: 0, z: 0 }; stopPath(); lift = 0; avatar.rotation.y = 0;
      groundY = groundAt(spawn.x, spawn.z, 0.1) ?? 0;
      avatar.position.set(spawn.x, groundY + soleOffset, spawn.z);
      changeAction('idle'); cameraPreset('follow');
    },
    getStats: () => ({ ...stats }),
  };
}

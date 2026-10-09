import * as THREE from "three";
export const PLAZA_CAMERA_V10 = Object.freeze({
  min: 1.8,
  max: 42,
  minPitch: 0.06,
  maxPitch: 1.72,
  margin: 0.35,
});
export function orbitPoseV10(target, yaw, pitch, radius, bounds, floorY = 0) {
  const floorPitch = Math.acos(
    THREE.MathUtils.clamp((floorY + 0.25 - target.y) / radius, -1, 1),
  );
  const p = target
    .clone()
    .add(
      new THREE.Vector3().setFromSpherical(
        new THREE.Spherical(radius, Math.min(pitch, floorPitch), yaw),
      ),
    );
  p.x = THREE.MathUtils.clamp(
    p.x,
    bounds.minX + PLAZA_CAMERA_V10.margin,
    bounds.maxX - PLAZA_CAMERA_V10.margin,
  );
  p.z = THREE.MathUtils.clamp(
    p.z,
    bounds.minZ + PLAZA_CAMERA_V10.margin,
    bounds.maxZ - PLAZA_CAMERA_V10.margin,
  );
  p.y = Math.max(p.y, floorY + 0.25);
  return p;
}
export function createPlazaCameraV10(
  camera,
  element,
  bounds,
  { floorAt = () => 0 } = {},
) {
  const target = new THREE.Vector3(),
    pointers = new Map();
  let yaw = 0,
    pitch = 1.05,
    radius = 5.8,
    pinch = null;
  const api = {
    target,
    minDistance: PLAZA_CAMERA_V10.min,
    maxDistance: PLAZA_CAMERA_V10.max,
    sync() {
      const s = new THREE.Spherical().setFromVector3(
        camera.position.clone().sub(target),
      );
      yaw = s.theta;
      pitch = THREE.MathUtils.clamp(
        s.phi,
        PLAZA_CAMERA_V10.minPitch,
        PLAZA_CAMERA_V10.maxPitch,
      );
      radius = THREE.MathUtils.clamp(
        s.radius,
        api.minDistance,
        api.maxDistance,
      );
    },
    update(center) {
      if (center) target.copy(center);
      const first = orbitPoseV10(target, yaw, pitch, radius, bounds);
      const y = floorAt(first.x, first.z, target.y - 0.9);
      camera.position.copy(
        orbitPoseV10(
          target,
          yaw,
          pitch,
          radius,
          bounds,
          Number.isFinite(y) ? y : 0,
        ),
      );
      camera.lookAt(target);
      camera.updateMatrixWorld(true);
    },
    get requestedRadius() {
      return radius;
    },
    get yaw() {
      return yaw;
    },
    get pitch() {
      return pitch;
    },
    cancelGestures() { pointers.clear(); pinch=null; },
    dispose() {
      for (const [event, fn, options] of listeners)
        element.removeEventListener(event, fn, options);
      pointers.clear();
      pinch = null;
    },
  };
  const read = (e) => ({ x: e.clientX, y: e.clientY });
  const pair = () => {
    const [a, b] = [...pointers.values()];
    return a && b
      ? {
          distance: Math.max(2, Math.hypot(a.x - b.x, a.y - b.y)),
          x: (a.x + b.x) / 2,
          y: (a.y + b.y) / 2,
        }
      : null;
  };
  const rotate = (dx, dy) => {
    const height = Math.max(200, element.clientHeight);
    yaw -= (dx / height) * Math.PI * 2;
    pitch = THREE.MathUtils.clamp(
      pitch - (dy / height) * Math.PI * 2,
      PLAZA_CAMERA_V10.minPitch,
      PLAZA_CAMERA_V10.maxPitch,
    );
  };
  function down(e) {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    pointers.set(e.pointerId, read(e));
    element.setPointerCapture?.(e.pointerId);
    pinch = pair();
  }
  function move(e) {
    const old = pointers.get(e.pointerId);
    if (!old) return;
    e.preventDefault();
    pointers.set(e.pointerId, read(e));
    const next = pair();
    if (next && pinch) {
      radius = THREE.MathUtils.clamp(
        (radius * pinch.distance) / next.distance,
        api.minDistance,
        api.maxDistance,
      );
      pinch = next;
    } else if (!next) {
      rotate(e.clientX - old.x, e.clientY - old.y);
      pinch = null;
    } else pinch = next;
    api.update();
  }
  function up(e) {
    pointers.delete(e.pointerId);
    pinch = pair();
  }
  function wheel(e) {
    e.preventDefault();
    const delta =
      e.deltaY *
      (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? element.clientHeight : 1);
    radius = THREE.MathUtils.clamp(
      radius * Math.exp(THREE.MathUtils.clamp(delta * 0.0015, -1, 1)),
      api.minDistance,
      api.maxDistance,
    );
    api.update();
  }
  const listeners = [
    ["pointerdown", down],
    ["pointermove", move, { passive: false }],
    ["pointerup", up],
    ["pointercancel", up],
    ["lostpointercapture", up],
    ["wheel", wheel, { passive: false }],
  ];
  for (const [event, fn, options] of listeners)
    element.addEventListener(event, fn, options);
  return api;
}

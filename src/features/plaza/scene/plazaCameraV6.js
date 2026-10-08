export const PLAZA_CAMERA_V6 = Object.freeze({ min: 2.2, portraitMax: 7, landscapeMax: 9 });
export function plazaCameraLimitV6(aspect) {
  return aspect < 1 ? PLAZA_CAMERA_V6.portraitMax : PLAZA_CAMERA_V6.landscapeMax;
}
export function enforcePlazaCameraV6(camera, controls, bounds) {
  const offset = camera.position.clone().sub(controls.target);
  const length = offset.length();
  if (length > controls.maxDistance) camera.position.copy(controls.target).add(offset.multiplyScalar(controls.maxDistance / length));
  // Keep the lens within the enclosure, including near the gate and corners.
  camera.position.x = Math.max(bounds.minX + .35, Math.min(bounds.maxX - .35, camera.position.x));
  camera.position.z = Math.max(bounds.minZ + .35, Math.min(bounds.maxZ - .35, camera.position.z));
}

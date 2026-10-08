import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export function worldGeometry(mesh) {
  const geometry = mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);
  // applyMatrix4 does not reverse triangle winding for mirrored objects.
  if (mesh.matrixWorld.determinant() < 0) {
    if (geometry.index) {
      const index = geometry.index;
      for (let i = 0; i < index.count; i += 3) {
        const a = index.getX(i);
        index.setX(i, index.getX(i + 2));
        index.setX(i + 2, a);
      }
    } else {
      for (const attribute of Object.values(geometry.attributes)) {
        for (let i = 0; i < attribute.count; i += 3) {
          for (let c = 0; c < attribute.itemSize; c++) {
            const a = attribute.array[i * attribute.itemSize + c];
            attribute.array[i * attribute.itemSize + c] = attribute.array[(i + 2) * attribute.itemSize + c];
            attribute.array[(i + 2) * attribute.itemSize + c] = a;
          }
        }
      }
    }
    if (geometry.attributes.tangent) {
      const tangent = geometry.attributes.tangent;
      for (let i = 0; i < tangent.count; i++) tangent.setW(i, -tangent.getW(i));
    }
  }
  return geometry;
}

export async function batchPlazaMapV1(root, { preserved = new Set(), cancelled = () => false } = {}) {
  root.updateMatrixWorld(true);
  const groups = new Map();
  const originalGeometries = new Set();
  let before = 0;
  root.traverse(mesh => {
    if (!mesh.isMesh) return;
    before += Array.isArray(mesh.material) ? mesh.geometry.groups.length || 1 : 1;
    const material = mesh.material;
    if (preserved.has(mesh) || mesh.isSkinnedMesh || Array.isArray(material) ||
        material.transparent || material.transmission > 0 ||
        Object.keys(mesh.geometry.morphAttributes).length || mesh.geometry.isInstancedBufferGeometry) return;
    const attributes = Object.entries(mesh.geometry.attributes).sort(([a], [b]) => a.localeCompare(b));
    if (attributes.some(([, a]) => a.isInterleavedBufferAttribute)) return;
    const signature = attributes.map(([name, a]) => `${name}:${a.itemSize}:${a.normalized}:${a.array.constructor.name}`).join('|');
    const centre = new THREE.Box3().setFromObject(mesh).getCenter(new THREE.Vector3());
    // Nearby objects share a draw call; separate tiles still support culling.
    const key = `${material.uuid}:${Boolean(mesh.geometry.index)}:${signature}:${Math.floor(centre.x / 6)}:${Math.floor(centre.z / 6)}:${mesh.renderOrder}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(mesh);
  });
  let saved = 0;
  let processed = 0;
  for (const meshes of groups.values()) {
    if (cancelled()) return { before, after: before - saved };
    if (meshes.length < 2) continue;
    const geometries = meshes.map(worldGeometry);
    const merged = mergeGeometries(geometries, false);
    geometries.forEach(geometry => geometry.dispose());
    if (!merged) continue;
    merged.computeBoundingBox();
    merged.computeBoundingSphere();
    const batch = new THREE.Mesh(merged, meshes[0].material);
    batch.name = `PlazaStaticBatch_${processed}`;
    batch.renderOrder = meshes[0].renderOrder;
    batch.castShadow = true;
    batch.receiveShadow = true;
    for (const mesh of meshes) {
      originalGeometries.add(mesh.geometry);
      mesh.removeFromParent();
    }
    root.add(batch);
    saved += meshes.length - 1;
    processed++;
    if (processed % 8 === 0) await new Promise(resolve => setTimeout(resolve, 0));
  }
  const retained = new Set();
  root.traverse(mesh => { if (mesh.geometry) retained.add(mesh.geometry); });
  for (const geometry of originalGeometries) if (!retained.has(geometry)) geometry.dispose();
  return { before, after: before - saved };
}

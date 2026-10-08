import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { batchPlazaMapV1, worldGeometry } from '../scene/batchPlazaMapV1.js';

test('batching preserves world bounds, material, and triangle count', async () => {
  const root = new THREE.Group(), material = new THREE.MeshStandardMaterial();
  for (const x of [0, 2, 4]) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(), material);
    mesh.position.set(x, 0.5, 0); mesh.rotation.y = 0.2;
    root.add(mesh);
  }
  const before = new THREE.Box3().setFromObject(root);
  const report = await batchPlazaMapV1(root);
  const after = new THREE.Box3().setFromObject(root);
  assert.equal(report.before, 3); assert.equal(report.after, 1);
  assert.ok(before.min.distanceTo(after.min) < 1e-6);
  assert.ok(before.max.distanceTo(after.max) < 1e-6);
  assert.equal(root.children[0].geometry.index.count / 3, 36);
  assert.equal(root.children[0].material, material);
});
test('transparent glass and floor geometry remain separate', async () => {
  const root = new THREE.Group(), material = new THREE.MeshStandardMaterial({ transparent: true });
  const a = new THREE.Mesh(new THREE.BoxGeometry(), material), b = a.clone();
  root.add(a, b);
  assert.equal((await batchPlazaMapV1(root)).after, 2);
});
test('mirrored indexed geometry retains outward face direction', () => {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(), new THREE.MeshBasicMaterial());
  mesh.scale.x = -1; mesh.updateMatrixWorld(true);
  const geometry = worldGeometry(mesh), p = geometry.attributes.position;
  const points = [0, 1, 2].map(i => new THREE.Vector3().fromBufferAttribute(p, geometry.index.getX(i)));
  const faceNormal = points[1].clone().sub(points[0]).cross(points[2].clone().sub(points[0])).normalize();
  assert.ok(faceNormal.z > 0.99);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { inputVector, nextMotion, createObstacleIndex, isSolidObstacle } from '../scene/plazaMotionV1.js';

test('disconnected foliage cannot create an invisible wall across the courtyard', () => {
  assert.equal(isSolidObstacle(['V15_Foliage_1', 'V15_Flower_Petals']), false);
  assert.equal(isSolidObstacle(['V13_Cognac_Leather']), true);
  assert.equal(isSolidObstacle(['Dark_Timber', 'V15_Foliage_0']), true);
});

test('diagonal movement is normalized and opposing keys cancel', () => {
  assert.equal(Math.hypot(...Object.values(inputVector(new Set(['forward', 'right'])))), 1);
  assert.deepEqual(inputVector(new Set(['forward', 'back', 'left', 'right'])), { x: 0, z: 0 });
});
test('wave is one-shot, ends in idle, and walking can interrupt it', () => {
  assert.equal(nextMotion('idle', false, true, false), 'wave');
  assert.equal(nextMotion('wave', false, false, false), 'wave');
  assert.equal(nextMotion('wave', false, false, true), 'idle');
  assert.equal(nextMotion('wave', true, false, false), 'walk');
  assert.equal(nextMotion('walk', false, false, false), 'idle');
});
test('collision searches adjoining grid cells; low steps and overhead roofs do not block', () => {
  const blocks = createObstacleIndex([
    { minX: 2, maxX: 2.4, minZ: 0, maxZ: 1, minY: 0, maxY: 1 },
    { minX: -2, maxX: -1, minZ: 0, maxZ: 1, minY: 0, maxY: 0.2 },
    { minX: -4, maxX: -3, minZ: 0, maxZ: 1, minY: 2, maxY: 3 },
  ]);
  assert.equal(blocks(1.85, 0.5, 0), true);
  assert.equal(blocks(1.5, 0.5, 0), false);
  assert.equal(blocks(-1.5, 0.5, 0), false);
  assert.equal(blocks(-3.5, 0.5, 0), false);
});

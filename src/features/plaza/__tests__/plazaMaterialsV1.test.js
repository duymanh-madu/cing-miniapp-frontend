import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { compilePlazaMaterial } from '../scene/plazaMaterialsV1.js';

test('all eight original Blender graphs compile without replacing their color ramps', () => {
  const data = JSON.parse(fs.readFileSync(new URL('../../../../public/cing-plaza/assets/cing-plaza-materials.json', import.meta.url)));
  assert.equal(data.materials.length, 8);
  for (const definition of data.materials) {
    const graph = compilePlazaMaterial(definition);
    assert.ok(graph.functions.includes('mix('), definition.name);
    assert.ok(graph.statements.includes('plazaNoise('), definition.name);
    assert.ok(graph.height !== '0.0', definition.name);
    assert.ok(!graph.functions.includes('NaN'));
    for (const ramp of definition.nodes.filter(node => node.ramp)) {
      for (const element of ramp.ramp.elements) {
        assert.ok(graph.functions.includes(element.position.toFixed(8)), definition.name);
      }
    }
  }
});
test('unsupported Blender nodes fail instead of silently displaying white materials', () => {
  assert.throws(() => compilePlazaMaterial({ name: 'bad', nodes: [], links: [] }), /Principled/);
});

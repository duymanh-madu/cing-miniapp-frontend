import * as THREE from 'three';

const number = value => {
  if (!Number.isFinite(value)) throw new Error('Vật liệu chứa số không hợp lệ.');
  return Number(value).toFixed(8);
};
const literal = value => Array.isArray(value)
  ? { type: 'vec3', code: `vec3(${value.slice(0, 3).map(number).join(',')})` }
  : { type: 'float', code: number(value) };
const scalar = value => value.type === 'float' ? value.code : `dot(${value.code}, vec3(0.2126,0.7152,0.0722))`;
const vector = value => value.type === 'vec3' ? value.code : `vec3(${value.code})`;

// Interpret the exported color ramps and links rather than substituting guessed
// colors. Noise is a filtered WebGL approximation, not a Blender pixel match.
export function compilePlazaMaterial(definition) {
  const nodes = new Map(definition.nodes.map(node => [node.name, node]));
  const links = new Map(definition.links.map(link => [`${link.to}:${link.input}`, link]));
  const cache = new Map(), lines = [], functions = [];
  let counter = 0;
  function input(node, id) {
    const link = links.get(`${node.name}:${id}`);
    if (link) return output(link.from, link.output);
    const socket = node.inputs.find(socket => socket.id === id);
    if (!socket) throw new Error(`Thiếu thông số ${node.name}:${id}.`);
    return literal(socket.value);
  }
  function output(name, socket) {
    const key = `${name}:${socket}`;
    if (cache.has(key)) return cache.get(key);
    const node = nodes.get(name);
    if (!node) throw new Error(`Không tìm thấy node ${name}.`);
    let value;
    if (node.type === 'ShaderNodeNewGeometry' && socket === 'Position') {
      value = { type: 'vec3', code: 'vec3(vPlazaWorld.x,-vPlazaWorld.z,vPlazaWorld.y)' };
    } else if (node.type === 'ShaderNodeVectorMath' && node.properties.operation === 'MULTIPLY') {
      value = { type: 'vec3', code: `(${vector(input(node, 'Vector'))} * ${vector(input(node, 'Vector_001'))})` };
    } else if (node.type === 'ShaderNodeTexNoise' && socket === 'Fac') {
      if (node.properties.noise_dimensions !== '3D') throw new Error('Noise này chưa hỗ trợ trên web.');
      value = { type: 'float', code: `plazaNoise(${vector(input(node, 'Vector'))} * ${scalar(input(node, 'Scale'))}, ${scalar(input(node, 'Detail'))}, ${scalar(input(node, 'Roughness'))}, ${scalar(input(node, 'Lacunarity'))})` };
    } else if (node.type === 'ShaderNodeValToRGB') {
      if (node.ramp.interpolation !== 'LINEAR') throw new Error('Color Ramp này chưa hỗ trợ trên web.');
      const elements = [...node.ramp.elements].sort((a, b) => a.position - b.position);
      const fn = `plazaRamp${functions.length}`;
      let body = `vec3 ${fn}(float x) {\n`;
      body += `if(x <= ${number(elements[0].position)}) return ${vector(literal(elements[0].color))};\n`;
      for (let i = 1; i < elements.length; i++) {
        const a = elements[i - 1], b = elements[i];
        body += `if(x <= ${number(b.position)}) return mix(${vector(literal(a.color))},${vector(literal(b.color))},clamp((x-${number(a.position)})/${number(b.position - a.position)},0.0,1.0));\n`;
      }
      body += `return ${vector(literal(elements.at(-1).color))}; }\n`;
      functions.push(body);
      value = { type: 'vec3', code: `${fn}(${scalar(input(node, 'Fac'))})` };
    } else if (node.type === 'ShaderNodeMixRGB' && node.properties.blend_type === 'MULTIPLY') {
      const a = vector(input(node, 'Color1')), b = vector(input(node, 'Color2'));
      value = { type: 'vec3', code: `mix(${a},${a}*${b},clamp(${scalar(input(node, 'Fac'))},0.0,1.0))` };
    } else if (node.type === 'ShaderNodeBump') {
      const upstream = links.get(`${name}:Normal`);
      const base = upstream ? scalar(output(upstream.from, upstream.output)) : '0.0';
      value = { type: 'float', code: `(${base} + ${scalar(input(node, 'Height'))} * ${scalar(input(node, 'Distance'))} * ${scalar(input(node, 'Strength'))})` };
    } else throw new Error(`Node chưa hỗ trợ: ${definition.name} / ${node.type} / ${socket}`);
    const variable = `plazaValue${counter++}`;
    lines.push(`${value.type} ${variable} = ${value.code};`);
    value = { type: value.type, code: variable }; cache.set(key, value);
    return value;
  }
  const principled = definition.nodes.find(node => node.type === 'ShaderNodeBsdfPrincipled');
  if (!principled) throw new Error(`Thiếu Principled BSDF: ${definition.name}`);
  const color = vector(input(principled, 'Base Color'));
  const roughness = scalar(input(principled, 'Roughness'));
  const normalLink = links.get(`${principled.name}:Normal`);
  const height = normalLink ? scalar(output(normalLink.from, normalLink.output)) : '0.0';
  const property = id => principled.inputs.find(socket => socket.id === id)?.value;
  return { functions: functions.join('\n'), statements: lines.join('\n'), color, roughness, height,
    coat: property('Coat Weight'), coatRoughness: property('Coat Roughness'), metallic: property('Metallic') };
}

function createNoiseVolume() {
  const size = 64, data = new Uint8Array(size ** 3);
  let state = 0x13579bdf;
  for (let i = 0; i < data.length; i++) {
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
    data[i] = (state >>> 24);
  }
  const texture = new THREE.Data3DTexture(data, size, size, size);
  texture.format = THREE.RedFormat; texture.type = THREE.UnsignedByteType;
  texture.minFilter = THREE.LinearMipmapLinearFilter; texture.magFilter = THREE.LinearFilter;
  texture.wrapS = texture.wrapT = texture.wrapR = THREE.RepeatWrapping;
  texture.generateMipmaps = true; texture.unpackAlignment = 1; texture.needsUpdate = true;
  return texture;
}

const NOISE = `
uniform highp sampler3D plazaNoiseVolume;
varying vec3 vPlazaWorld;
float plazaNoise(vec3 p, float detail, float roughness, float lacunarity) {
  float result=0.0, amplitude=1.0, total=0.0;
  for(int i=0;i<4;i++) {
    if(float(i)>detail) break;
    result += texture(plazaNoiseVolume, p/64.0).r * amplitude;
    total += amplitude; amplitude *= roughness; p *= lacunarity;
  }
  return result / max(total,0.00001);
}
`;

export function applyPlazaMaterialsV1(root, data, {retiredMaterials=[]}={}) {
  const compiled = new Map(data.materials.map(definition => [definition.name, compilePlazaMaterial(definition)]));
  const noise = createNoiseVolume(), materials = new Set(), applied = new Set();
  root.traverse(object => {
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      if (material && compiled.has(material.name)) materials.add(material);
    }
  });
  for (const material of materials) {
    const graph = compiled.get(material.name);
    if (!material.isMeshStandardMaterial) throw new Error(`Không hỗ trợ vật liệu ${material.name}.`);
    material.color.setRGB(1, 1, 1);
    material.roughness = 1;
    material.metalness = graph.metallic || 0;
    if (material.isMeshPhysicalMaterial) {
      material.clearcoat = graph.coat || 0;
      material.clearcoatRoughness = graph.coatRoughness || 0;
    }
    material.onBeforeCompile = shader => {
      shader.uniforms.plazaNoiseVolume = { value: noise };
      shader.vertexShader = `varying vec3 vPlazaWorld;\n${shader.vertexShader}`.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvPlazaWorld=(modelMatrix*vec4(transformed,1.0)).xyz;');
      shader.fragmentShader = `${NOISE}\n${graph.functions}\n${shader.fragmentShader}`
        .replace('#include <map_fragment>', `#include <map_fragment>\n${graph.statements}\ndiffuseColor.rgb=${graph.color};`)
        .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>\nroughnessFactor=clamp(${graph.roughness},0.04,1.0);`)
        .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>\nfloat plazaHeight=${graph.height};\nvec3 plazaQ0=dFdx(-vViewPosition), plazaQ1=dFdy(-vViewPosition);\nvec3 plazaS=cross(plazaQ1,normal), plazaT=cross(normal,plazaQ0);\nfloat plazaDet=dot(plazaQ0,plazaS);\nnormal=normalize(max(abs(plazaDet),0.0000001)*normal-sign(plazaDet)*(dFdx(plazaHeight)*plazaS+dFdy(plazaHeight)*plazaT));`);
    };
    material.customProgramCacheKey = () => `cing-plaza-nodes-v1:${material.name}`;
    material.needsUpdate = true; applied.add(material.name);
  }
  const missing = [...compiled.keys()].filter(name => !applied.has(name)&&!retiredMaterials.includes(name));
  if (missing.length) { noise.dispose(); throw new Error(`Map thiếu vật liệu: ${missing.join(', ')}`); }
  return { count: applied.size, dispose: () => noise.dispose() };
}

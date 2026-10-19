import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
function parse(file){const b=fs.readFileSync(new URL('../../../public/cing-plaza/assets/'+file,import.meta.url)),n=b.readUInt32LE(12);return {b,g:JSON.parse(b.subarray(20,20+n)),bin:b.subarray(n+28)};}
const sizes={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16};
function read({g,bin},ai){const a=g.accessors[ai],v=g.bufferViews[a.bufferView],width=sizes[a.type],size=a.componentType===5126||a.componentType===5125?4:2,rows=[];for(let i=0;i<a.count;i++){const row=[];for(let j=0;j<width;j++){const offset=(v.byteOffset||0)+(a.byteOffset||0)+i*(v.byteStride||size*width)+j*size;row.push(a.componentType===5126?bin.readFloatLE(offset):size===4?bin.readUInt32LE(offset):bin.readUInt16LE(offset));}rows.push(row);}return rows;}
test('V31 uses real cloth UV textures and reduces active garment geometry/draws',()=>{
 const f=parse('v31/boy-campus-v31.glb'),g=f.g;assert.ok(f.b.length<1500000);assert.equal(g.meshes.length,5);let tris=0;
 for(const m of g.meshes)for(const p of m.primitives){tris+=g.accessors[p.indices].count/3;assert.ok(p.attributes.TEXCOORD_0!==undefined||!m.name.startsWith('Top_'));const ws=read(f,p.attributes.WEIGHTS_0);assert.ok(ws.every(w=>w.every(Number.isFinite)&&Math.abs(w.reduce((a,b)=>a+b,0)-1)<1e-5));}
 assert.ok(tris<5500);assert.ok(g.extensionsUsed.includes('EXT_texture_webp'));assert.equal(g.images.filter(i=>i.mimeType==='image/webp').length,2);
});
test('V31 jacket preserves exact UVs and skin weights from the fitted original garment',()=>{
 const source=parse('cing-boy-v01.vrm'),out=parse('v31/boy-campus-v31.glb');const p=source.g.meshes[1].primitives.find(p=>p.material===10),q=out.g.meshes.find(m=>m.name.startsWith('Top_')).primitives[0];
 const oldUv=read(source,p.attributes.TEXCOORD_0),oldJ=read(source,p.attributes.JOINTS_0),oldW=read(source,p.attributes.WEIGHTS_0),uv=read(out,q.attributes.TEXCOORD_0),js=read(out,q.attributes.JOINTS_0),ws=read(out,q.attributes.WEIGHTS_0),used=new Set(read(source,p.indices).map(r=>r[0])),lookup=new Map();
 for(const i of used){const key=JSON.stringify(oldUv[i]);if(!lookup.has(key))lookup.set(key,[]);lookup.get(key).push(i);}
 assert.deepEqual(out.g.skins[0].joints,source.g.skins[1].joints);assert.ok(uv.length>1000);
 for(let i=0;i<uv.length;i++){const possible=lookup.get(JSON.stringify(uv[i]));assert.ok(possible?.some(j=>oldJ[j].every((v,k)=>v===js[i][k])&&oldW[j].every((v,k)=>v===ws[i][k])),'A collar/sleeve point was rebound instead of retaining its authored weights');}
});

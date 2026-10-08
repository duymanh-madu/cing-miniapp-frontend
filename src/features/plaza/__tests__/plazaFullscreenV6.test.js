import test from 'node:test';
import assert from 'node:assert/strict';
import {Vector3} from 'three';
import {mountPlazaViewportV6} from '../runtime/usePlazaViewportV6.js';
import {plazaCameraLimitV6,enforcePlazaCameraV6} from '../scene/plazaCameraV6.js';
test('portrait and landscape enforce close room views',()=>{assert.equal(plazaCameraLimitV6(.46),7);assert.equal(plazaCameraLimitV6(2),9);});
test('zoom and enclosure clamp at the centre and gate',()=>{
 const bounds={minX:-20,maxX:39,minZ:-38,maxZ:13};
 for(const target of [new Vector3(0,1,0),new Vector3(-19.8,1,12.8),new Vector3(38.8,1,-37.8)]){
  const camera={position:target.clone().add(new Vector3(40,20,40))};
  enforcePlazaCameraV6(camera,{target,maxDistance:7},bounds);
  assert.ok(camera.position.distanceTo(target)<=7+1e-9);
  assert.ok(camera.position.x>=bounds.minX+.35&&camera.position.x<=bounds.maxX-.35);
  assert.ok(camera.position.z>=bounds.minZ+.35&&camera.position.z<=bounds.maxZ-.35);
 }
});
test('close camera remains available',()=>{const camera={position:new Vector3(0,2,3)},before=camera.position.clone();enforcePlazaCameraV6(camera,{target:new Vector3(0,1,0),maxDistance:7},{minX:-20,maxX:39,minZ:-38,maxZ:13});assert.deepEqual(camera.position,before);});
function style(){const vars=new Map();return{overflow:'auto',overscrollBehavior:'contain',getPropertyValue:k=>vars.get(k)?.[0]||'',getPropertyPriority:k=>vars.get(k)?.[1]||'',setProperty:(k,v,p='')=>vars.set(k,[v,p]),removeProperty:k=>vars.delete(k)}}
test('keyboard viewport changes and route exit restore app state',()=>{
 const root={style:style()},body={style:style()};root.style.setProperty('--plaza-viewport-height','42px','important');
 const win=new EventTarget();win.innerHeight=800;win.scrollX=0;win.scrollY=220;win.visualViewport=new EventTarget();win.visualViewport.height=780;win.visualViewport.offsetTop=0;win.scrollTo=(...v)=>win.restored=v;
 const cleanup=mountPlazaViewportV6(win,{documentElement:root,body});assert.equal(body.style.overflow,'hidden');assert.equal(root.style.getPropertyValue('--plaza-viewport-height'),'780px');
 win.visualViewport.height=340;win.visualViewport.offsetTop=20;win.visualViewport.dispatchEvent(new Event('resize'));
 assert.equal(root.style.getPropertyValue('--plaza-viewport-height'),'340px');assert.equal(root.style.getPropertyValue('--plaza-viewport-top'),'20px');
 cleanup();assert.equal(body.style.overflow,'auto');assert.equal(body.style.overscrollBehavior,'contain');assert.deepEqual(win.restored,[0,220]);assert.equal(root.style.getPropertyValue('--plaza-viewport-height'),'42px');assert.equal(root.style.getPropertyPriority('--plaza-viewport-height'),'important');
 win.visualViewport.height=120;win.visualViewport.dispatchEvent(new Event('resize'));assert.equal(root.style.getPropertyValue('--plaza-viewport-height'),'42px');
});

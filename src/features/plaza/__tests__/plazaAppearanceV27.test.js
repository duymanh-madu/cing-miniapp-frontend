import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Bone,Mesh,BoxGeometry,MeshBasicMaterial,Group} from 'three';
import {PLAZA_SKIN_ITEMS,PLAZA_HAIR_ITEMS,createAppearanceController,materialSlot} from '../scene/plazaAppearanceV27.js';
test('three skin items have stable unique IDs at 30 Coin',()=>{
 assert.equal(new Set(PLAZA_SKIN_ITEMS.map(x=>x.id)).size,3);
 assert.ok(PLAZA_SKIN_ITEMS.every(x=>x.priceCoin===30));
});
test('appearance clones only modified materials and restores originals on disposal',()=>{
 const skin=new MeshBasicMaterial({color:0xffffff});skin.name='N00_Body_00_SKIN';
 const shirt=new MeshBasicMaterial();shirt.name='Tops';
 const a=new Mesh(new BoxGeometry(),[skin,shirt]),b=new Mesh(a.geometry,[skin,shirt]);
 const root=new Group();root.add(a);const controller=createAppearanceController(root);
 controller.apply({skin:'skin_black'});
 assert.notEqual(a.material[0],b.material[0]);assert.equal(b.material[0].color.getHex(),0xffffff);
 assert.equal(a.material[1],shirt);const first=a.material[0];
 controller.apply({skin:'skin_white'});assert.equal(a.material[0],first);
 controller.apply({skin:'unknown'});assert.equal(a.material[0],first);assert.equal(a.material[0].color.getHex(),0xffffff);
 controller.dispose();controller.dispose();assert.equal(a.material[0],skin);
 assert.equal(materialSlot('Shoes_00'),'shoes');assert.equal(materialSlot('EyeIris_00'),'face');
});

import {mergePlazaPresenceV19} from '../runtime/plazaPresenceMergeV19.js';
test('repeated idle appearance packets reuse the snapshot, a real skin change updates it',()=>{
 const member={memberId:'a',seq:1,motion:'idle',identityRevision:1,appearance:{skin:'skin_white'}};
 const snapshot={selfId:'a',members:[member]};
 assert.equal(mergePlazaPresenceV19(snapshot,{selfId:'a',members:[{...member,appearance:{skin:'skin_white'}}]}),null);
 const next=mergePlazaPresenceV19(snapshot,{selfId:'a',members:[{...member,identityRevision:2,appearance:{skin:'skin_black'}}]});
 assert.equal(next.members[0].appearance.skin,'skin_black');assert.equal(member.appearance.skin,'skin_white');
});

import {MToonMaterial} from '@pixiv/three-vrm';
import {softenPlazaSkin} from '../scene/plazaAppearanceV27.js';
test('skin has one soft lighting response without changing textures or clothing',()=>{
 const m=new MToonMaterial();m.name='Body_SKIN';m.color.set('#deb283');m.shadingToonyFactor=.95;m.shadingShiftFactor=-.05;
 softenPlazaSkin(m);assert.equal(m.shadingToonyFactor,.15);assert.equal(m.shadingShiftFactor,0);assert.equal(m.giEqualizationFactor,1);assert.equal(m.normalScale.length(),0);assert.ok(m.shadeColorFactor.equals(m.color.clone().multiplyScalar(.92)));
 const shirt=new MToonMaterial();shirt.name='Tops';const old=shirt.shadingToonyFactor;softenPlazaSkin(shirt);assert.equal(shirt.shadingToonyFactor,old);
});

test('hair catalogue has six server-safe designs for each gender',()=>{
 assert.equal(PLAZA_HAIR_ITEMS.filter(item=>item.character==='girl').length,6);
 assert.equal(PLAZA_HAIR_ITEMS.filter(item=>item.character==='boy').length,6);
 assert.equal(new Set(PLAZA_HAIR_ITEMS.map(item=>item.id)).size,12);
 assert.ok(PLAZA_HAIR_ITEMS.every(item=>/^hair_[a-z0-9_]+$/.test(item.id)&&item.slot==='hair'&&item.priceCoin===50));
});

test('unavailable designed hair preserves authored hair and creates no primitive placeholder',()=>{
 const root=new Group(),head=new Bone();head.name='J_Bip_C_Head';root.add(head);
 const sourceHair=new Mesh(new BoxGeometry(),new MeshBasicMaterial());sourceHair.name='Hair';root.add(sourceHair);
 const modularHair=new Mesh(new BoxGeometry(),new MeshBasicMaterial());modularHair.name='Cing_girl_hair';modularHair.userData.cingAppearanceSlot='hair';root.add(modularHair);
 const controller=createAppearanceController(root,{character:'girl'}),style=PLAZA_HAIR_ITEMS.find(item=>item.character==='girl');
 controller.apply({hair:style.id});
 assert.equal(sourceHair.visible,true);assert.equal(modularHair.visible,true);
 const worn=head.children.find(child=>child.name===`CingHairStyle:${style.style}`);
 assert.equal(worn,undefined);assert.equal(head.children.length,0);
 controller.apply({});assert.equal(sourceHair.visible,true);assert.equal(modularHair.visible,true);
 controller.dispose();assert.equal(sourceHair.visible,true);assert.equal(modularHair.visible,true);
});

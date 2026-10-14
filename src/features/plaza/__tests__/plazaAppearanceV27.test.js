import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Mesh,BoxGeometry,MeshBasicMaterial,Group} from 'three';
import {PLAZA_SKIN_ITEMS,createAppearanceController,materialSlot} from '../scene/plazaAppearanceV27.js';
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
 controller.apply({skin:'unknown'});assert.equal(a.material[0],skin);
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

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PLAZA_TITLES_V10} from '../pages/plazaTitleCatalogV10.js';
const file=p=>readFileSync(new URL(p,import.meta.url));
const read=p=>file(p).toString('utf8');
const root='../../../../public/cing-plaza/assets/v18/approved-image2/';
const all=['member','loyal','silver','gold','partner','diamond','loyal_partner','champion','idol','hof_3','ngoi_sao','hof_2','minh_tinh','hof_1'];
const PNG=Buffer.from([137,80,78,71,13,10,26,10]);
const checkPng=(key,size,w,h)=>{
 const b=file(`${root}${key}_${size}.png`);
 assert.ok(b.subarray(0,8).equals(PNG),`${key}/${size}: PNG signature`);
 assert.equal(b.readUInt32BE(16),w,`${key}/${size} width`);
 assert.equal(b.readUInt32BE(20),h,`${key}/${size} height`);
 assert.equal(b.readUInt8(25),6,`${key}/${size} RGBA alpha`);
 assert.ok(b.length>500,`${key}/${size} is nonempty`);
};
test('catalog is exactly the established 14 keys and Top 3 order',()=>{
 assert.deepEqual(Object.keys(PLAZA_TITLES_V10).sort(),[...all].sort());
 assert.equal(PLAZA_TITLES_V10.hof_1.label,'Vương Giả');
 assert.equal(PLAZA_TITLES_V10.hof_2.label,'Phú Hào');
 assert.equal(PLAZA_TITLES_V10.hof_3.label,'Địa Chủ');
 assert.equal(PLAZA_TITLES_V10.loyal.label,'Hội viên thân thiết');
});
for(const key of all){
 test(`${key} includes Store / Plaza / Chat art and clear icon`,()=>{
  checkPng(key,'store',1200,400);
  checkPng(key,'plaza',400,96);
  checkPng(key,'chat',320,80);
  checkPng(key,'icon',96,96);
 });
}
test('all tiered visuals apply only to known titles',()=>{
 const source=read('../pages/PlazaTitleV10.jsx');
 assert.ok(source.includes('const featureLevel=Object.freeze'));
 assert.ok(source.includes('idol:1,hof_3:1,ngoi_sao:2,hof_2:2,minh_tinh:3,hof_1:3'));
 assert.ok(source.includes('gold:2,partner:2,champion:2,diamond:3,loyal_partner:3'));
 assert.ok(source.includes('approved-image2'));
 assert.ok(source.includes('if(!title)return null'));
 assert.ok(source.includes('data-title-key={titleKey}'));
 assert.ok(source.includes('title.label'));
 assert.ok(!source.includes('walletBalance'));
 assert.ok(!source.includes('coinBalance'));
});
test('3D name stays in character center independent of left badge',()=>{
 const labels=read('../scene/plazaLabelsV9.jsx');
 const css=read('../pages/PlazaPrestigeCollectionV18.css');
 const row=labels.slice(labels.indexOf('plaza-v18-idrow--overhead'));
 assert.ok(row.indexOf('size="identity"') < row.indexOf('className="plaza-v9-name"'));
 assert.ok(row.includes('plaza-v18-vip-slot'));
 assert.ok(css.includes('right:calc(100% + 6px)'));
 assert.ok(css.includes('position:absolute!important'));
 assert.ok(css.includes('margin:0 auto!important'));
});
test('chat and members show badge left, member name right; no VIP account data',()=>{
 for(const name of ['PlazaChatV7.jsx','PlazaMembersV15.jsx']){
  const src=read('../pages/'+name);
  assert.ok(src.includes('plaza-v18-idrow--'));
  assert.ok(src.includes('size="chat"'));
  assert.ok(src.includes('plaza-v18-vip-slot'));
  assert.ok(!src.includes('vipLevel:'));
 }
});
test('owned-badge selection and existing finance authority not changed',()=>{
 const src=read('../pages/PlazaInventoryV16.jsx');
 assert.ok(src.includes('owned.has(key)'));
 assert.ok(src.includes('onChooseBadge(key)'));
 assert.ok(src.includes("op:'convert'"));
 assert.ok(src.includes("op:'buy_loudspeaker'"));
});
test('animation uses cheap glints and respects reduced motion',()=>{
 const css=read('../pages/PlazaPrestigeCollectionV18.css');
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/@keyframes plaza-prestige-spark/);
 assert.ok(!css.includes('backdrop-filter:'));
});

test('ordinary title badges never get a motion effect and tier relations hold',()=>{
 const css=read('../pages/PlazaPrestigeCollectionV18.css');
 assert.ok(css.includes('plaza-prestige-v18--level0:before'));
 assert.ok(css.includes('content:none!important;animation:none!important'));
 const component=read('../pages/PlazaTitleV10.jsx');
 assert.ok(component.includes('member:0,loyal:0,silver:1,gold:2,partner:2,champion:2,diamond:3,loyal_partner:3'));
 assert.ok(!component.includes('updateBalance'));
});

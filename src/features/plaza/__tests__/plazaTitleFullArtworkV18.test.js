import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const load=(p)=>readFileSync(new URL(p,import.meta.url),'utf8');
const title=load('../pages/PlazaTitleV10.jsx');
const css=load('../pages/PlazaPrestigeCollectionV18.css');
const labels=load('../scene/plazaLabelsV9.jsx');
const chat=load('../pages/PlazaChatV7.jsx');
const peek=load('../pages/PlazaChatPeekV15.jsx');
const members=load('../pages/PlazaMembersV15.jsx');
const inventory=load('../pages/PlazaInventoryV16.jsx');

test('exact one complete master sprite per selected title, no repeated caption',()=>{
  assert.ok(title.includes('`${base}${titleKey}_master.png`'));
  assert.equal((title.match(/<img /g)||[]).length,1);
  assert.ok(title.includes('plaza-prestige-v18__art'));
  assert.ok(!title.includes('plaza-prestige-v18__icon'));
  assert.ok(!title.includes('plaza-prestige-v18__name'));
  assert.ok(!title.includes('title.label}</span>'));
  assert.ok(title.includes('aria-label={`${title.label}, ${title.stars} sao`}'));
});
test('all contexts use the same complete source with its original aspect ratio',()=>{
  assert.match(css,/FULL ARTWORK \/ NO DUPLICATE LABEL/);
  assert.match(css,/\.plaza-prestige-v18__art\s*\{[\s\S]*?width: auto !important/);
  assert.match(css,/\.plaza-prestige-v18--identity,[\s\S]*?max-width: none !important/);
  assert.match(css,/\.plaza-prestige-v18--chat\s*\{[\s\S]*?width: max-content !important/);
  assert.match(css,/\.plaza-prestige-v18--micro\s*\{[\s\S]*?width: max-content !important/);
  assert.match(css,/\.plaza-prestige-v18--preview\s*\{[\s\S]*?width: max-content !important/);
  assert.match(css,/\.plaza-prestige-v18--wardrobe[\s\S]*?height: 108px !important/);
});
test('anchor keeps player name horizontally centered independently of badge width',()=>{
  assert.ok(labels.includes("el.className='plaza-v9-nameplate'"));
  assert.ok(labels.includes('className="plaza-v9-name"'));
  assert.ok(labels.indexOf('size="identity"')<labels.indexOf('className="plaza-v9-name"'));
  assert.match(css,/right: calc\(100% \+ 13px\) !important/);
  assert.match(css,/transform: translate\(-50%, calc\(-100% - 22px\)\) !important/);
  assert.match(css,/text-align: center !important/);
});
test('shop and social components use the shared full-title renderer',()=>{
  assert.ok(inventory.includes('size="wardrobe"'));
  assert.ok(chat.includes('size="chat"'));
  assert.ok(peek.includes('size="micro"'));
  assert.ok(members.includes('size="chat"'));
});
test('financial/tier source unchanged and VIP remains empty future slot',()=>{
  assert.ok(title.includes('gold:2,partner:2,champion:2,diamond:3,loyal_partner:3'));
  assert.ok(title.includes('idol:1,hof_3:1,ngoi_sao:2,hof_2:2,minh_tinh:3,hof_1:3'));
  assert.ok(!title.includes('walletBalance'));
  assert.ok(!title.includes('coinBalance'));
  assert.ok(labels.includes('plaza-v18-vip-slot'));
});
test('glitter remains tiered and respects reduced motion',()=>{
  assert.ok(css.includes('.plaza-prestige-v18--level1 .plaza-prestige-v18__art'));
  assert.ok(css.includes('.plaza-prestige-v18--level2 .plaza-prestige-v18__art'));
  assert.ok(css.includes('.plaza-prestige-v18--level3 .plaza-prestige-v18__art'));
  assert.ok(css.includes('prefers-reduced-motion: reduce'));
  assert.ok(css.includes('plaza-prestige-v18--level0:before'));
});

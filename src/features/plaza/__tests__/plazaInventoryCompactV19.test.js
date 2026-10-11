import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const component = readFileSync(new URL('../pages/PlazaInventoryV16.jsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../pages/PlazaInventoryV19.css', import.meta.url), 'utf8');

test('real 3-Coin loudspeaker only, no fabricated commercial catalog', () => {
  assert.match(component, /Loa thế giới/);
  assert.match(component, /3 Coin \/ loa/);
  assert.match(component, /buy_loudspeaker/);
  assert.match(component, /social\.run\(pending\.op, \{ quantity: pending\.quantity \}\)/);
});
test('compact item opens details before purchase confirmation', () => {
  assert.match(component, /setDetail\(\{ type: 'loudspeaker' \}\)/);
  assert.match(component, /requestLoudspeakerPurchase/);
  assert.match(component, /setConfirm\(\{/);
  assert.match(component, /aria-modal="true"/);
});
test('Coin top-up is an assets-row trigger, never a bottom panel', () => {
  assert.match(component, /plaza-v19-topup-trigger/);
  assert.match(component, /setTopupMode\(\'choose\'\)/);
  assert.doesNotMatch(component, /className="plaza-v16-topup"/);
  assert.match(component, /op\s*:\s*'convert'/);
  assert.match(component, /integerInRange\(topup, 1000000\)/);
});
test('title entitlements and identity remain server sourced', () => {
  assert.match(component, /new Set\(identity\?\.ownedBadges/);
  assert.match(component, /onChooseBadge\(key\)/);
  assert.match(component, /PlazaTitleV10/);
  assert.doesNotMatch(component, /op: 'buy_title'/);
});
test('real 3D canvas is preserved and mobile uses vertical split', () => {
  assert.match(component, /PlazaAvatarPreviewV16/);
  assert.match(css, /grid-template-rows: minmax\(210px, 42%\) minmax\(0, 1fr\)/);
  assert.match(css, /repeat\(3, minmax\(0,1fr\)\)/);
  assert.match(css, /overscroll-behavior: contain/);
});
test('shop card has art, title, price and one-click detail', () => {
  assert.match(component, /plaza-v19-card-art/);
  assert.match(component, /plaza-v19-card-name/);
  assert.match(component, /plaza-v19-price/);
  assert.match(component, /plaza-v19-item-grid/);
});

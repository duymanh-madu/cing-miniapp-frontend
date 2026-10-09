import test from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import { orbitPoseV10, createPlazaCameraV10 } from "../scene/plazaCameraV10.js";
import { refinePlazaAvatarSurfaceV10 } from "../scene/plazaAvatarSurfaceV10.js";
import { PLAZA_TITLES_V10 } from "../pages/plazaTitleCatalogV10.js";
const bounds = { minX: -20, maxX: 39, minZ: -38, maxZ: 13 };
test("orbit camera stops at boundary, clears floor and does not rewrite user radius or FOV", () => {
  const c = new T.PerspectiveCamera(45, 1, 0.08, 120),
    el = new EventTarget();
  el.clientHeight = 800;
  el.setPointerCapture = () => {};
  const control = createPlazaCameraV10(c, el, bounds, { floorAt: () => 1 });
  c.position.set(8, 5, 8);
  control.sync();
  const radius = control.requestedRadius;
  control.update(new T.Vector3(35, 0.9, 0));
  const wall = c.position.x;
  control.update(new T.Vector3(36, 0.9, 0));
  assert.equal(c.position.x, wall);
  assert.equal(wall, bounds.maxX - 0.35);
  assert.equal(control.requestedRadius, radius);
  assert.equal(c.fov, 45);
  for (let a = 0; a < Math.PI * 2; a += 0.2) {
    const p = orbitPoseV10(
      new T.Vector3(38.5, 0.9, 12.5),
      a,
      1.48,
      42,
      bounds,
      1,
    );
    assert(p.x <= 38.65 && p.z <= 12.65 && p.y >= 1.25);
  }
  control.dispose();
});
test("pinch distance immediately changes radius by inverse ratio and drag is immediate without inertia", () => {
  const c = new T.PerspectiveCamera(),
    el = new EventTarget();
  el.clientHeight = 800;
  el.setPointerCapture = () => {};
  const ctl = createPlazaCameraV10(c, el, bounds);
  function send(type, id, x, y) {
    const e = new Event(type, { cancelable: true });
    Object.assign(e, {
      pointerId: id,
      pointerType: "touch",
      clientX: x,
      clientY: y,
    });
    el.dispatchEvent(e);
  }
  const r = ctl.requestedRadius;
  send("pointerdown", 1, 100, 100);
  send("pointerdown", 2, 200, 100);
  send("pointermove", 2, 300, 100);
  assert.equal(ctl.requestedRadius, r / 2);
  send("pointerup", 2, 300, 100);
  const a = ctl.yaw;
  send("pointermove", 1, 180, 100);
  assert.notEqual(ctl.yaw, a);
  send("pointerup", 1, 180, 100);
  const y = ctl.yaw;
  ctl.update();
  ctl.update();
  assert.equal(ctl.yaw, y);
  ctl.dispose();
});
test("avatar surface keeps authored base shading and disables only MToon outline passes", () => {
  const base = {
      isMToonMaterial: true,
      isOutline: false,
      visible: true,
      outlineWidthMode: "worldCoordinates",
    },
    outline = { isMToonMaterial: true, isOutline: true, visible: true },
    other = { visible: true };
  const root = { traverse: (f) => f({ material: [base, outline, other] }) };
  assert.equal(refinePlazaAvatarSurfaceV10(root).outlines, 1);
  assert.equal(base.visible, true);
  assert.equal(base.outlineWidthMode, "none");
  assert.equal(outline.visible, false);
  assert.equal(other.visible, true);
});
test("premium title catalog preserves earned star levels including half stars", () => {
  assert.equal(PLAZA_TITLES_V10.gold.stars, 3.5);
  assert.equal(PLAZA_TITLES_V10.hof_2.stars, 4.5);
  assert.equal(PLAZA_TITLES_V10.minh_tinh.stars, 5);
  assert.equal(Object.keys(PLAZA_TITLES_V10).length, 14);
});

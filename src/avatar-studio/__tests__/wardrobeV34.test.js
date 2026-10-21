import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  Vector3,
  Triangle,
  Group,
  Bone,
  SkinnedMesh,
  BoxGeometry,
  MeshBasicMaterial,
  Skeleton,
  BufferGeometry,
  Float32BufferAttribute,
} from "three";
import {
  createWardrobeFitting,
  wardrobeAsset,
  WARDROBE_STYLES,
} from "../wardrobeV34.js";
function parse(file) {
  const b = fs.readFileSync(
      new URL("../../../public/cing-plaza/assets/" + file, import.meta.url),
    ),
    n = b.readUInt32LE(12);
  return { b, g: JSON.parse(b.subarray(20, 20 + n)), bin: b.subarray(n + 28) };
}
const sizes = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
function read({ g, bin }, ai) {
  const a = g.accessors[ai],
    v = g.bufferViews[a.bufferView],
    width = sizes[a.type],
    size = a.componentType === 5126 || a.componentType === 5125 ? 4 : 2;
  return Array.from({ length: a.count }, (_, i) =>
    Array.from({ length: width }, (_, j) => {
      const offset =
        (v.byteOffset || 0) +
        (a.byteOffset || 0) +
        i * (v.byteStride || size * width) +
        j * size;
      return a.componentType === 5126
        ? bin.readFloatLE(offset)
        : size === 4
          ? bin.readUInt32LE(offset)
          : bin.readUInt16LE(offset);
    }),
  );
}
for (const sex of ["boy", "girl"])
  for (const style of WARDROBE_STYLES)
    test(`${sex}/${style}: original rig, finite geometry and mobile budgets`, () => {
      const f = parse(wardrobeAsset(sex, style)),
        { g } = f;
      assert.ok(f.b.length < 2200000);
      assert.equal(g.meshes.length, sex === "girl" ? 4 : 3);
      let tris = 0;
      const base = parse(
        sex === "girl"
          ? "v32/cing-girl-modular-v32.vrm"
          : "v30/cing-boy-modular-v30.vrm",
      );
      const names = new Set(base.g.nodes.map((n) => n.name));
      for (const j of g.skins[0].joints) assert.ok(names.has(g.nodes[j].name));
      for (const mesh of g.meshes)
        for (const p of mesh.primitives) {
          tris += g.accessors[p.indices].count / 3;
          const pos = read(f, p.attributes.POSITION),
            norm = read(f, p.attributes.NORMAL),
            uv = read(f, p.attributes.TEXCOORD_0),
            js = read(f, p.attributes.JOINTS_0),
            ws = read(f, p.attributes.WEIGHTS_0),
            idx = read(f, p.indices).flat();
          assert.ok(idx.every((i) => i < pos.length));
          const keys = pos.map((v) =>
              v.map((x) => Math.round(x * 1e5)).join(","),
            ),
            edges = new Map();
          for (let i = 0; i < idx.length; i += 3)
            for (let k = 0; k < 3; k++) {
              const pair = [keys[idx[i + k]], keys[idx[i + ((k + 1) % 3)]]]
                .sort()
                .join("|");
              edges.set(pair, (edges.get(pair) || 0) + 1);
            }
          assert.equal(
            [...edges.values()].filter((n) => n === 1).length,
            0,
            mesh.name + " has an open fabric boundary",
          );
          if (
            sex === "boy" &&
            style === "royal" &&
            mesh.name.startsWith("Shoes_")
          )
            assert.ok(
              Math.max(...pos.map((v) => v[1])) <= 0.161,
              "Boot shaft must remain inside the trouser hem",
            );
          if (sex === "girl" && mesh.name.startsWith("Bottom_"))
            assert.ok(
              Math.max(...pos.map((v) => v[1])) < 1.022,
              "Discard detached chest fragments before building shorts/waist facing",
            );
          assert.ok(pos.every((v) => v.every(Number.isFinite)));
          assert.ok(
            norm.every(
              (v) =>
                v.every(Number.isFinite) &&
                v.reduce((a, b) => a + b * b, 0) > 0.5,
            ),
          );
          assert.ok(
            uv.every((v) =>
              v.every((x) => Number.isFinite(x) && x >= 0 && x <= 2.001),
            ),
          );
          assert.ok(
            js.every((v) => v.every((x) => x < g.skins[0].joints.length)),
          );
          assert.ok(
            ws.every(
              (v) =>
                v.every((x) => x >= 0 && Number.isFinite(x)) &&
                Math.abs(v.reduce((a, b) => a + b, 0) - 1) < 1e-5,
            ),
          );
        }
      assert.ok(tris < 19000);
      assert.ok(g.images.length <= 3);
      assert.ok(g.images.every((i) => i.mimeType === "image/webp"));
      // UV split collar points must remain coincident under any linear skinning transform.
      if (sex === "boy") {
        assert.equal(g.extras.cingCollarSeams[0].pairs.length, 20);
        for (const seam of g.extras.cingCollarSeams) {
          const p = g.meshes[seam.mesh].primitives[0],
            pos = read(f, p.attributes.POSITION),
            j = read(f, p.attributes.JOINTS_0),
            w = read(f, p.attributes.WEIGHTS_0);
          for (const [a, b] of seam.pairs) {
            assert.deepEqual(pos[a], pos[b]);
            assert.deepEqual(j[a], j[b]);
            assert.deepEqual(w[a], w[b]);
          }
        }
      }
    });
function actor() {
  const root = new Group(),
    bone = new Bone();
  bone.name = "hips";
  root.add(bone);
  for (const slot of ["top", "bottom", "shoes"]) {
    const mesh = new SkinnedMesh(new BoxGeometry(), new MeshBasicMaterial());
    mesh.name = slot + "_sample";
    mesh.userData.cingAppearanceSlot = slot;
    mesh.bind(new Skeleton([bone]));
    root.add(mesh);
  }
  return root;
}
for (const character of ["boy", "girl"])
  test(`${character}: independent swaps, cancellation and disposal`, async () => {
    const root = actor(),
      asset = actor(),
      body = new SkinnedMesh(new BufferGeometry(), new MeshBasicMaterial());
    body.material.name = "Body_SKIN";
    body.geometry.setAttribute(
      "position",
      new Float32BufferAttribute(
        [
          0, 1.2, 0, 0.02, 1.2, 0, 0, 1.22, 0, 0, 1.55, 0, 0.02, 1.55, 0, 0,
          1.56, 0,
        ],
        3,
      ),
    );
    body.geometry.setIndex([0, 1, 2, 3, 4, 5]);
    root.add(body);
    const original = body.geometry;
    let resolve;
    const fitting = createWardrobeFitting(
      root,
      async (path) =>
        path.includes("street")
          ? new Promise((r) => (resolve = r))
          : { scene: asset },
      { character },
    );
    for (const style of ["campus", "royal"]) {
      await fitting.apply({ top: style, bottom: style, shoes: style });
      assert.equal(root.children.filter((x) => x.isMesh).length, 7);
      assert.equal(body.geometry.drawRange.count, 3);
      await fitting.apply({});
      assert.equal(body.geometry, original);
      assert.equal(root.children.filter((x) => x.isMesh).length, 4);
    }
    const pending = fitting.apply({ top: "street" });
    await fitting.apply({});
    resolve({ scene: asset });
    await pending;
    assert.equal(root.children.filter((x) => x.isMesh).length, 4);
    const leaving = fitting.apply({ top: "street" });
    fitting.dispose();
    resolve({ scene: asset });
    await leaving;
    assert.equal(body.geometry, original);
    assert.ok(root.children.filter((x) => x.isMesh).every((x) => x.visible));
  });
test("unknown catalogue input cannot load arbitrary assets", () => {
  assert.equal(wardrobeAsset("boy", "../private"), null);
  assert.equal(wardrobeAsset("other", "campus"), null);
});

function frontHit(pos, indices, x, y) {
  let front = -Infinity;
  for (let i = 0; i < indices.length; i += 3) {
    const a = pos[indices[i]],
      b = pos[indices[i + 1]],
      c = pos[indices[i + 2]],
      den = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]);
    if (Math.abs(den) < 1e-12) continue;
    const u = ((b[1] - c[1]) * (x - c[0]) + (c[0] - b[0]) * (y - c[1])) / den,
      v = ((c[1] - a[1]) * (x - c[0]) + (a[0] - c[0]) * (y - c[1])) / den,
      w = 1 - u - v;
    if (Math.min(u, v, w) >= -1e-6)
      front = Math.max(front, u * a[2] + v * b[2] + w * c[2]);
  }
  return front;
}
for (const style of WARDROBE_STYLES)
  test(`girl/${style}: continuous abdomen and full collar, not just a lined hole`, () => {
    const f = parse(wardrobeAsset("girl", style)),
      g = f.g,
      mesh = g.meshes.find((m) =>
        g.materials[m.primitives[0].material].name.includes("ContinuousBlouse"),
      ),
      p = mesh.primitives[0],
      pos = read(f, p.attributes.POSITION),
      idx = read(f, p.indices).flat();
    for (const y of [1.045, 1.075, 1.105, 1.135])
      for (const x of [-0.04, 0, 0.04])
        assert.ok(
          frontHit(pos, idx, x, y) > 0.075,
          `Uncovered abdomen at ${x},${y}`,
        );
    assert.ok(
      Math.max(...pos.map((v) => v[1])) > 1.437,
      "The front neck must extend to the actual collar, not end below it",
    );
    const vertices = new Set(
        pos.map((v) => v.map((x) => Math.round(x * 1e5)).join(",")),
      ),
      keys = pos.map((v) => v.map((x) => Math.round(x * 1e5)).join(",")),
      edges = new Set();
    for (let i = 0; i < idx.length; i += 3)
      for (let k = 0; k < 3; k++)
        edges.add(
          [keys[idx[i + k]], keys[idx[i + ((k + 1) % 3)]]].sort().join("|"),
        );
    assert.equal(
      vertices.size - edges.size + idx.length / 3,
      0,
      "The blouse should have only neck/hem cavity, without inherited arm/abdomen cutouts",
    );
  });
test("girl torso coverage includes the authored cutout region and restores the body on removal", async () => {
  const root = actor(),
    asset = actor(),
    body = new SkinnedMesh(new BufferGeometry(), new MeshBasicMaterial());
  body.material.name = "Body_SKIN";
  body.geometry.setAttribute(
    "position",
    new Float32BufferAttribute(
      [
        -0.1, 0.84, 0, 0.1, 0.84, 0, 0, 1.43, 0, 0, 1.5, 0, 0.01, 1.5, 0, 0,
        1.51, 0,
      ],
      3,
    ),
  );
  body.geometry.setIndex([0, 1, 2, 3, 4, 5]);
  root.add(body);
  const original = body.geometry,
    fitting = createWardrobeFitting(root, async () => ({ scene: asset }), {
      character: "girl",
    });
  await fitting.apply({ top: "campus" });
  assert.equal(body.geometry.drawRange.count, 3);
  await fitting.apply({});
  assert.equal(body.geometry, original);
  fitting.dispose();
});

function slice(f, primitive, height) {
  const positions = read(f, primitive.attributes.POSITION),
    indices = read(f, primitive.indices).flat(),
    segments = [];
  for (let i = 0; i < indices.length; i += 3) {
    const points = [];
    for (let k = 0; k < 3; k++) {
      const a = positions[indices[i + k]],
        b = positions[indices[i + ((k + 1) % 3)]];
      if (
        (a[1] <= height && height < b[1]) ||
        (b[1] <= height && height < a[1])
      ) {
        const t = (height - a[1]) / (b[1] - a[1]);
        points.push([a[0] + t * (b[0] - a[0]), a[2] + t * (b[2] - a[2])]);
      }
    }
    if (points.length === 2) segments.push(points);
  }
  return segments;
}
function radius(segments, center, theta) {
  const dx = Math.sin(theta),
    dz = Math.cos(theta),
    hits = [];
  for (const [a, b] of segments) {
    const ax = a[0],
      az = a[1] - center,
      ex = b[0] - a[0],
      ez = b[1] - a[1],
      den = dx * ez - dz * ex;
    if (Math.abs(den) < 1e-10) continue;
    const t = (ax * ez - az * ex) / den,
      u = (ax * dz - az * dx) / den;
    if (t > 0 && u >= -1e-5 && u <= 1.00001) hits.push(t);
  }
  return hits.length ? Math.max(...hits) : null;
}
for (const style of WARDROBE_STYLES)
  test(`girl/${style}: waistband follows the blouse within 7 mm around the entire waist`, () => {
    const f = parse(wardrobeAsset("girl", style)),
      blouse = f.g.meshes.find((m) => m.name === "Top_1").primitives[0],
      bottom = f.g.meshes.find((m) => m.name.startsWith("Bottom_"))
        .primitives[0];
    const topSlice = slice(f, blouse, 1.0198),
      bottomSlice = slice(f, bottom, 1.0198),
      zs = topSlice.flat().map((p) => p[1]),
      center = (Math.min(...zs) + Math.max(...zs)) / 2;
    for (let i = 0; i < 56; i++) {
      const angle = ((i + 0.37) * Math.PI * 2) / 56,
        a = radius(topSlice, center, angle),
        b = radius(bottomSlice, center, angle);
      assert.notEqual(a, null);
      assert.notEqual(b, null);
      assert.ok(
        b - a >= -0.002 && b - a < 0.007,
        `Waist mismatch ${(b - a) * 1000} mm at angle ${angle}`,
      );
    }
  });

for (const style of WARDROBE_STYLES)
  test(`boy/${style}: collar follows the real neck with less than 4.5 mm clearance`, () => {
    const f = parse(wardrobeAsset("boy", style)),
      base = parse("v30/cing-boy-modular-v30.vrm");
    const body = base.g.meshes
      .flatMap((m) => m.primitives)
      .find((p) =>
        /Body.*SKIN/i.test(base.g.materials[p.material]?.name || ""),
      );
    assert.ok(body);
    const positions = read(base, body.attributes.POSITION),
      indices = read(base, body.indices).flat(),
      triangles = [];
    for (let i = 0; i < indices.length; i += 3) {
      const vs = indices.slice(i, i + 3).map((j) => positions[j]);
      if (
        Math.min(...vs.map((v) => v[1])) < 1.54 &&
        Math.max(...vs.map((v) => v[1])) > 1.49
      )
        triangles.push(new Triangle(...vs.map((v) => new Vector3(...v))));
    }
    const top = f.g.meshes.find((m) => m.name.startsWith("Top_")).primitives[0],
      ring = read(f, top.attributes.POSITION).filter(
        (v) => Math.abs(v[1] - 1.528) < 1e-5,
      );
    assert.ok(ring.length >= 18);
    for (const v of ring) {
      const point = new Vector3(...v);
      let gap = Infinity;
      for (const triangle of triangles)
        gap = Math.min(
          gap,
          triangle.closestPointToPoint(point, new Vector3()).distanceTo(point),
        );
      assert.ok(gap < 0.0045, `Collar clearance ${gap * 1000} mm`);
    }
  });
for (const style of WARDROBE_STYLES)
  test(`girl/${style}: tucked shirt tail stays inside the bottom below the waistband`, () => {
    const f = parse(wardrobeAsset("girl", style)),
      blouse = f.g.meshes.find((m) => m.name === "Top_1").primitives[0],
      bottom = f.g.meshes.find((m) => m.name.startsWith("Bottom_"))
        .primitives[0];
    const waist = slice(f, blouse, 1.0198),
      zs = waist.flat().map((p) => p[1]),
      center = (Math.min(...zs) + Math.max(...zs)) / 2;
    for (const y of [0.975, 0.99, 1.005]) {
      const shirt = slice(f, blouse, y),
        pants = slice(f, bottom, y);
      for (let i = 0; i < 56; i++) {
        const angle = ((i + 0.37) * Math.PI * 2) / 56,
          a = radius(shirt, center, angle),
          b = radius(pants, center, angle);
        assert.ok(a !== null && b !== null);
        assert.ok(
          a + 0.0005 < b,
          `Shirt pierces ${style} at ${y}, angle ${angle}: ${(a - b) * 1000} mm`,
        );
      }
    }
  });

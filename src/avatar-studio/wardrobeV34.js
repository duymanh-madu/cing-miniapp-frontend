import { BufferAttribute } from "three";
import { attachPlazaGarmentV27 } from "../features/plaza/scene/plazaGarmentV27.js";
export const WARDROBE_STYLES = Object.freeze(["campus", "royal", "street"]);
export const wardrobeBase = (character) =>
  character === "girl"
    ? "v32/cing-girl-modular-v32.vrm"
    : "v30/cing-boy-modular-v30.vrm";
export function wardrobeAsset(character, style) {
  if (!["boy", "girl"].includes(character) || !WARDROBE_STYLES.includes(style))
    return null;
  return `v34/${character}-${style}-v34.glb`;
}
const SLOTS = ["top", "bottom", "shoes"];
// Preview-only wardrobe: nothing here writes inventory, wallet or room presence.
export function createWardrobeFitting(root, load, { character = "boy" } = {}) {
  let generation = 0,
    disposed = false,
    current = [],
    key = "";
  const bodies = [];
  root.traverse((mesh) => {
    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];
    if (
      mesh.isSkinnedMesh &&
      mesh.geometry.index &&
      materials.some((m) => /Body.*SKIN/i.test(m?.name || ""))
    ) {
      // Find the authored central torso once. The continuous shirt fully replaces it.
      const index = mesh.geometry.index,
        pos = mesh.geometry.attributes.position,
        adj = new Map();
      for (let i = 0; i < index.count; i += 3) {
        const f = [index.getX(i), index.getX(i + 1), index.getX(i + 2)];
        for (const a of f) {
          if (!adj.has(a)) adj.set(a, new Set());
          for (const b of f) adj.get(a).add(b);
        }
      }
      const rem = new Set(adj.keys()),
        torso = new Set();
      while (rem.size) {
        const first = rem.values().next().value;
        rem.delete(first);
        const pending = [first],
          component = [];
        let minY = Infinity,
          maxY = -Infinity,
          maxX = 0;
        while (pending.length) {
          const a = pending.pop();
          component.push(a);
          minY = Math.min(minY, pos.getY(a));
          maxY = Math.max(maxY, pos.getY(a));
          maxX = Math.max(maxX, Math.abs(pos.getX(a)));
          for (const b of adj.get(a)) if (rem.delete(b)) pending.push(b);
        }
        if (minY < 0.9 && maxY > 1.4 && maxX < 0.2)
          for (const v of component) torso.add(v);
      }
      bodies.push({ mesh, original: mesh.geometry, private: null, torso });
    }
  });
  function cover(parts) {
    for (const body of bodies) {
      if (!Object.values(parts).some(Boolean)) {
        body.mesh.geometry = body.original;
        continue;
      }
      const positions = body.original.attributes.position,
        index = body.original.index,
        kept = [];
      const girl = character === "girl",
        top = parts.top,
        bottom = parts.bottom,
        shoe = parts.shoes;
      const topHem = girl
        ? 0.995
        : top === "campus"
          ? 0.995
          : top === "royal"
            ? 0.88
            : 0.94;
      const bottomHem = girl
        ? bottom === "campus"
          ? 0.7
          : bottom === "royal"
            ? 0.59
            : 0.76
        : bottom === "street"
          ? 0.61
          : 0.15;
      const bootTop =
        shoe === "royal"
          ? girl
            ? 0.265
            : 0.16
          : girl
            ? shoe === "street"
              ? 0.175
              : 0.11
            : 0.105;
      for (let i = 0; i < index.count; i += 3) {
        const isTorso =
          girl &&
          top &&
          [0, 1, 2].every((j) => body.torso.has(index.getX(i + j)));
        const covered =
          isTorso ||
          [0, 1, 2].every((j) => {
            const v = index.getX(i + j),
              x = Math.abs(positions.getX(v)),
              y = positions.getY(v);
            const underTop =
              top &&
              ((x < (girl ? 0.15 : 0.18) &&
                y > topHem &&
                y < (girl ? 1.36 : 1.465)) ||
                (x > (girl ? 0.13 : 0.15) &&
                  x < (girl ? 0.56 : 0.625) &&
                  Math.abs(y - (girl ? 1.287 : 1.42356)) <
                    (girl ? 0.085 : 0.095)));
            const underBottom =
              bottom &&
              x < (girl ? 0.21 : 0.2) &&
              y > bottomHem + 0.005 &&
              y < (girl ? 0.995 : 1.015);
            return underTop || underBottom || (shoe && y < bootTop - 0.01);
          });
        if (!covered) for (let j = 0; j < 3; j++) kept.push(index.getX(i + j));
      }
      if (!body.private) {
        body.private = body.original.clone();
        body.private.setIndex(
          new BufferAttribute(new Uint32Array(index.count), 1),
        );
      }
      body.private.index.array.set(kept);
      body.private.index.needsUpdate = true;
      body.private.setDrawRange(0, kept.length);
      body.mesh.geometry = body.private;
    }
  }
  return {
    async apply(recipe = {}) {
      const parts = Object.fromEntries(
        SLOTS.map((slot) => [
          slot,
          WARDROBE_STYLES.includes(recipe[slot]) ? recipe[slot] : null,
        ]),
      );
      const mine = ++generation,
        nextKey = JSON.stringify(parts);
      if (disposed || nextKey === key) return false;
      const assets = await Promise.all(
        SLOTS.map(async (slot) => ({
          slot,
          asset: parts[slot]
            ? await load(wardrobeAsset(character, parts[slot]))
            : null,
        })),
      );
      if (disposed || mine !== generation) return false;
      const names = new Set();
      root.traverse((o) => {
        if (o.isBone) names.add(o.name);
      });
      for (const { asset } of assets)
        if (asset)
          asset.scene.traverse((o) => {
            if (
              o.isSkinnedMesh &&
              o.skeleton.bones.some((b) => !names.has(b.name))
            )
              throw Error("GARMENT_RIG_MISMATCH");
          });
      current.forEach((x) => x.dispose());
      current = [];
      try {
        for (const { slot, asset } of assets)
          if (asset)
            current.push(
              attachPlazaGarmentV27(root, asset.scene, slot, { part: slot }),
            );
        cover(parts);
        key = nextKey;
        return true;
      } catch (error) {
        current.forEach((x) => x.dispose());
        current = [];
        cover({});
        key = "";
        throw error;
      }
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      generation++;
      current.forEach((x) => x.dispose());
      current = [];
      for (const b of bodies) {
        b.mesh.geometry = b.original;
        b.private?.dispose();
      }
    },
  };
}

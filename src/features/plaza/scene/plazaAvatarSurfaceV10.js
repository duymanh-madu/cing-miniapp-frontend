// The supplied VRMs have sub-millimetre inverted-hull outlines. At mobile
// resolution they rasterize as isolated dark pixels; keep the authored base
// MToon shading and facial textures, omit that extra silhouette pass.
export function refinePlazaAvatarSurfaceV10(root) {
  let outlines = 0;
  const seen = new Set();
  root.traverse((o) => {
    for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
      if (!m || seen.has(m) || !m.isMToonMaterial) continue;
      seen.add(m);
      if (m.isOutline) {
        m.visible = false;
        outlines++;
      } else {
        m.outlineWidthMode = "none";
        m.alphaToCoverage = m.alphaTest > 0;
        m.needsUpdate = true;
      }
    }
  });
  return { outlines };
}

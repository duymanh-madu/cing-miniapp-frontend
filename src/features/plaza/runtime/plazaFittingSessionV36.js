// Private to one Plaza visit; unpaid try-ons never enter account/storage.
export function applyFittingItemV36(recipe = {}, item) {
  const next = { ...recipe };
  if (item.slot === "outfit")
    for (const slot of ["top", "bottom", "shoes"]) delete next[slot];
  next[item.slot] = item.id;
  return next;
}
export function createFittingSessionV36() {
  let drafts = {},
    generation = 0;
  const listeners = new Set(),
    assets = new Map();
  const emit = () => listeners.forEach((fn) => fn());
  return {
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    getSnapshot: () => drafts,
    tryItem(character, item) {
      drafts = {
        ...drafts,
        [character]: applyFittingItemV36(drafts[character], item),
      };
      emit();
    },
    accept(character, slot, catalog = []) {
      let next = {...drafts[character]};
      const outfit = catalog.find(item => item.id === next.outfit);
      if (outfit && slot !== 'outfit') {
        for (const part of ['top','bottom','shoes']) if (!next[part]) {
          const item = catalog.find(item => item.character === character && item.style === outfit.style && item.slot === part);
          if (item) next[part] = item.id;
        }
        delete next.outfit;
      }
      if (slot === 'outfit') for (const part of ['top','bottom','shoes']) delete next[part];
      delete next[slot];
      drafts = {...drafts, [character]: next}; emit();
    },
    clear(character) {
      drafts = { ...drafts, [character]: {} };
      emit();
    },
    load(file, load, release) {
      if (!assets.has(file)) {
        const epoch = generation;
        const promise = Promise.resolve()
          .then(() => load(file))
          .then((asset) => {
            if (epoch !== generation) {
              release(asset.scene);
              throw Error("FITTING_SESSION_ENDED");
            }
            return asset;
          })
          .catch((error) => {
            if (assets.get(file)?.promise === promise) assets.delete(file);
            throw error;
          });
        assets.set(file, { promise, release });
      }
      return assets.get(file).promise;
    },
    dispose() {
      generation++;
      for (const entry of assets.values())
        entry.promise
          .then((asset) => entry.release(asset.scene))
          .catch(() => {});
      assets.clear();
      drafts = {};
      emit();
    },
  };
}
export function optimisticEquipV36(appearance, itemId) {
  const item = appearance?.catalog?.find((item) => item.id === itemId);
  if (!item || !appearance.owned?.includes(itemId)) return null;
  return applyFittingItemV36(appearance.equipped, item);
}

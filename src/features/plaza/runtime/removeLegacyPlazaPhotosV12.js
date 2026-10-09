// Remove only the retired Plaza photo album. No database is opened or created.
export function removeLegacyPlazaPhotosV12(storage = globalThis.indexedDB) {
  if (!storage?.deleteDatabase) return Promise.resolve(false);
  return new Promise(resolve => {
    try {
      const request = storage.deleteDatabase('cing-plaza-photos-v11');
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
      // An old tab may hold the album open; deletion can complete after it closes.
      request.onblocked = () => resolve(false);
    } catch { resolve(false); }
  });
}

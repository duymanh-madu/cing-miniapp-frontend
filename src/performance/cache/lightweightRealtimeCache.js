const realtimeCache =
  new Map();

export function setRealtimeCache({

  key,

  value,

}) {

  realtimeCache.set(
    key,
    {
      value,
      createdAt:
        Date.now(),
    }
  );

}

export function getRealtimeCache(

  key

) {

  return realtimeCache.get(
    key
  );

}

export function clearRealtimeCache() {

  realtimeCache.clear();

}
const requestCache =
  new Map();

export function setRequestCache({

  key,

  value,

}) {

  requestCache.set(
    key,
    {
      value,
      timestamp:
        Date.now(),
    }
  );

}

export function getRequestCache(

  key

) {

  return requestCache.get(
    key
  );

}

export function clearRequestCache() {

  requestCache.clear();

}
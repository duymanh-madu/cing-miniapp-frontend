const dedupeMap =
  new Map();

export function shouldDedupe({

  key,

  windowMs,

}) {

  const now =
    Date.now();

  const existing =
    dedupeMap.get(key);

  if (

    existing &&

    now - existing < windowMs

  ) {

    return true;

  }

  dedupeMap.set(
    key,
    now
  );

  return false;

}
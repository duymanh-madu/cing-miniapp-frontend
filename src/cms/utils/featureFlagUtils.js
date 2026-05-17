export function isFeatureEnabled({

  flags,

  key,

}) {

  return Boolean(
    flags?.[key]
  );

}